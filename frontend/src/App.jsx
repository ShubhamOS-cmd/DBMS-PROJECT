// App root — sets up routing, auth protection, and the shared layout
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar   from './components/Navbar.jsx';
import Spinner  from './components/Spinner.jsx';
import Login    from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard  from './pages/Dashboard.jsx';
import Discover   from './pages/Discover.jsx';
import MyLibrary  from './pages/MyLibrary.jsx';
import Favorites  from './pages/Favorites.jsx';

// Protects routes by redirecting unauthenticated users to /login
function PrivateRoute() {
  const { token, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (!token)  return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto bg-amber-50">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/discover"  element={<Discover />} />
            <Route path="/library"   element={<MyLibrary />} />
            <Route path="/favorites" element={<Favorites />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
