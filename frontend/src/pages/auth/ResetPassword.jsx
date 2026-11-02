import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { KeyRound, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import AuthShell from './AuthShell';
import GlassInput from '../../components/GlassInput';

export default function ResetPassword() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [f, setF] = useState({ code: '', newPassword: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!state?.email) return <Navigate to="/forgot-password" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (f.newPassword !== f.confirm) return setError('Passwords do not match');
    if (f.newPassword.length < 8) return setError('Password must be at least 8 characters long');
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/reset-password', {
        email: state.email,
        code: f.code,
        newPassword: f.newPassword
      });
      toast.success('Password updated. Log in with your new password.');
      nav('/login', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="new password"
      sub={`Enter the code sent to ${state.email} and your new password.`}
      footer={
        <Link className="font-bold text-white hover:underline" to="/login">
          &larr; Back to login
        </Link>
      }
    >
      <form onSubmit={submit} data-glass-form className="space-y-4">
        <GlassInput
          type="text"
          inputMode="numeric"
          required
          value={f.code}
          onChange={(e) => setF({ ...f, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
          placeholder="Reset code"
          autoComplete="one-time-code"
          icon={KeyRound}
        />

        <GlassInput
          type="password"
          required
          minLength={8}
          value={f.newPassword}
          onChange={(e) => setF({ ...f, newPassword: e.target.value })}
          placeholder="New password"
          autoComplete="new-password"
          icon={Lock}
          togglePassword
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <GlassInput
          type="password"
          required
          value={f.confirm}
          onChange={(e) => setF({ ...f, confirm: e.target.value })}
          placeholder="Confirm password"
          autoComplete="new-password"
          icon={Lock}
          togglePassword
          showPassword={showConfirm}
          onTogglePassword={() => setShowConfirm(!showConfirm)}
        />

        {error && (
          <div className="rounded-xl bg-rose-500/25 border border-rose-400/40 px-3.5 py-2 text-xs font-semibold text-rose-100 text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-white text-[#1E0738] py-3 text-sm font-bold shadow-lg hover:bg-white/95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
          disabled={busy}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin text-[#1E0738]" />}
          <span>{busy ? 'updating…' : 'save password'}</span>
        </button>
      </form>
    </AuthShell>
  );
}
