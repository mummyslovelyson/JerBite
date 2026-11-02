import { useState, useEffect } from 'react';
import { Smartphone, Save, RefreshCw, Send, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Field, ErrorNote } from '../../../components/ui';

export default function SmsProviderSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [testSuccess, setTestSuccess] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // SMS Config State
  const [smsProvider, setSmsProvider] = useState('hubtel');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [senderId, setSenderId] = useState('JerBite');
  const [maxChars, setMaxChars] = useState(160);
  const [testPhone, setTestPhone] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/settings/all');
      const data = res.data || {};
      if (data.sms_provider) setSmsProvider(data.sms_provider);
      if (data.sms_api_key) setApiKey(data.sms_api_key);
      if (data.sms_api_secret) setApiSecret(data.sms_api_secret);
      if (data.sms_sender_id) setSenderId(data.sms_sender_id);
      if (data.sms_max_chars) setMaxChars(Number(data.sms_max_chars));
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
      await api.put('/admin/settings/section/sms', {
        sms_provider: smsProvider,
        sms_api_key: apiKey,
        sms_api_secret: apiSecret,
        sms_sender_id: senderId,
        sms_max_chars: Number(maxChars)
      });
      setSuccess('SMS provider settings saved successfully.');
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone) return;
    setTesting(true);
    setTestSuccess('');
    setErr('');
    try {
      await api.post('/admin/notifications/send', {
        channel: 'sms',
        recipient: testPhone,
        title: 'SMS Test',
        body: 'JerBite: Test SMS gateway verification. Outbound SMS dispatch is operational.'
      });
      setTestSuccess(`Test SMS triggered successfully for ${testPhone}.`);
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
        title="SMS Provider Settings"
        sub="Configure cellular SMS aggregators (Hubtel, Arkesel, Termii, Twilio), registered sender IDs, and transactional OTP limits"
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
            <Smartphone className="h-5 w-5 text-brand-600" /> SMS Gateway Integration
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Telecom SMS Aggregator" required>
              <select
                value={smsProvider}
                onChange={(e) => setSmsProvider(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              >
                <option value="hubtel">Hubtel Ghana (Direct MTN / Telecel / AT)</option>
                <option value="arkesel">Arkesel SMS Gateway</option>
                <option value="termii">Termii Africa</option>
                <option value="africastalking">Africa's Talking</option>
                <option value="twilio">Twilio Programmable Messaging</option>
              </select>
            </Field>

            <Field label="Alphanumeric Sender ID" required>
              <input
                type="text"
                required
                maxLength={11}
                placeholder="JerBite"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono uppercase focus:border-brand-500 focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-ink-500">Max 11 alphanumeric characters approved by telcos.</p>
            </Field>

            <Field label="API Client ID / Key" required>
              <input
                type="text"
                required
                placeholder="api_key_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="API Secret / Auth Token" required>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  required
                  placeholder="token_..."
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 p-2.5 pr-9 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-2.5 text-ink-400 hover:text-ink-600"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Max Characters Per Message" required>
              <select
                value={maxChars}
                onChange={(e) => setMaxChars(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              >
                <option value={160}>160 Characters (Single SMS Credit)</option>
                <option value={320}>320 Characters (Two concatenated SMS credits)</option>
              </select>
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

        {/* Live SMS Ping */}
        <div className="card p-6 h-fit space-y-4">
          <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2">
            <Send className="h-5 w-5 text-brand-600" /> Test SMS Delivery
          </h3>
          <p className="text-xs text-ink-500">
            Send an instant test SMS to verify routing, sender ID registration, and telco delivery.
          </p>

          {testSuccess && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
              {testSuccess}
            </div>
          )}

          <form onSubmit={handleSendTest} className="space-y-4">
            <Field label="Recipient Phone Number" required>
              <input
                type="tel"
                required
                placeholder="+233240000000"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-ink-500">Include country code (e.g. +233...)</p>
            </Field>

            <button
              type="submit"
              disabled={testing || !testPhone}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {testing ? 'Sending...' : 'Send Test SMS'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

