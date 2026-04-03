// Express application entry point — mounts all routers and starts the server
import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';

import { testConnection } from './db.js';
import authRouter         from './routes/auth.js';
import booksRouter        from './routes/books.js';
import readingListRouter  from './routes/readingList.js';
import sessionsRouter     from './routes/sessions.js';
import reviewsRouter      from './routes/reviews.js';
import favoritesRouter    from './routes/favorites.js';
import dashboardRouter    from './routes/dashboard.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount all route modules under /api
app.use('/api/auth',         authRouter);
app.use('/api/books',        booksRouter);
app.use('/api/reading-list', readingListRouter);
app.use('/api/sessions',     sessionsRouter);
app.use('/api/reviews',      reviewsRouter);
app.use('/api/favorites',    favoritesRouter);
app.use('/api/dashboard',    dashboardRouter);

// Global error handler — catches any unhandled errors from route handlers
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, message: err.message });
});

// Start server and verify database connection
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await testConnection();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
});
