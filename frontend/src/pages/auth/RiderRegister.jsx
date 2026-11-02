import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Bike, Car, Loader2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import NightSkyBackdrop from '../../components/NightSkyBackdrop';
import AuthPortalSwitcher from '../../components/AuthPortalSwitcher';
import GlassInput from '../../components/GlassInput';

export default function RiderRegister() {
  const nav = useNavigate();
  const [f, setF] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'Motorbike',
    plateNumber: '',
    password: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (f.password !== f.confirm) return setError('Passwords do not match');
    if (f.password.length < 8) return setError('Password must be at least 8 characters long');
    if (!f.plateNumber.trim()) return setError('Please enter your vehicle plate or registration number');
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { ...f, role: 'rider' });
      nav('/verify', { state: { email: data.email, purpose: 'verify' } });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center p-4 select-none py-10">
      {/* 1. VECTOR LANDSCAPE BACKDROP */}
      <NightSkyBackdrop />

      {/* 2. FROSTED GLASSMORPHISM CARD */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[32px] border border-white/25 bg-white/[0.08] backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all">
        {/* Card Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            register
          </h1>
          <p className="mt-1 text-xs text-white/70">
            rider portal
          </p>
        </div>

        {/* Rider Registration Form */}
        <form onSubmit={submit} data-glass-form className="space-y-4">
          {/* Full Name */}
          <GlassInput
            type="text"
            required
            value={f.name}
            onChange={set('name')}
            placeholder="Full name"
            autoComplete="name"
            icon={User}
          />

          {/* Email */}
          <GlassInput
            type="email"
            required
            value={f.email}
            onChange={set('email')}
            placeholder="Email"
            autoComplete="email"
            icon={Mail}
          />

          {/* Phone */}
          <GlassInput
            type="tel"
            required
            value={f.phone}
            onChange={set('phone')}
            placeholder="Phone number"
            autoComplete="tel"
            icon={Phone}
          />

          {/* Vehicle Type & Plate Number */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="relative border-b-[1.5px] border-white/50 pb-2 pt-1 transition-all focus-within:border-white focus-within:shadow-[0_1px_0_0_#ffffff]">
              <select
                value={f.vehicleType}
                onChange={set('vehicleType')}
                className="glass-input w-full bg-transparent text-[15px] font-normal text-white focus:outline-none [&_option]:text-ink-900 [&_option]:bg-white cursor-pointer pr-8"
              >
                <option value="Motorbike">Motorbike</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Scooter">Scooter</option>
                <option value="Car">Car</option>
              </select>
              <Bike className="absolute right-0 bottom-2.5 h-4.5 w-4.5 text-white/80 pointer-events-none" strokeWidth={1.75} />
            </div>

            <GlassInput
              type="text"
              required
              value={f.plateNumber}
              onChange={set('plateNumber')}
              placeholder="Plate number"
              icon={Car}
            />
          </div>

          {/* Password */}
          <GlassInput
            type="password"
            required
            minLength={8}
            value={f.password}
            onChange={set('password')}
            placeholder="Password"
            autoComplete="new-password"
            icon={Lock}
            togglePassword
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          {/* Confirm Password */}
          <GlassInput
            type="password"
            required
            value={f.confirm}
            onChange={set('confirm')}
            placeholder="Confirm password"
            autoComplete="new-password"
            icon={Lock}
            togglePassword
            showPassword={showConfirm}
            onTogglePassword={() => setShowConfirm(!showConfirm)}
          />

          {/* Error Notice */}
          {error && (
            <div className="rounded-xl bg-rose-500/25 border border-rose-400/40 px-3.5 py-2 text-xs font-semibold text-rose-100 text-center">
              {error}
            </div>
          )}

          {/* Pill Register Button */}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-white text-[#1E0738] py-3 text-sm font-bold shadow-lg hover:bg-white/95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-6"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin text-[#1E0738]" />}
            <span>{busy ? 'registering…' : 'register'}</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-white/80">
          <span>Already registered as a rider? </span>
          <Link
            to="/rider/login"
            className="font-bold text-white hover:underline cursor-pointer"
          >
            Sign in
          </Link>
        </div>

        {/* Portal Switcher */}
        <AuthPortalSwitcher current="rider" mode="register" />

        {/* Return to Home */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-[11px] font-medium text-white/60 hover:text-white transition"
          >
            &larr; Return to JerBite Home
          </Link>
        </div>
      </div>
    </div>
  );
}

