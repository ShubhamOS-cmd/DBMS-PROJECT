// Discover page — browse all books with genre filters and debounced search
import { useState, useEffect, useCallback, useRef } from 'react';
import api             from '../api/axios.js';
import BookCard        from '../components/BookCard.jsx';
import BookDetailModal from '../components/BookDetailModal.jsx';
import Spinner         from '../components/Spinner.jsx';
import Toast           from '../components/Toast.jsx';
import { useToast }    from '../hooks/useToast.js';
import { Link }        from 'react-router-dom';

export default function Discover() {
  const { toasts, showToast }         = useToast();
  const [allBooks,       setAllBooks]       = useState([]);
  const [displayBooks,   setDisplayBooks]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchLoading,  setSearchLoading]  = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activeGenre,    setActiveGenre]    = useState('All');
  const [genres,         setGenres]         = useState(['All']);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const debounceTimer = useRef(null);

  // Fetches all books from the API on mount
  const fetchAllBooks = async () => {
    try {
      const { data } = await api.get('/books');
      const books = data.data || [];
      setAllBooks(books);
      setDisplayBooks(books);

      // Build unique genre list from the returned books
      const uniqueGenres = ['All', ...new Set(books.map((b) => b.genre).filter(Boolean))];
      setGenres(uniqueGenres);
    } catch (err) {
      showToast('Failed to load books', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllBooks(); }, []);

  // Performs a debounced search via the search API endpoint
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setActiveGenre('All');

    clearTimeout(debounceTimer.current);

    if (!query.trim()) {
      setDisplayBooks(allBooks);
      return;
    }

    setSearchLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/books/search?q=${encodeURIComponent(query)}`);
        setDisplayBooks(data.data || []);
      } catch (err) {
        showToast('Search failed', 'error');
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  // Filters the already-loaded book list by genre on the client side
  const handleGenreClick = (genre) => {
    setActiveGenre(genre);
    setSearchQuery('');
    if (genre === 'All') {
      setDisplayBooks(allBooks);
    } else {
      setDisplayBooks(allBooks.filter((b) => b.genre === genre));
    }
  };

  // Refreshes the full book list after an action inside the detail modal
  const handleModalRefresh = async () => {
    try {
      const { data } = await api.get('/books');
      const books = data.data || [];
      setAllBooks(books);
      const filtered = activeGenre === 'All'
        ? books
        : books.filter((b) => b.genre === activeGenre);
      setDisplayBooks(filtered);
    } catch (_) {}
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toast toasts={toasts} />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-stone-900">Discover Books</h1>
        <p className="text-stone-500 mt-1">Find your next great read from our collection</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by title, author, or genre..."
          className="input-field pl-11"
        />
        {searchLoading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 animate-spin">⟳</span>
        )}
      </div>

      {/* Genre filter tabs */}
      {!searchQuery && (
        <div className="flex gap-2 flex-wrap mb-6">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeGenre === genre
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {/* Book count label */}
      {!loading && (
        <p className="text-sm text-stone-400 mb-4">
          {displayBooks.length} book{displayBooks.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
          {activeGenre !== 'All' && !searchQuery && ` in ${activeGenre}`}
        </p>
      )}

      {/* Books grid */}
      {loading ? (
        <Spinner />
      ) : displayBooks.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔎</div>
          <h3 className="font-display text-xl font-semibold text-stone-700 mb-2">No books found</h3>
          <p className="text-stone-500 mb-6">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search.`
              : 'No books in this genre yet.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveGenre('All'); setDisplayBooks(allBooks); }}
            className="btn-primary"
          >
            View All Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayBooks.map((book) => (
            <BookCard
              key={book.book_id}
              book={book}
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
          onRefresh={handleModalRefresh}
        />
      )}
    </div>
  );
}
