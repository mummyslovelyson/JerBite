import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
import { Spinner } from './ui';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner className="min-h-screen items-center" />;
  if (!user) {
    const authRoutes = {
      admin: '/admin/login',
      manager: '/manager/login',
      rider: '/rider/login'
    };
    const targetLogin = authRoutes[role] || '/login';
    return <Navigate to={targetLogin} state={{ from: loc.pathname }} replace />;
  }
  if (role && user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
