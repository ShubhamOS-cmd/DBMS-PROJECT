// Clickable book card showing cover, metadata, rating, status, and progress
import ProgressBar from './ProgressBar.jsx';
import StarRating  from './StarRating.jsx';

// Maps cover_color value to Tailwind gradient classes for visual variety
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

// Maps reading status to a human-readable badge with color
const statusBadge = {
  completed:        { label: 'Completed',  classes: 'bg-emerald-100 text-emerald-700' },
  currently_reading:{ label: 'Reading',    classes: 'bg-amber-100 text-amber-700'     },
  want_to_read:     { label: 'Wishlist',   classes: 'bg-stone-100 text-stone-600'     },
};

export default function BookCard({ book, onOpen }) {
  const gradient  = coverColorMap[book.cover_color] || coverColorMap.indigo;
  const badge     = book.my_status ? statusBadge[book.my_status] : null;
  const percent   = book.total_pages > 0
    ? Math.round((book.pages_read || 0) / book.total_pages * 100)
    : 0;

  return (
    <div
      onClick={() => onOpen(book)}
      className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden
                 cursor-pointer hover:shadow-md hover:-translate-y-0.5
                 transition-all duration-200 flex flex-col"
    >
      {/* Colored book cover area */}
      <div className={`bg-gradient-to-br ${gradient} h-36 flex items-center justify-center relative`}>
        <span className="text-5xl drop-shadow-md">📖</span>
        {book.is_favorite && (
          <span className="absolute top-2 right-2 text-lg">❤️</span>
        )}
        {badge && (
          <span className={`absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${badge.classes}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Book metadata */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-stone-900 text-sm leading-snug line-clamp-2 mb-1">
          {book.title}
        </h3>
        <p className="text-xs text-stone-500 mb-2 truncate">{book.author}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
            {book.genre}
          </span>
          <StarRating rating={book.avg_rating || 0} />
        </div>

        {/* Progress bar for books currently being read */}
        {book.my_status === 'currently_reading' && (
          <div className="mt-auto">
            <ProgressBar percent={percent} showLabel />
          </div>
        )}
      </div>
    </div>
  );
}
