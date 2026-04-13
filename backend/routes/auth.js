import express  from 'express';
import bcrypt   from 'bcryptjs';
import jwt      from 'jsonwebtoken';
import pool     from '../db.js';

const router = express.Router();

// Signs a JWT token for the given user payload
const signToken = (user_id, username) => {
  return jwt.sign({ user_id, username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// POST /api/auth/register — creates a new user account with a hashed password
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, full_name, reading_goal } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }

    // Check if email is already taken
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password with bcrypt before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name, reading_goal) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name || null, reading_goal || 12]
    );

    const token = signToken(result.insertId, username);

    res.status(201).json({
      success: true,
      token,
      user: {
        user_id:   result.insertId,
        username,
        email,
        full_name: full_name || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login — authenticates user credentials and returns a JWT
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user.user_id, user.username);

    res.status(200).json({
      success: true,
      token,
      user: {
        user_id:   user.user_id,
        username:  user.username,
        email:     user.email,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
