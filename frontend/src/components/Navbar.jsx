// Fixed left sidebar navigation with links, active states, and logout
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Navigation link definitions with emoji icons
const navLinks = [
  { to: '/',          label: 'Dashboard', icon: '🏠' },
  { to: '/discover',  label: 'Discover',  icon: '🔍' },
  { to: '/library',   label: 'My Library',icon: '📚' },
  { to: '/favorites', label: 'Favorites', icon: '❤️'  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-stone-800 text-stone-100 h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-stone-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <h1 className="font-display text-lg font-semibold text-amber-100 leading-tight">BookTracker</h1>
            <p className="text-xs text-stone-400">Your reading journey</p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-300 hover:bg-stone-700 hover:text-stone-100'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info and logout */}
      <div className="px-4 py-4 border-t border-stone-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-stone-900 font-bold text-sm flex-shrink-0">
            {user?.full_name?.[0] || user?.username?.[0] || '?'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-stone-100 truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-stone-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-stone-400
                     hover:bg-stone-700 hover:text-stone-100 transition-all duration-200"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
