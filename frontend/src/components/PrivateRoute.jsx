// Redirects unauthenticated users to the login page
import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext.jsx';
import Spinner      from './Spinner.jsx';

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (!token)  return <Navigate to="/login" replace />;
  return children;
}
