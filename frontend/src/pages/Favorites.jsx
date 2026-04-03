// Favorites page — displays all books the user has hearted
import { useState, useEffect } from 'react';
import { Link }        from 'react-router-dom';
import api             from '../api/axios.js';
import BookCard        from '../components/BookCard.jsx';
import BookDetailModal from '../components/BookDetailModal.jsx';
import Spinner         from '../components/Spinner.jsx';
import Toast           from '../components/Toast.jsx';
import { useToast }    from '../hooks/useToast.js';

export default function Favorites() {
  const { toasts, showToast }         = useToast();
  const [favorites,      setFavorites]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedBookId, setSelectedBookId] = useState(null);

  // Fetches all favorited books for the current user
  const fetchFavorites = async () => {
    try {
      const { data } = await api.get('/favorites');
      setFavorites(data.data || []);
    } catch (err) {
      showToast('Failed to load favorites', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toast toasts={toasts} />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-stone-900">My Favorites ❤️</h1>
        <p className="text-stone-500 mt-1">
          {favorites.length > 0
            ? `${favorites.length} book${favorites.length !== 1 ? 's' : ''} you love`
            : 'Books you\'ve marked as favorites'}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : favorites.length === 0 ? (
        /* Empty state */
        <div className="text-center py-24">
          <div className="text-7xl mb-4">🤍</div>
          <h3 className="font-display text-xl font-semibold text-stone-700 mb-2">No favorites yet</h3>
          <p className="text-stone-500 mb-6">
            Tap the heart on any book to save it here for quick access.
          </p>
          <Link to="/discover" className="btn-primary">🔍 Discover Books</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map((book) => (
            <BookCard
              key={book.book_id}
              book={{
                ...book,
                my_status:   book.my_status,
                is_favorite: true,
              }}
              onOpen={(b) => setSelectedBookId(b.book_id)}
            />
          ))}
        </div>
      )}

      {/* Book detail modal */}
      {selectedBookId && (
        <BookDetailModal
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
          onRefresh={fetchFavorites}
        />
      )}
    </div>
  );
}
