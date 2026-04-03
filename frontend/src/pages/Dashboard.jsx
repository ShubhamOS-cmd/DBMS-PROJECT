// Dashboard page — shows stats, reading progress, genres, and recent activity
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api        from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner    from '../components/Spinner.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import StarRating  from '../components/StarRating.jsx';
import BookDetailModal from '../components/BookDetailModal.jsx';

export default function Dashboard() {
  const { user }     = useAuth();
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [selectedBookId, setSelectedBookId] = useState(null);

  // Fetches all dashboard data in one API call
  const fetchDashboard = async () => {
    try {
      const { data: res } = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <Spinner fullPage />;

  const { userStats, currentlyReading, genreBreakdown, recentlyAdded, topRated } = data || {};
  const goalPercent = userStats?.reading_goal > 0
    ? Math.min(100, Math.round((userStats.books_completed / userStats.reading_goal) * 100))
    : 0;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const maxGenreCount = genreBreakdown?.[0]?.count || 1;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header greeting */}
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900">
          {greeting}, {user?.full_name?.split(' ')[0] || user?.username} 👋
        </h1>
        <p className="text-stone-500 mt-1">Here's your reading snapshot</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Completed',      value: userStats?.books_completed || 0, icon: '✅', color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Reading Now',    value: userStats?.books_reading   || 0, icon: '📖', color: 'bg-amber-50 border-amber-100'   },
          { label: 'On Wishlist',    value: userStats?.books_wishlist  || 0, icon: '📌', color: 'bg-sky-50 border-sky-100'       },
          { label: 'Pages Read',     value: (userStats?.total_pages_read || 0).toLocaleString(), icon: '📄', color: 'bg-violet-50 border-violet-100' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`${color} border rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{icon}</div>
            <p className="font-display text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-sm text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Yearly reading goal */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-stone-800">📅 {new Date().getFullYear()} Reading Goal</h2>
          <span className="text-sm text-stone-500">
            {userStats?.books_completed || 0} / {userStats?.reading_goal || 0} books
          </span>
        </div>
        <ProgressBar percent={goalPercent} showLabel color="emerald" />
        <p className="text-xs text-stone-400 mt-2">
          {goalPercent >= 100
            ? '🎉 Goal achieved! You are a reading champion!'
            : `${(userStats?.reading_goal || 0) - (userStats?.books_completed || 0)} more books to reach your goal`}
        </p>
      </div>

      {/* Currently reading */}
      {currentlyReading?.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">📖 Currently Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentlyReading.map((book) => (
              <div
                key={book.book_id}
                className="card cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => setSelectedBookId(book.book_id)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📖</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-stone-900 truncate">{book.title}</h3>
                    <p className="text-sm text-stone-500 mb-3">{book.author}</p>
                    <ProgressBar percent={book.percent_done || 0} showLabel />
                    <p className="text-xs text-stone-400 mt-1">
                      {book.pages_read} / {book.total_pages} pages
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre breakdown */}
        {genreBreakdown?.length > 0 && (
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">📊 Genre Breakdown</h2>
            <div className="space-y-3">
              {genreBreakdown.map(({ genre, count }) => (
                <div key={genre}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700 font-medium">{genre}</span>
                    <span className="text-stone-400">{count} book{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxGenreCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently added */}
        {recentlyAdded?.length > 0 && (
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">🕒 Recently Added</h2>
            <div className="space-y-3">
              {recentlyAdded.map((book) => (
                <div
                  key={book.book_id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-stone-50 rounded-xl p-2 -mx-2 transition-colors"
                  onClick={() => setSelectedBookId(book.book_id)}
                >
                  <span className="text-xl">📘</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{book.title}</p>
                    <p className="text-xs text-stone-500">{book.author}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    book.status === 'completed'         ? 'bg-emerald-100 text-emerald-700' :
                    book.status === 'currently_reading' ? 'bg-amber-100 text-amber-700' :
                    'bg-stone-100 text-stone-600'
                  }`}>
                    {book.status === 'completed' ? 'Done' : book.status === 'currently_reading' ? 'Reading' : 'Wishlist'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top rated books */}
      {topRated?.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">⭐ Top Rated Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {topRated.map((book) => (
              <div
                key={book.book_id}
                className="card cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => setSelectedBookId(book.book_id)}
              >
                <div className="flex gap-3">
                  <span className="text-2xl">📗</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-stone-900 text-sm truncate">{book.title}</p>
                    <p className="text-xs text-stone-500 mb-2">{book.author}</p>
                    <StarRating rating={book.avg_rating} />
                    <p className="text-xs text-stone-400 mt-1">{book.total_reviews} review{book.total_reviews !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!currentlyReading?.length && !recentlyAdded?.length && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="font-display text-xl font-semibold text-stone-700 mb-2">Your shelf is empty</h3>
          <p className="text-stone-500 mb-6">Start by discovering books you'd like to read.</p>
          <Link to="/discover" className="btn-primary">🔍 Discover Books</Link>
        </div>
      )}

      {selectedBookId && (
        <BookDetailModal
          bookId={selectedBookId}
          onClose={() => setSelectedBookId(null)}
          onRefresh={fetchDashboard}
        />
      )}
    </div>
  );
}
