// Authentication context — provides user state, login, and logout to the entire app
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate auth state from localStorage on first mount
  useEffect(() => {
    const savedToken = localStorage.getItem('bt_token');
    const savedUser  = localStorage.getItem('bt_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Saves token and user data to both state and localStorage
  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('bt_token', newToken);
    localStorage.setItem('bt_user', JSON.stringify(userData));
  };

  // Clears all auth state and redirects to login
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bt_token');
    localStorage.removeItem('bt_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming auth context throughout the app
export function useAuth() {
  return useContext(AuthContext);
}
