import { useState, useEffect } from 'react';
import { Percent, Save, RefreshCw, CheckCircle2, DollarSign, Calculator } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Field, ErrorNote } from '../../../components/ui';

export default function TaxCommissionSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  // Tax and Commission State
  const [commissionPercent, setCommissionPercent] = useState(15);
  const [riderSharePercent, setRiderSharePercent] = useState(80);
  const [vatPercent, setVatPercent] = useState(15);
  const [taxNumber, setTaxNumber] = useState('P0001234567');
  const [taxOnFood, setTaxOnFood] = useState(true);
  const [taxOnDelivery, setTaxOnDelivery] = useState(false);
  const [minPayoutAmount, setMinPayoutAmount] = useState(50);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/settings/all');
      const data = res.data || {};
      if (data.commission_percent !== undefined) setCommissionPercent(Number(data.commission_percent));
      if (data.rider_share_percent !== undefined) setRiderSharePercent(Number(data.rider_share_percent));
      if (data.vat_percent !== undefined) setVatPercent(Number(data.vat_percent));
      if (data.tax_identification_number) setTaxNumber(data.tax_identification_number);
      if (data.tax_on_food !== undefined) setTaxOnFood(!!data.tax_on_food);
      if (data.tax_on_delivery !== undefined) setTaxOnDelivery(!!data.tax_on_delivery);
      if (data.min_payout_amount !== undefined) setMinPayoutAmount(Number(data.min_payout_amount));
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
      await api.put('/admin/settings/section/tax-commission', {
        commissionPercent: Number(commissionPercent),
        rider_share_percent: Number(riderSharePercent),
        vat_percent: Number(vatPercent),
        tax_identification_number: taxNumber,
        tax_on_food: !!taxOnFood,
        tax_on_delivery: !!taxOnDelivery,
        min_payout_amount: Number(minPayoutAmount)
      });
      setSuccess('Tax and commission policies saved successfully.');
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
        title="Tax & Commission Settings"
        sub="Configure marketplace take-rates, vendor commission splits, rider delivery margins, and government tax/VAT rates"
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
          <Percent className="h-5 w-5 text-brand-600" /> Platform Marketplace Commissions
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Restaurant Take Rate / Commission (%)" required>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                required
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 pr-8 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-ink-400">%</span>
            </div>
            <p className="mt-1 text-[11px] text-ink-500">Deducted automatically from vendor food subtotal on each completed order.</p>
          </Field>

          <Field label="Rider Delivery Share (%)" required>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={riderSharePercent}
                onChange={(e) => setRiderSharePercent(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 pr-8 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-ink-400">%</span>
            </div>
            <p className="mt-1 text-[11px] text-ink-500">Percentage of customer delivery fee credited to the assigned courier.</p>
          </Field>

          <Field label="Minimum Settlement Payout Threshold" required>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="5"
                required
                value={minPayoutAmount}
                onChange={(e) => setMinPayoutAmount(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
              />
            </div>
            <p className="mt-1 text-[11px] text-ink-500">Minimum accrued balance required before an automatic disbursement is created.</p>
          </Field>
        </div>

        <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2 border-b border-ink-100 pb-3 pt-3">
          <Calculator className="h-5 w-5 text-brand-600" /> Government Sales Tax / VAT
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Standard VAT / Sales Tax Rate (%)" required>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                required
                value={vatPercent}
                onChange={(e) => setVatPercent(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 pr-8 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-ink-400">%</span>
            </div>
          </Field>

          <Field label="Tax Identification Number (TIN / VAT ID)">
            <input
              type="text"
              placeholder="e.g. C0001234567"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono uppercase focus:border-brand-500 focus:outline-hidden"
            />
          </Field>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={taxOnFood}
              onChange={(e) => setTaxOnFood(e.target.checked)}
              className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-bold text-ink-800">Apply sales tax / VAT to food cart items</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={taxOnDelivery}
              onChange={(e) => setTaxOnDelivery(e.target.checked)}
              className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-bold text-ink-800">Apply sales tax / VAT to delivery and logistics fees</span>
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

