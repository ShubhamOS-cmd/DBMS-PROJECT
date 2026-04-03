// Favorites routes — manage a user's favorited books
import express from 'express';
import pool    from '../db.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /api/favorites — returns all favorited books for the current user with book stats
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [favorites] = await pool.query(
      `SELECT
        f.fav_id, f.added_at,
        bs.*,
        rl.status AS my_status,
        rl.pages_read
       FROM favorites f
       JOIN book_stats bs ON f.book_id = bs.book_id
       LEFT JOIN reading_list rl ON f.book_id = rl.book_id AND rl.user_id = f.user_id
       WHERE f.user_id = ?
       ORDER BY f.added_at DESC`,
      [userId]
    );

    res.json({ success: true, data: favorites });
  } catch (error) {
    next(error);
  }
});

// POST /api/favorites/toggle — adds or removes a book from the user's favorites
router.post('/toggle', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { book_id } = req.body;

    if (!book_id) {
      return res.status(400).json({ success: false, message: 'book_id is required' });
    }

    const [existing] = await pool.query(
      'SELECT fav_id FROM favorites WHERE user_id = ? AND book_id = ?',
      [userId, book_id]
    );

    if (existing.length > 0) {
      // Remove from favorites
      await pool.query('DELETE FROM favorites WHERE user_id = ? AND book_id = ?', [userId, book_id]);
      return res.json({ success: true, favorited: false, message: 'Removed from favorites' });
    }

    // Add to favorites
    await pool.query('INSERT INTO favorites (user_id, book_id) VALUES (?, ?)', [userId, book_id]);
    res.json({ success: true, favorited: true, message: 'Added to favorites' });
  } catch (error) {
    next(error);
  }
});

export default router;
