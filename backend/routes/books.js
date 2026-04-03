// Books routes — browse, search, and view book details from book_stats view
import express from 'express';
import pool    from '../db.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /api/books — returns all books with current user's status and favorite flag
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { genre } = req.query;

    let query = `
      SELECT
        bs.*,
        rl.status    AS my_status,
        rl.pages_read,
        IF(f.fav_id IS NOT NULL, TRUE, FALSE) AS is_favorite
      FROM book_stats bs
      LEFT JOIN reading_list rl ON bs.book_id = rl.book_id AND rl.user_id = ?
      LEFT JOIN favorites    f  ON bs.book_id = f.book_id  AND f.user_id  = ?
    `;
    const params = [userId, userId];

    if (genre) {
      query += ' WHERE bs.genre = ?';
      params.push(genre);
    }

    query += ' ORDER BY bs.title';

    const [books] = await pool.query(query, params);
    res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
});

// GET /api/books/search?q= — searches books by title, author, or genre
router.get('/search', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { q } = req.query;

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${q}%`;
    const [books] = await pool.query(
      `SELECT
        bs.*,
        rl.status    AS my_status,
        rl.pages_read,
        IF(f.fav_id IS NOT NULL, TRUE, FALSE) AS is_favorite
      FROM book_stats bs
      LEFT JOIN reading_list rl ON bs.book_id = rl.book_id AND rl.user_id = ?
      LEFT JOIN favorites    f  ON bs.book_id = f.book_id  AND f.user_id  = ?
      WHERE bs.title LIKE ? OR bs.author LIKE ? OR bs.genre LIKE ?
      ORDER BY bs.avg_rating DESC`,
      [userId, userId, searchTerm, searchTerm, searchTerm]
    );

    res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
});

// GET /api/books/top-rated — returns the top 5 highest-rated books with at least one review
router.get('/top-rated', async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [books] = await pool.query(
      `SELECT
        bs.*,
        rl.status AS my_status,
        IF(f.fav_id IS NOT NULL, TRUE, FALSE) AS is_favorite
      FROM book_stats bs
      LEFT JOIN reading_list rl ON bs.book_id = rl.book_id AND rl.user_id = ?
      LEFT JOIN favorites    f  ON bs.book_id = f.book_id  AND f.user_id  = ?
      WHERE bs.total_reviews > 0
      ORDER BY bs.avg_rating DESC
      LIMIT 5`,
      [userId, userId]
    );

    res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
});

// GET /api/books/:id — returns a single book with all its reviews and reviewer usernames
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const bookId = req.params.id;

    const [bookRows] = await pool.query(
      `SELECT
        bs.*,
        rl.status    AS my_status,
        rl.pages_read,
        IF(f.fav_id IS NOT NULL, TRUE, FALSE) AS is_favorite
      FROM book_stats bs
      LEFT JOIN reading_list rl ON bs.book_id = rl.book_id AND rl.user_id = ?
      LEFT JOIN favorites    f  ON bs.book_id = f.book_id  AND f.user_id  = ?
      WHERE bs.book_id = ?`,
      [userId, userId, bookId]
    );

    if (bookRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const [reviews] = await pool.query(
      `SELECT r.*, u.username, u.full_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.book_id = ?
       ORDER BY r.created_at DESC`,
      [bookId]
    );

    res.json({ success: true, data: { ...bookRows[0], reviews } });
  } catch (error) {
    next(error);
  }
});

export default router;
