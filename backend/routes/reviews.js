// Reviews routes — create and retrieve book reviews with ratings
import express from 'express';
import pool    from '../db.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /api/reviews?book_id= — returns all reviews for a specific book with author usernames
router.get('/', async (req, res, next) => {
  try {
    const { book_id } = req.query;

    if (!book_id) {
      return res.status(400).json({ success: false, message: 'book_id query param is required' });
    }

    const [reviews] = await pool.query(
      `SELECT r.*, u.username, u.full_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.book_id = ?
       ORDER BY r.created_at DESC`,
      [book_id]
    );

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

// POST /api/reviews — creates or updates a review for a book
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { book_id, rating, review_text } = req.body;

    if (!book_id || !rating) {
      return res.status(400).json({ success: false, message: 'book_id and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Upsert: update existing review if user already reviewed this book
    await pool.query(
      `INSERT INTO reviews (user_id, book_id, rating, review_text)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         rating      = VALUES(rating),
         review_text = VALUES(review_text),
         created_at  = CURRENT_TIMESTAMP`,
      [userId, book_id, rating, review_text || null]
    );

    const [savedReview] = await pool.query(
      `SELECT r.*, u.username, u.full_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.user_id = ? AND r.book_id = ?`,
      [userId, book_id]
    );

    res.json({ success: true, data: savedReview[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
