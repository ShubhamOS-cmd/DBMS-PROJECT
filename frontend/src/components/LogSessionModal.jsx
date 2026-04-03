// Modal for logging a reading session with pages read and optional notes
import { useState } from 'react';
import api from '../api/axios.js';

export default function LogSessionModal({ bookId, bookTitle, onClose, onSuccess }) {
  const [pages,     setPages]     = useState('');
  const [notes,     setNotes]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [completed, setCompleted] = useState(false);

  // Submits the reading session to the API
  const handleSubmit = async () => {
    if (!pages || Number(pages) <= 0) {
      setError('Please enter a valid number of pages (at least 1)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/sessions', {
        book_id:           bookId,
        pages_this_session: Number(pages),
        notes:             notes || undefined,
      });
      if (data.completed) {
        setCompleted(true);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log session');
    } finally {
      setLoading(false);
    }
  };

  // After completing, celebrate then close
  const handleCompletedClose = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {completed ? (
          /* Congratulations screen */
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">
              Book Completed!
            </h2>
            <p className="text-stone-500 mb-6">
              Congratulations! You've finished <strong className="text-stone-800">{bookTitle}</strong>.
              Keep up the amazing reading streak!
            </p>
            <button onClick={handleCompletedClose} className="btn-primary w-full">
              🏆 Awesome!
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-stone-900">Log Reading Session</h2>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-xl transition-colors">✕</button>
            </div>

            <p className="text-sm text-stone-500 mb-4">
              Logging session for <span className="font-medium text-stone-800">{bookTitle}</span>
            </p>

            {error && (
              <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Pages Read This Session <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="e.g. 30"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Session Notes <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you think? Any memorable moments?"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : '📝 Log Session'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
