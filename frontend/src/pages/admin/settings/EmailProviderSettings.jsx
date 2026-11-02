import { useState, useEffect } from 'react';
import { Mail, Save, RefreshCw, Send, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Field, ErrorNote } from '../../../components/ui';

export default function EmailProviderSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [testSuccess, setTestSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email Config State
  const [provider, setProvider] = useState('smtp');
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecurity, setSmtpSecurity] = useState('tls');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromName, setFromName] = useState('JerBite Delivery');
  const [fromEmail, setFromEmail] = useState('no-reply@jerbite.com');
  const [testRecipient, setTestRecipient] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/settings/all');
      const data = res.data || {};
      if (data.email_provider) setProvider(data.email_provider);
      if (data.smtp_host) setSmtpHost(data.smtp_host);
      if (data.smtp_port) setSmtpPort(Number(data.smtp_port));
      if (data.smtp_security) setSmtpSecurity(data.smtp_security);
      if (data.smtp_user) setSmtpUser(data.smtp_user);
      if (data.smtp_pass) setSmtpPass(data.smtp_pass);
      if (data.email_from_name) setFromName(data.email_from_name);
      if (data.email_from_address) setFromEmail(data.email_from_address);
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
      await api.put('/admin/settings/section/email', {
        email_provider: provider,
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        smtp_security: smtpSecurity,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        email_from_name: fromName,
        email_from_address: fromEmail
      });
      setSuccess('Email provider configuration saved successfully.');
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testRecipient) return;
    setTesting(true);
    setTestSuccess('');
    setErr('');
    try {
      await api.post('/admin/notifications/send', {
        channel: 'email',
        recipient: testRecipient,
        title: 'JerBite Email Provider Test',
        body: 'This is a test notification confirming your email gateway credentials are valid and active.'
      });
      setTestSuccess(`Test email dispatched successfully to ${testRecipient}.`);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Provider Settings"
        sub="Configure SMTP servers, SendGrid, Amazon SES credentials, outbound sender identity, and deliverability"
      />

      {err && <ErrorNote message={err} />}
      {success && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSave} className="card p-6 lg:col-span-2 space-y-6">
          <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2 border-b border-ink-100 pb-3">
            <Mail className="h-5 w-5 text-brand-600" /> Outbound Dispatch Gateway
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Service Provider" required>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              >
                <option value="smtp">Custom SMTP Server</option>
                <option value="sendgrid">Twilio SendGrid API</option>
                <option value="ses">Amazon Simple Email Service (SES)</option>
                <option value="mailgun">Mailgun Gateway</option>
                <option value="postmark">Postmark App</option>
              </select>
            </Field>

            <Field label="SMTP Host Server" required>
              <input
                type="text"
                required
                placeholder="smtp.example.com"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Port" required>
              <input
                type="number"
                required
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Encryption Layer" required>
              <select
                value={smtpSecurity}
                onChange={(e) => setSmtpSecurity(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              >
                <option value="tls">STARTTLS (Port 587)</option>
                <option value="ssl">SSL / TLS (Port 465)</option>
                <option value="none">None / Unencrypted (Port 25)</option>
              </select>
            </Field>

            <Field label="SMTP / API Username" required>
              <input
                type="text"
                required
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="SMTP / API Password" required>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 p-2.5 pr-9 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-ink-400 hover:text-ink-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2 border-b border-ink-100 pb-3 pt-3">
            <ShieldCheck className="h-5 w-5 text-brand-600" /> Sender Profile
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="From Sender Display Name" required>
              <input
                type="text"
                required
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="From Sender Email Address" required>
              <input
                type="email"
                required
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
            </Field>
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

        {/* Live Test Panel */}
        <div className="card p-6 h-fit space-y-4">
          <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2">
            <Send className="h-5 w-5 text-brand-600" /> Send Test Email
          </h3>
          <p className="text-xs text-ink-500">
            Verify connectivity with your mail server by sending an instant test ping to your own inbox.
          </p>

          {testSuccess && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
              {testSuccess}
            </div>
          )}

          <form onSubmit={handleSendTest} className="space-y-4">
            <Field label="Recipient Email Address" required>
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <button
              type="submit"
              disabled={testing || !testRecipient}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {testing ? 'Sending...' : 'Send Test Ping'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

