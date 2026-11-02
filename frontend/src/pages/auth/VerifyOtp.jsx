import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { KeyRound, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import { useAuth, homeFor } from '../../context/AuthContext';
import AuthShell from './AuthShell';
import GlassInput from '../../components/GlassInput';

export default function VerifyOtp() {
  const { state } = useLocation();
  const nav = useNavigate();
  const { acceptSession } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(60);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  if (!state?.email) return <Navigate to="/login" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { email: state.email, code });
      await acceptSession(data.token);
      toast.success('Account verified');
      nav(homeFor(data.user.role), { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await api.post('/auth/resend-otp', { email: state.email });
      toast.success('New code sent');
      setWait(60);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <AuthShell
      title="verify"
      sub={`Enter the 6-digit code sent to ${state.email}.`}
      footer={
        <Link className="font-bold text-white hover:underline" to="/login">
          &larr; Back to login
        </Link>
      }
    >
      <form onSubmit={submit} data-glass-form className="space-y-6">
        <GlassInput
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-digit code"
          icon={KeyRound}
          className="[&_input]:text-center [&_input]:text-xl [&_input]:tracking-[0.35em]"
        />

        {error && (
          <div className="rounded-xl bg-rose-500/25 border border-rose-400/40 px-3.5 py-2 text-xs font-semibold text-rose-100 text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-white text-[#1E0738] py-3 text-sm font-bold shadow-lg hover:bg-white/95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          disabled={busy || code.length !== 6}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin text-[#1E0738]" />}
          <span>{busy ? 'verifying…' : 'verify'}</span>
        </button>
      </form>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={resend}
          disabled={wait > 0}
          className="text-xs text-white/80 hover:text-white disabled:text-white/40 font-semibold cursor-pointer"
        >
          {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
        </button>
      </div>
    </AuthShell>
  );
}
