// Reading session routes — log reading progress and auto-complete books via trigger
import express from 'express';
import pool    from '../db.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// POST /api/sessions — logs a new reading session and checks for book completion
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { book_id, pages_this_session, notes } = req.body;

    if (!book_id || !pages_this_session || pages_this_session <= 0) {
      return res.status(400).json({ success: false, message: 'book_id and pages_this_session (> 0) are required' });
    }

    // Ensure the book is in the user's reading list before logging a session
    await pool.query(
      `INSERT IGNORE INTO reading_list (user_id, book_id, status, start_date)
       VALUES (?, ?, 'currently_reading', CURDATE())`,
      [userId, book_id]
    );

    // Insert the session — the DB trigger will auto-update pages_read in reading_list
    await pool.query(
      'INSERT INTO reading_sessions (user_id, book_id, pages_this_session, notes) VALUES (?, ?, ?, ?)',
      [userId, book_id, pages_this_session, notes || null]
    );

    // Re-query to check if the user has finished the book after this session
    const [progressRows] = await pool.query(
      `SELECT rl.pages_read, rl.status, b.total_pages
       FROM reading_list rl
       JOIN books b ON rl.book_id = b.book_id
       WHERE rl.user_id = ? AND rl.book_id = ?`,
      [userId, book_id]
    );

    const progress = progressRows[0];
    let bookCompleted = false;

    // Auto-complete the book if all pages have been read
    if (progress && progress.pages_read >= progress.total_pages && progress.status !== 'completed') {
      await pool.query(
        `UPDATE reading_list
         SET status = 'completed', finish_date = CURDATE(), pages_read = ?
         WHERE user_id = ? AND book_id = ?`,
        [progress.total_pages, userId, book_id]
      );
      bookCompleted = true;
    }

    res.json({
      success:     true,
      message:     bookCompleted ? 'Session logged — book completed! 🎉' : 'Session logged successfully',
      completed:   bookCompleted,
      pages_read:  progress?.pages_read  || 0,
      total_pages: progress?.total_pages || 0,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/sessions/:book_id — returns all reading sessions for a specific book by the current user
router.get('/:book_id', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const bookId = req.params.book_id;

    const [sessions] = await pool.query(
      `SELECT * FROM reading_sessions
       WHERE user_id = ? AND book_id = ?
       ORDER BY session_date DESC`,
      [userId, bookId]
    );

    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

export default router;
