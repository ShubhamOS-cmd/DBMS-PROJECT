// My Library page — shows the user's personal reading list with status filters
import { useState, useEffect } from 'react';
import { Link }        from 'react-router-dom';
import api             from '../api/axios.js';
import BookCard        from '../components/BookCard.jsx';
import BookDetailModal from '../components/BookDetailModal.jsx';
import Spinner         from '../components/Spinner.jsx';
import Toast           from '../components/Toast.jsx';
import { useToast }    from '../hooks/useToast.js';

// Tab definitions for reading status filter
const STATUS_TABS = [
  { key: 'all',               label: 'All',       icon: '📚' },
  { key: 'currently_reading', label: 'Reading',   icon: '📖' },
  { key: 'completed',         label: 'Completed', icon: '✅' },
  { key: 'want_to_read',      label: 'Wishlist',  icon: '📌' },
];

export default function MyLibrary() {
  const { toasts, showToast }         = useToast();
  const [allBooks,       setAllBooks]       = useState([]);
  const [displayBooks,   setDisplayBooks]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('all');
  const [selectedBookId, setSelectedBookId] = useState(null);

  // Fetches the user's complete reading list from the API
  const fetchLibrary = async () => {
    try {
      const { data } = await api.get('/reading-list');
      const books = data.data || [];
      setAllBooks(books);
      setDisplayBooks(books);
    } catch (err) {
      showToast('Failed to load your library', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLibrary(); }, []);

  // Filters the local book list when a status tab is clicked
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'all') {
      setDisplayBooks(allBooks);
    } else {
      setDisplayBooks(allBooks.filter((b) => b.status === tabKey));
    }
  };

  // Re-applies the current filter after the modal triggers a refresh
  const handleRefresh = async () => {
    try {
      const { data } = await api.get('/reading-list');
      const books = data.data || [];
      setAllBooks(books);
      const filtered = activeTab === 'all' ? books : books.filter((b) => b.status === activeTab);
      setDisplayBooks(filtered);
    } catch (_) {}
  };

  // Count badges for each tab
  const counts = {
    all:               allBooks.length,
    currently_reading: allBooks.filter((b) => b.status === 'currently_reading').length,
    completed:         allBooks.filter((b) => b.status === 'completed').length,
    want_to_read:      allBooks.filter((b) => b.status === 'want_to_read').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toast toasts={toasts} />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-stone-900">My Library</h1>
        <p className="text-stone-500 mt-1">Your personal collection of {allBooks.length} book{allBooks.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === key
                ? 'bg-stone-800 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-800'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === key ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : allBooks.length === 0 ? (
        /* Empty state — no books in library at all */
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="font-display text-xl font-semibold text-stone-700 mb-2">Your library is empty</h3>
          <p className="text-stone-500 mb-6">
            Go discover some books and add them to your reading list!
          </p>
          <Link to="/discover" className="btn-primary">🔍 Discover Books</Link>
        </div>
      ) : displayBooks.length === 0 ? (
        /* Empty state — no books match the active filter */
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-display text-xl font-semibold text-stone-700 mb-2">
            No {STATUS_TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} books yet
          </h3>
          <p className="text-stone-500 mb-6">
            {activeTab === 'currently_reading' && 'Start reading a book from your wishlist!'}
            {activeTab === 'completed'         && 'Finish a book to see it here.'}
            {activeTab === 'want_to_read'      && 'Add books to your wishlist from the Discover page.'}
          </p>
          <Link to="/discover" className="btn-primary">🔍 Browse Books</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayBooks.map((book) => (
            <BookCard
              key={book.book_id}
              book={{
                ...book,
                my_status:   book.status,
                avg_rating:  book.avg_rating,
                is_favorite: book.is_favorite,
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
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
