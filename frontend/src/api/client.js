import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
export const assetUrl = (p) => (p ? (p.startsWith('http') ? p : API_URL.replace(/\/api\/?$/, '') + p) : null);

const api = axios.create({ baseURL: API_URL });

export const getSessionToken = () => {
  try {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  } catch {
    return null;
  }
};

export const clearSessionToken = () => {
  try {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    localStorage.clear();
  } catch {}
};

api.interceptors.request.use((cfg) => {
  const token = getSessionToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.startsWith('/auth/')) {
      clearSessionToken();
      if (!location.pathname.startsWith('/login')) location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';
export default api;
