import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import AuthShell from './AuthShell';
import GlassInput from '../../components/GlassInput';

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      nav('/reset-password', { state: { email } });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="reset password"
      sub="Enter your email to receive a password reset code."
      footer={
        <Link className="font-bold text-white hover:underline" to="/login">
          &larr; Back to login
        </Link>
      }
    >
      <form onSubmit={submit} data-glass-form className="space-y-6">
        <GlassInput
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          icon={Mail}
        />

        {error && (
          <div className="rounded-xl bg-rose-500/25 border border-rose-400/40 px-3.5 py-2 text-xs font-semibold text-rose-100 text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-white text-[#1E0738] py-3 text-sm font-bold shadow-lg hover:bg-white/95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          disabled={busy}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin text-[#1E0738]" />}
          <span>{busy ? 'sending code…' : 'send code'}</span>
        </button>
      </form>
    </AuthShell>
  );
}
