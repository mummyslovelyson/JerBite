import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Store, LogOut } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useAuth, homeFor } from '../../context/AuthContext';
import NightSkyBackdrop from '../../components/NightSkyBackdrop';
import AuthPortalSwitcher from '../../components/AuthPortalSwitcher';
import GlassInput from '../../components/GlassInput';

export default function ManagerLogin() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    if (e) e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      if (data.user?.role !== 'manager') {
        throw new Error(
          `This account has the role "${data.user?.role}". Restaurant Partner portal access requires a Kitchen Manager account.`
        );
      }

      try {
        sessionStorage.setItem('token', data.token);
        if (rememberMe) {
          sessionStorage.setItem('remember_user', 'true');
        }
        localStorage.removeItem('token');
        localStorage.clear();
      } catch {}

      window.location.href = '/manager';
    } catch (err) {
      if (err.response?.data?.code === 'NOT_VERIFIED') {
        return nav('/verify', { state: { email: err.response.data.email || email } });
      }
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center p-4 select-none py-10">
      {/* 1. VECTOR LANDSCAPE BACKDROP */}
      <NightSkyBackdrop />

      {/* 2. FROSTED GLASSMORPHISM CARD */}
      <div className="relative z-10 w-full max-w-[390px] rounded-[32px] border border-white/25 bg-white/[0.08] backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all">
        {/* Already logged in banner */}
        {user && (
          <div className="mb-6 rounded-2xl bg-white/10 border border-white/20 p-3 text-xs text-white flex items-center justify-between">
            <div>
              <p className="font-bold">Logged in as {user.name}</p>
              <p className="text-white/70 text-[11px] capitalize">Role: {user.role}</p>
            </div>
            <div className="flex gap-1.5">
              <Link
                to={homeFor(user.role)}
                className="rounded-full bg-white text-[#1E0738] font-bold px-2.5 py-1 text-[11px] hover:bg-white/90"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white/20 text-white p-1 hover:bg-white/30"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Card Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            login
          </h1>
          <p className="mt-1 text-xs text-white/70">
            partner portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} data-glass-form className="space-y-6">
          {/* Email Underline Field */}
          <GlassInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            icon={Mail}
          />

          {/* Password Underline Field */}
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

            <Link
              to="/forgot-password"
              className="hover:underline font-normal text-[11px] sm:text-xs text-white/90 cursor-pointer"
            >
              Forget Password
            </Link>
          </div>

          {/* Inline Error Notice */}
          {error && (
            <div className="rounded-xl bg-rose-500/25 border border-rose-400/40 px-3.5 py-2 text-xs font-semibold text-rose-100 text-center">
              {error}
            </div>
          )}

          {/* White Pill Button */}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-white text-[#1E0738] py-3 text-sm font-bold shadow-lg hover:bg-white/95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin text-[#1E0738]" />}
            <span>{busy ? 'logging in…' : 'login'}</span>
          </button>
        </form>

        {/* Footer Link to Partner Register */}
        <div className="mt-6 text-center text-xs text-white/80">
          <span>Want to sell food on JerBite? </span>
          <Link
            to="/manager/register"
            className="font-bold text-white hover:underline cursor-pointer"
          >
            Register Kitchen
          </Link>
        </div>

        {/* Portal Switcher */}
        <AuthPortalSwitcher current="manager" mode="login" />

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

