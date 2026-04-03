// Dashboard route — aggregates all summary data for the user's home screen
import express from 'express';
import pool    from '../db.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /api/dashboard — returns complete dashboard data in one consolidated response
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // 1. User statistics from the user_stats view
    const [userStatRows] = await pool.query(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );
    const userStats = userStatRows[0] || {};

    // 2. Currently reading books with reading progress percentage
    const [currentlyReading] = await pool.query(
      `SELECT
        rl.book_id, rl.pages_read, rl.start_date,
        b.title, b.author, b.genre, b.cover_color, b.total_pages,
        ROUND((rl.pages_read / b.total_pages) * 100) AS percent_done
       FROM reading_list rl
       JOIN books b ON rl.book_id = b.book_id
       WHERE rl.user_id = ? AND rl.status = 'currently_reading'
       ORDER BY rl.date_added DESC`,
      [userId]
    );

    // 3. Genre breakdown of completed books
    const [genreBreakdown] = await pool.query(
      `SELECT b.genre, COUNT(*) AS count
       FROM reading_list rl
       JOIN books b ON rl.book_id = b.book_id
       WHERE rl.user_id = ? AND rl.status = 'completed' AND b.genre IS NOT NULL
       GROUP BY b.genre
       ORDER BY count DESC`,
      [userId]
    );

    // 4. Recently added books (last 5)
    const [recentlyAdded] = await pool.query(
      `SELECT
        rl.book_id, rl.status, rl.date_added, rl.pages_read,
        b.title, b.author, b.genre, b.cover_color, b.total_pages,
        bs.avg_rating
       FROM reading_list rl
       JOIN books b      ON rl.book_id = b.book_id
       JOIN book_stats bs ON rl.book_id = bs.book_id
       WHERE rl.user_id = ?
       ORDER BY rl.date_added DESC
       LIMIT 5`,
      [userId]
    );

    // 5. Top rated books from the book_stats view
    const [topRated] = await pool.query(
      `SELECT *
       FROM book_stats
       WHERE total_reviews > 0
       ORDER BY avg_rating DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        userStats,
        currentlyReading,
        genreBreakdown,
        recentlyAdded,
        topRated,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
