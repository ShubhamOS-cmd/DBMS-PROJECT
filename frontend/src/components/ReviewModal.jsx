// Modal for writing or updating a star-rated book review
import { useState } from 'react';
import StarRating from './StarRating.jsx';
import api from '../api/axios.js';

export default function ReviewModal({ bookId, bookTitle, onClose, onSuccess }) {
  const [rating,     setRating]     = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // Submits the review to the API and calls onSuccess on completion
  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a star rating before submitting');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/reviews', {
        book_id:     bookId,
        rating,
        review_text: reviewText || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-semibold text-stone-900">Write a Review</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-xl transition-colors">✕</button>
        </div>

        <p className="text-sm text-stone-500 mb-5">
          Reviewing <span className="font-medium text-stone-800">{bookTitle}</span>
        </p>

        {error && (
          <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Your Rating <span className="text-rose-500">*</span>
            </label>
            <StarRating interactive rating={rating} onRate={setRating} />
            {rating > 0 && (
              <p className="text-xs text-stone-400 mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Your Review <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this book..."
              rows={5}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : '⭐ Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
