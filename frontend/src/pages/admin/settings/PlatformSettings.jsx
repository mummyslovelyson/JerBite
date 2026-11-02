import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle2, Globe } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Field, ErrorNote } from '../../../components/ui';

export default function PlatformSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  // Settings state
  const [platformName, setPlatformName] = useState('JerBite Delivery');
  const [currencyCode, setCurrencyCode] = useState('GHS');
  const [currencySymbol, setCurrencySymbol] = useState('GH₵');
  const [platformOpen, setPlatformOpen] = useState(true);
  const [supportEmail, setSupportEmail] = useState('support@jerbite.com');
  const [supportPhone, setSupportPhone] = useState('+233 24 000 0000');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/settings/all');
      const data = res.data || {};
      if (data.platform_name) setPlatformName(data.platform_name);
      if (data.currency_code) setCurrencyCode(data.currency_code);
      if (data.platform_open !== undefined) setPlatformOpen(data.platform_open);
      if (data.support_email) setSupportEmail(data.support_email);
      if (data.support_phone) setSupportPhone(data.support_phone);
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
      await api.put('/admin/settings/section/platform', {
        platformName,
        currencyCode,
        platformOpen,
        supportEmail,
        supportPhone
      });
      setSuccess('Platform settings updated successfully.');
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
        title="Platform Settings"
        sub="Global application identity, marketplace operational status, currency conventions, and corporate support contact"
      />

      {err && <ErrorNote message={err} />}
      {success && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 max-w-2xl space-y-5">
        <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2">
          <Globe className="h-5 w-5 text-brand-600" /> Marketplace Configuration
        </h3>

        <div className="space-y-4">
          <Field label="Application Brand Name" required>
            <input
              type="text"
              required
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Currency Code" required>
              <input
                type="text"
                required
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Currency Symbol">
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Customer Support Email">
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Support Hotline Phone">
              <input
                type="tel"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
            </Field>
          </div>

          {/* Operational Open/Closed Switch */}
          <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-xs text-ink-900">Platform Operational Status</p>
                <p className="text-[11px] text-ink-500 mt-0.5">
                  When toggled OFF, diner checkout is paused across all restaurants.
                </p>
              </div>
              <input
                type="checkbox"
                checked={platformOpen}
                onChange={(e) => setPlatformOpen(e.target.checked)}
                className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 p-3 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Platform Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
