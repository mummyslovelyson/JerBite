import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { getSessionToken, clearSessionToken } from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export const homeFor = (role) => ({ admin: '/admin', manager: '/manager', rider: '/rider' }[role] || '/');

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, restaurant: null, rider: null });
  const [loading, setLoading] = useState(!!getSessionToken());

  const refresh = useCallback(async () => {
    const token = getSessionToken();
    if (!token) {
      setState({ user: null, restaurant: null, rider: null });
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setState({ user: data.user, restaurant: data.restaurant || null, rider: data.rider || null });
    } catch {
      clearSessionToken();
      setState({ user: null, restaurant: null, rider: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const acceptSession = async (token) => {
    try {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
      localStorage.clear();
    } catch {}
    setLoading(true);
    await refresh();
  };

  const logout = () => {
    const isAdmin = state.user?.role === 'admin' || window.location.pathname.startsWith('/admin');
    clearSessionToken();
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {}
    setState({ user: null, restaurant: null, rider: null });
    window.location.href = isAdmin ? '/admin/login' : '/login';
  };

  const adminLogout = () => {
    clearSessionToken();
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {}
    setState({ user: null, restaurant: null, rider: null });
    window.location.href = '/admin/login';
  };

  return (
    <AuthContext.Provider value={{ ...state, loading, refresh, acceptSession, logout, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
