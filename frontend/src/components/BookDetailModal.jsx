// Full book detail modal with status controls, favorites, session logging, and reviews
import { useState, useEffect, useCallback } from 'react';
import api            from '../api/axios.js';
import StarRating     from './StarRating.jsx';
import ProgressBar    from './ProgressBar.jsx';
import LogSessionModal from './LogSessionModal.jsx';
import ReviewModal    from './ReviewModal.jsx';
import Spinner        from './Spinner.jsx';

// Color gradient map for cover display
const coverColorMap = {
  amber:   'from-amber-400 to-amber-600',
  emerald: 'from-emerald-400 to-emerald-600',
  teal:    'from-teal-400 to-teal-600',
  indigo:  'from-indigo-400 to-indigo-600',
  rose:    'from-rose-400 to-rose-600',
  stone:   'from-stone-400 to-stone-600',
  violet:  'from-violet-400 to-violet-600',
  orange:  'from-orange-400 to-orange-600',
  sky:     'from-sky-400 to-sky-600',
  cyan:    'from-cyan-400 to-cyan-600',
  lime:    'from-lime-400 to-lime-600',
  pink:    'from-pink-400 to-pink-600',
};

export default function BookDetailModal({ bookId, onClose, onRefresh }) {
  const [book,            setBook]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [statusLoading,   setStatusLoading]   = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showLogSession,  setShowLogSession]  = useState(false);
  const [showReview,      setShowReview]      = useState(false);

  // Fetches book data including reviews from the API
  const fetchBook = useCallback(async () => {
    try {
      const { data } = await api.get(`/books/${bookId}`);
      setBook(data.data);
    } catch (err) {
      console.error('Failed to load book:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => { fetchBook(); }, [fetchBook]);

  // Updates the reading status for this book
  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      if (book.my_status) {
        await api.put(`/reading-list/${bookId}`, { status: newStatus });
      } else {
        await api.post('/reading-list', { book_id: bookId, status: newStatus });
      }
      await fetchBook();
      onRefresh?.();
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  // Toggles the favorite state for this book
  const handleFavoriteToggle = async () => {
    setFavoriteLoading(true);
    try {
      await api.post('/favorites/toggle', { book_id: bookId });
      await fetchBook();
      onRefresh?.();
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const gradient  = book ? (coverColorMap[book.cover_color] || coverColorMap.indigo) : '';
  const percent   = book?.total_pages > 0
    ? Math.round((book.pages_read || 0) / book.total_pages * 100)
    : 0;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="p-10"><Spinner /></div>
          ) : !book ? (
            <div className="p-10 text-center text-stone-500">Book not found.</div>
          ) : (
            <>
              {/* Header cover band */}
              <div className={`bg-gradient-to-br ${gradient} p-8 flex items-end gap-5 relative`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl transition-colors"
                >✕</button>
                <div className="text-6xl drop-shadow-lg">📖</div>
                <div className="text-white">
                  <h2 className="font-display text-2xl font-bold leading-tight">{book.title}</h2>
                  <p className="text-white/80 mt-1">{book.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{book.genre}</span>
                    {book.publication_year && (
                      <span className="text-white/70 text-xs">{book.publication_year}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-amber-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-stone-800">{book.total_pages}</p>
                    <p className="text-xs text-stone-500">Pages</p>
                  </div>
                  <div className="text-center bg-amber-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-stone-800">{book.avg_rating || '—'}</p>
                    <p className="text-xs text-stone-500">Avg Rating</p>
                  </div>
                  <div className="text-center bg-amber-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-stone-800">{book.total_readers || 0}</p>
                    <p className="text-xs text-stone-500">Readers</p>
                  </div>
                </div>

                {/* Reading progress for currently reading */}
                {book.my_status === 'currently_reading' && (
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-2">Your Progress</p>
                    <ProgressBar percent={percent} showLabel />
                    <p className="text-xs text-stone-400 mt-1">{book.pages_read} / {book.total_pages} pages</p>
                  </div>
                )}

                {/* Description */}
                {book.description && (
                  <div>
                    <h3 className="font-display font-semibold text-stone-800 mb-2">About this book</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{book.description}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {['want_to_read', 'currently_reading', 'completed'].map((status) => {
                      const labels = {
                        want_to_read:      '📌 Want to Read',
                        currently_reading: '📖 Reading',
                        completed:         '✅ Completed',
                      };
                      return (
                        <button
                          key={status}
                          disabled={statusLoading}
                          onClick={() => handleStatusChange(status)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            book.my_status === status
                              ? 'bg-stone-800 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {labels[status]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      disabled={favoriteLoading}
                      onClick={handleFavoriteToggle}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        book.is_favorite
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {book.is_favorite ? '❤️ Unfavorite' : '🤍 Favorite'}
                    </button>

                    {book.my_status === 'currently_reading' && (
                      <button
                        onClick={() => setShowLogSession(true)}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-all duration-200"
                      >
                        📝 Log Session
                      </button>
                    )}

                    <button
                      onClick={() => setShowReview(true)}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all duration-200"
                    >
                      ⭐ Write Review
                    </button>
                  </div>
                </div>

                {/* Reviews section */}
                <div>
                  <h3 className="font-display font-semibold text-stone-800 mb-3">
                    Reviews ({book.reviews?.length || 0})
                  </h3>
                  {book.reviews?.length === 0 ? (
                    <p className="text-sm text-stone-400 italic">No reviews yet. Be the first to review!</p>
                  ) : (
                    <div className="space-y-3">
                      {book.reviews.map((review) => (
                        <div key={review.review_id} className="bg-stone-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-stone-800">
                              {review.full_name || review.username}
                            </p>
                            <StarRating rating={review.rating} />
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-stone-600 leading-relaxed">{review.review_text}</p>
                          )}
                          <p className="text-xs text-stone-400 mt-2">
                            {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sub-modals */}
      {showLogSession && (
        <LogSessionModal
          bookId={bookId}
          bookTitle={book?.title}
          onClose={() => setShowLogSession(false)}
          onSuccess={() => { fetchBook(); onRefresh?.(); }}
        />
      )}
      {showReview && (
        <ReviewModal
          bookId={bookId}
          bookTitle={book?.title}
          onClose={() => setShowReview(false)}
          onSuccess={() => { fetchBook(); onRefresh?.(); }}
        />
      )}
    </>
  );
}
