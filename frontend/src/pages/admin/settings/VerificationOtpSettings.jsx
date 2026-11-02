import { useState, useEffect } from 'react';
import { ShieldCheck, Save, RefreshCw, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Field, ErrorNote } from '../../../components/ui';

export default function VerificationOtpSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  // OTP Configuration State
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState(10);
  const [maxOtpAttempts, setMaxOtpAttempts] = useState(3);
  const [otpLength, setOtpLength] = useState(6);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(60);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [requirePhoneVerification, setRequirePhoneVerification] = useState(true);
  const [allowSmsOtpLogin, setAllowSmsOtpLogin] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/settings/all');
      const data = res.data || {};
      if (data.otp_expiry_minutes !== undefined) setOtpExpiryMinutes(Number(data.otp_expiry_minutes));
      if (data.max_otp_attempts !== undefined) setMaxOtpAttempts(Number(data.max_otp_attempts));
      if (data.otp_length !== undefined) setOtpLength(Number(data.otp_length));
      if (data.resend_cooldown_seconds !== undefined) setResendCooldownSeconds(Number(data.resend_cooldown_seconds));
      if (data.require_email_verification !== undefined) setRequireEmailVerification(!!data.require_email_verification);
      if (data.require_phone_verification !== undefined) setRequirePhoneVerification(!!data.require_phone_verification);
      if (data.allow_sms_otp_login !== undefined) setAllowSmsOtpLogin(!!data.allow_sms_otp_login);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    setSuccess('');
    try {
      await api.put('/admin/settings/section/otp', {
        otp_expiry_minutes: Number(otpExpiryMinutes),
        max_otp_attempts: Number(maxOtpAttempts),
        otp_length: Number(otpLength),
        resend_cooldown_seconds: Number(resendCooldownSeconds),
        require_email_verification: !!requireEmailVerification,
        require_phone_verification: !!requirePhoneVerification,
        allow_sms_otp_login: !!allowSmsOtpLogin
      });
      setSuccess('Verification & OTP settings updated successfully.');
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification & OTP Settings"
        sub="Configure multi-factor authentication, one-time passcode lifetimes, retry thresholds, and account security checks"
      />

      {err && <ErrorNote message={err} />}
      {success && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 max-w-2xl space-y-6">
        <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2 border-b border-ink-100 pb-3">
          <ShieldCheck className="h-5 w-5 text-brand-600" /> One-Time Password Rules
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="OTP Expiration Window (Minutes)" required>
            <input
              type="number"
              min="1"
              max="60"
              required
              value={otpExpiryMinutes}
              onChange={(e) => setOtpExpiryMinutes(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-ink-500">Duration in minutes before an issued OTP code expires.</p>
          </Field>

          <Field label="Max Failed Attempts Before Lockout" required>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={maxOtpAttempts}
              onChange={(e) => setMaxOtpAttempts(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-ink-500">Maximum invalid entries allowed before blocking resends.</p>
          </Field>

          <Field label="Passcode Length" required>
            <select
              value={otpLength}
              onChange={(e) => setOtpLength(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
            >
              <option value={4}>4 Digits (Standard Fast Mobile)</option>
              <option value={6}>6 Digits (Recommended High Security)</option>
            </select>
          </Field>

          <Field label="Resend Cooldown (Seconds)" required>
            <input
              type="number"
              min="15"
              max="300"
              required
              value={resendCooldownSeconds}
              onChange={(e) => setResendCooldownSeconds(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-ink-500">Cool-off period before a user can request another token.</p>
          </Field>
        </div>

        <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2 border-b border-ink-100 pb-3 pt-3">
          <KeyRound className="h-5 w-5 text-brand-600" /> Account Verification Requirements
        </h3>

        <div className="space-y-4">
          <label className="flex items-start gap-3 rounded-xl border border-ink-100 p-3.5 hover:bg-ink-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={requirePhoneVerification}
              onChange={(e) => setRequirePhoneVerification(e.target.checked)}
              className="mt-0.5 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <p className="text-xs font-bold text-ink-900">Enforce Mobile Phone Verification</p>
              <p className="text-[11px] text-ink-500">Requires customers, riders, and restaurants to verify their telephone number via SMS before placing or accepting orders.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-ink-100 p-3.5 hover:bg-ink-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={requireEmailVerification}
              onChange={(e) => setRequireEmailVerification(e.target.checked)}
              className="mt-0.5 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <p className="text-xs font-bold text-ink-900">Enforce Email Address Verification</p>
              <p className="text-[11px] text-ink-500">Requires all accounts to verify their primary contact email through an activation link or OTP token.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-ink-100 p-3.5 hover:bg-ink-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={allowSmsOtpLogin}
              onChange={(e) => setAllowSmsOtpLogin(e.target.checked)}
              className="mt-0.5 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <p className="text-xs font-bold text-ink-900">Allow Passwordless OTP Mobile Login</p>
              <p className="text-[11px] text-ink-500">Enables users to sign in directly with their phone number and a one-time SMS verification passcode.</p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-100">
          <button
            type="button"
            onClick={load}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

