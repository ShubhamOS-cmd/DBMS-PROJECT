// Reading list routes — manage a user's personal book collection and reading statuses
import express from 'express';
import pool    from '../db.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /api/reading-list — returns all books in the user's reading list with progress
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { status } = req.query;

    let query = `
      SELECT
        rl.*,
        b.title, b.author, b.genre, b.total_pages,
        b.cover_color, b.description, b.publication_year,
        bs.avg_rating, bs.total_reviews,
        ROUND((rl.pages_read / b.total_pages) * 100) AS percent_done,
        IF(f.fav_id IS NOT NULL, TRUE, FALSE) AS is_favorite
      FROM reading_list rl
      JOIN books      b  ON rl.book_id = b.book_id
      JOIN book_stats bs ON rl.book_id = bs.book_id
      LEFT JOIN favorites f ON rl.book_id = f.book_id AND f.user_id = rl.user_id
      WHERE rl.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND rl.status = ?';
      params.push(status);
    }

    query += ' ORDER BY rl.date_added DESC';

    const [books] = await pool.query(query, params);
    res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
});

// POST /api/reading-list — adds a book to the user's list or updates its status
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { book_id, status = 'want_to_read' } = req.body;

    if (!book_id) {
      return res.status(400).json({ success: false, message: 'book_id is required' });
    }

    // Set start_date when user begins actively reading
    const startDate = status === 'currently_reading' ? new Date().toISOString().split('T')[0] : null;

    await pool.query(
      `INSERT INTO reading_list (user_id, book_id, status, start_date)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status     = VALUES(status),
         start_date = IF(status != 'currently_reading' AND VALUES(status) = 'currently_reading' AND start_date IS NULL, VALUES(start_date), start_date)`,
      [userId, book_id, status, startDate]
    );

    res.status(201).json({ success: true, message: 'Book added to reading list' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/reading-list/:book_id — updates a book's reading status
router.put('/:book_id', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const bookId = req.params.book_id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    // When completing a book, set finish date and ensure pages_read equals total pages
    if (status === 'completed') {
      const [bookRows] = await pool.query('SELECT total_pages FROM books WHERE book_id = ?', [bookId]);
      const totalPages = bookRows[0]?.total_pages || 0;

      await pool.query(
        `UPDATE reading_list
         SET status = ?, finish_date = CURDATE(), pages_read = ?
         WHERE user_id = ? AND book_id = ?`,
        [status, totalPages, userId, bookId]
      );
    } else if (status === 'currently_reading') {
      await pool.query(
        `UPDATE reading_list
         SET status = ?, start_date = IF(start_date IS NULL, CURDATE(), start_date)
         WHERE user_id = ? AND book_id = ?`,
        [status, userId, bookId]
      );
    } else {
      await pool.query(
        'UPDATE reading_list SET status = ? WHERE user_id = ? AND book_id = ?',
        [status, userId, bookId]
      );
    }

    res.json({ success: true, message: 'Reading status updated' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reading-list/:book_id — removes a book and all its sessions from the user's list
router.delete('/:book_id', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const bookId = req.params.book_id;

    await pool.query(
      'DELETE FROM reading_sessions WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
    await pool.query(
      'DELETE FROM reading_list WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    res.json({ success: true, message: 'Book removed from reading list' });
  } catch (error) {
    next(error);
  }
});

export default router;
