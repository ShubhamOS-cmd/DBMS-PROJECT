// Registration page — creates a new account and auto-logs in the user
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({
    full_name: '', username: '', email: '', password: '', reading_goal: 12,
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Handles form field changes for all inputs
  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  // Submits the registration form and redirects on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">📚</div>
          <h1 className="font-display text-3xl font-bold text-stone-900">BookTracker</h1>
          <p className="text-stone-500 mt-1">Start your reading journey today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h2 className="font-display text-xl font-semibold text-stone-800 mb-6">Create account</h2>

          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Arjun Sharma"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="arjun_reads"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Yearly Reading Goal
              </label>
              <input
                type="number"
                name="reading_goal"
                value={form.reading_goal}
                onChange={handleChange}
                min={1}
                max={365}
                className="input-field"
              />
              <p className="text-xs text-stone-400 mt-1">How many books do you want to read this year?</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
