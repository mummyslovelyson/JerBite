import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, LogOut, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import NightSkyBackdrop from '../../components/NightSkyBackdrop';
import GlassInput from '../../components/GlassInput';
import AuthPortalSwitcher from '../../components/AuthPortalSwitcher';

export default function AdminLogin() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setBusy(true);
    setError('');

    try {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}

      const { data } = await api.post('/auth/admin-login', {
        email: email.trim(),
        password
      });

      if (data.user?.role !== 'admin') {
        try {
          sessionStorage.clear();
        } catch {}
        throw new Error('Access denied. Administrator privileges required.');
      }

      try {
        sessionStorage.setItem('token', data.token);
        if (rememberMe) {
          sessionStorage.setItem('remember_admin', 'true');
        }
      } catch {}

      window.location.href = '/admin';
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast('Admin password resets must be issued by a Super Administrator.', {
      icon: '🔐',
      style: {
        borderRadius: '16px',
        background: '#1F0738',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)'
      }
    });
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center p-4 select-none py-10">
      {/* 1. VECTOR LANDSCAPE BACKGROUND */}
      <NightSkyBackdrop />

      {/* 2. FROSTED GLASSMORPHISM CARD */}
      <div className="relative z-10 w-full max-w-[390px] rounded-[32px] border border-white/25 bg-white/[0.08] backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all">
        {/* Banner if already logged in */}
        {user && (
          <div className="mb-6 rounded-2xl bg-white/10 border border-white/20 p-3 text-xs text-white flex items-center justify-between">
            <div>
              <p className="font-bold">Logged in as {user.name}</p>
              <p className="text-white/70 text-[11px] capitalize">Role: {user.role}</p>
            </div>
            <div className="flex gap-1.5">
              {user.role === 'admin' ? (
                <button
                  type="button"
                  onClick={() => nav('/admin')}
                  className="rounded-full bg-white text-[#1E0738] font-bold px-2.5 py-1 text-[11px] hover:bg-white/90 flex items-center gap-1 cursor-pointer"
                >
                  <span>Admin</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white/20 text-white p-1 hover:bg-white/30 cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Card Title */}
        <h1 className="text-3xl font-bold text-white text-center tracking-tight mb-8">
          login
        </h1>

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} data-glass-form className="space-y-6">
          {/* Email Field */}
          <GlassInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            icon={Mail}
          />

          {/* Password Field */}
          <GlassInput
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            icon={Lock}
            togglePassword
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          {/* Remember Me & Forget Password Row */}
          <div className="flex items-center justify-between text-xs text-white/90 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded-xs border-white/60 bg-white/20 text-[#250742] accent-white cursor-pointer"
              />
              <span className="font-normal text-[11px] sm:text-xs">Remember Me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="hover:underline font-normal text-[11px] sm:text-xs text-white/90 cursor-pointer"
            >
              Forget Password
            </button>
          </div>

          {/* Inline Error Notice */}
          {error && (
            <div className="rounded-xl bg-rose-500/25 border border-rose-400/40 px-3.5 py-2 text-xs font-semibold text-rose-100 text-center">
              {error}
            </div>
          )}

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-white text-[#1E0738] py-3 text-sm font-bold shadow-lg hover:bg-white/95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin text-[#1E0738]" />}
            <span>{busy ? 'logging in…' : 'login'}</span>
          </button>
        </form>

        {/* Portal Switcher */}
        <AuthPortalSwitcher current="admin" mode="login" />

        {/* Return to Home */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-[11px] font-medium text-white/50 hover:text-white transition"
          >
            &larr; Return to JerBite Home
          </Link>
        </div>
      </div>
    </div>
  );
}
