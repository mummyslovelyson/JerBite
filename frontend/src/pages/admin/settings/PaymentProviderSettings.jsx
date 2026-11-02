import { useState, useEffect } from 'react';
import { CreditCard, Save, RefreshCw, Key, ShieldAlert, CheckCircle2, Copy, Eye, EyeOff } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Field, ErrorNote } from '../../../components/ui';

export default function PaymentProviderSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings State
  const [primaryGateway, setPrimaryGateway] = useState('paystack');
  const [mode, setMode] = useState('test'); // test | live
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [paystackSecretKey, setPaystackSecretKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [enableCod, setEnableCod] = useState(true);
  const [settlementCycle, setSettlementCycle] = useState('weekly');

  const webhookUrl = `${window.location.origin}/api/webhooks/${primaryGateway}`;

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/settings/all');
      const data = res.data || {};
      if (data.primary_payment_gateway) setPrimaryGateway(data.primary_payment_gateway);
      if (data.payment_mode) setMode(data.payment_mode);
      if (data.paystack_public_key) setPaystackPublicKey(data.paystack_public_key);
      if (data.paystack_secret_key) setPaystackSecretKey(data.paystack_secret_key);
      if (data.stripe_publishable_key) setStripePublishableKey(data.stripe_publishable_key);
      if (data.stripe_secret_key) setStripeSecretKey(data.stripe_secret_key);
      if (data.enable_cash_on_delivery !== undefined) setEnableCod(!!data.enable_cash_on_delivery);
      if (data.settlement_cycle) setSettlementCycle(data.settlement_cycle);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    setSuccess('');
    try {
      await api.put('/admin/settings/section/payment', {
        primary_payment_gateway: primaryGateway,
        payment_mode: mode,
        paystack_public_key: paystackPublicKey,
        paystack_secret_key: paystackSecretKey,
        stripe_publishable_key: stripePublishableKey,
        stripe_secret_key: stripeSecretKey,
        enable_cash_on_delivery: !!enableCod,
        settlement_cycle: settlementCycle
      });
      setSuccess('Payment provider settings updated successfully.');
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
        title="Payment Provider Settings"
        sub="Configure payment gateways (Paystack, Stripe), live and sandbox API credentials, webhook endpoints, and payout schedules"
      />

      {err && <ErrorNote message={err} />}
      {success && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 max-w-3xl space-y-6">
        <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2 border-b border-ink-100 pb-3">
          <CreditCard className="h-5 w-5 text-brand-600" /> Payment Processing Engine
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Primary Payment Gateway" required>
            <select
              value={primaryGateway}
              onChange={(e) => setPrimaryGateway(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
            >
              <option value="paystack">Paystack (Recommended for Ghana & Nigeria - Mobile Money / Cards)</option>
              <option value="stripe">Stripe (International Cards & Wallets)</option>
              <option value="flutterwave">Flutterwave (Pan-African Cards & MoMo)</option>
            </select>
          </Field>

          <Field label="Gateway Environment Mode" required>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-semibold focus:border-brand-500 focus:outline-hidden"
            >
              <option value="test">Sandbox / Test Mode (Simulated funds)</option>
              <option value="live">Live / Production (Real debits and transfers)</option>
            </select>
          </Field>
        </div>

        {/* Webhook notification URL */}
        <div className="rounded-xl bg-ink-50 p-4 border border-ink-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-800 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-brand-600" /> Webhook Listener URL
            </span>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
          <p className="text-[11px] text-ink-500">
            Paste this URL into your {primaryGateway} merchant dashboard webhooks settings to receive instant charge & refund updates.
          </p>
          <div className="font-mono text-[11px] text-ink-700 bg-white p-2.5 rounded-lg border border-ink-200 break-all select-all">
            {webhookUrl}
          </div>
        </div>

        {/* Paystack Credentials */}
        {primaryGateway === 'paystack' && (
          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-sm text-ink-900">Paystack Credentials</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Paystack Public Key (pk_test_... or pk_live_...)" required>
                <input
                  type="text"
                  placeholder="pk_test_xxxxxxxxxxxxxxxxxxxx"
                  value={paystackPublicKey}
                  onChange={(e) => setPaystackPublicKey(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
                />
              </Field>

              <Field label="Paystack Secret Key (sk_test_... or sk_live_...)" required>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="sk_test_xxxxxxxxxxxxxxxxxxxx"
                    value={paystackSecretKey}
                    onChange={(e) => setPaystackSecretKey(e.target.value)}
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
            </div>
          </div>
        )}

        {/* Stripe Credentials */}
        {primaryGateway === 'stripe' && (
          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-sm text-ink-900">Stripe Credentials</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Stripe Publishable Key (pk_test_...)" required>
                <input
                  type="text"
                  placeholder="pk_test_xxxxxxxxxxxxxxxxxxxx"
                  value={stripePublishableKey}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
                />
              </Field>

              <Field label="Stripe Secret Key (sk_test_...)" required>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="sk_test_xxxxxxxxxxxxxxxxxxxx"
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
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
            </div>
          </div>
        )}

        {/* Additional Payment Rules */}
        <div className="space-y-4 pt-4 border-t border-ink-100">
          <h4 className="font-bold text-sm text-ink-900">Settlements & Payment Options</h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Restaurant Settlement Cycle">
              <select
                value={settlementCycle}
                onChange={(e) => setSettlementCycle(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              >
                <option value="daily">Daily Auto-Settlement (T+1)</option>
                <option value="weekly">Weekly Auto-Settlement (Every Monday)</option>
                <option value="biweekly">Bi-Weekly Settlement</option>
                <option value="manual">Manual Admin Payout Only</option>
              </select>
            </Field>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCod}
                  onChange={(e) => setEnableCod(e.target.checked)}
                  className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs font-bold text-ink-800">Allow Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>
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

