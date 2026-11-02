import { useState, useEffect } from 'react';
import { Bike, Save, RefreshCw, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Field, ErrorNote } from '../../../components/ui';

export default function DeliveryFeeSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  // Delivery settings state
  const [baseFee, setBaseFee] = useState(15);
  const [baseDistanceKm, setBaseDistanceKm] = useState(3);
  const [perKmFee, setPerKmFee] = useState(2.5);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(20);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(250);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [enableDynamicPricing, setEnableDynamicPricing] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/settings/all');
      const data = res.data || {};
      if (data.base_delivery_fee !== undefined) setBaseFee(Number(data.base_delivery_fee));
      if (data.base_distance_km !== undefined) setBaseDistanceKm(Number(data.base_distance_km));
      if (data.per_km_fee !== undefined) setPerKmFee(Number(data.per_km_fee));
      if (data.delivery_radius_km !== undefined) setDeliveryRadiusKm(Number(data.delivery_radius_km));
      if (data.free_delivery_threshold !== undefined) setFreeDeliveryThreshold(Number(data.free_delivery_threshold));
      if (data.surge_multiplier !== undefined) setSurgeMultiplier(Number(data.surge_multiplier));
      if (data.enable_dynamic_pricing !== undefined) setEnableDynamicPricing(!!data.enable_dynamic_pricing);
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
      await api.put('/admin/settings/section/delivery-fee', {
        base_delivery_fee: Number(baseFee),
        base_distance_km: Number(baseDistanceKm),
        per_km_fee: Number(perKmFee),
        deliveryRadiusKm: Number(deliveryRadiusKm),
        free_delivery_threshold: Number(freeDeliveryThreshold),
        surge_multiplier: Number(surgeMultiplier),
        enable_dynamic_pricing: !!enableDynamicPricing
      });
      setSuccess('Delivery fee calculation parameters updated successfully.');
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
        title="Delivery Fee Settings"
        sub="Configure base courier fees, distance-based pricing formulas, maximum radius limits, and customer free-delivery promos"
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
          <Bike className="h-5 w-5 text-brand-600" /> Distance-Based Fee Formula
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Base Delivery Fee (GH₵)" required>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={baseFee}
              onChange={(e) => setBaseFee(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-ink-500">Minimum flat dispatch fee charged for short orders.</p>
          </Field>

          <Field label="Base Distance Included (KM)" required>
            <input
              type="number"
              step="0.5"
              min="0.5"
              required
              value={baseDistanceKm}
              onChange={(e) => setBaseDistanceKm(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-ink-500">Distance covered before additional per-km surcharges apply.</p>
          </Field>

          <Field label="Additional Fee Per KM (GH₵)" required>
            <input
              type="number"
              step="0.25"
              min="0"
              required
              value={perKmFee}
              onChange={(e) => setPerKmFee(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-ink-500">Rate charged for each extra kilometer beyond the base distance.</p>
          </Field>

          <Field label="Maximum Delivery Radius (KM)" required>
            <input
              type="number"
              step="1"
              min="1"
              max="100"
              required
              value={deliveryRadiusKm}
              onChange={(e) => setDeliveryRadiusKm(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-ink-500">Orders beyond this straight-line radius will be rejected at checkout.</p>
          </Field>
        </div>

        <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2 border-b border-ink-100 pb-3 pt-3">
          <Navigation className="h-5 w-5 text-brand-600" /> Promos & Dynamic Surge Surcharges
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Free Delivery Minimum Order (GH₵)">
            <input
              type="number"
              step="10"
              min="0"
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-ink-500">Orders above this subtotal qualify for GH₵0 delivery fee (0 to disable).</p>
          </Field>

          <Field label="Peak / Weather Surge Multiplier">
            <select
              value={surgeMultiplier}
              onChange={(e) => setSurgeMultiplier(Number(e.target.value))}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
            >
              <option value={1.0}>1.0x (Standard Normal Pricing)</option>
              <option value={1.25}>1.25x (+25% Moderate Rush Hour / Rain)</option>
              <option value={1.5}>1.50x (+50% High Demand Surge)</option>
              <option value={2.0}>2.0x (+100% Severe Weather / Holiday Peak)</option>
            </select>
          </Field>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableDynamicPricing}
              onChange={(e) => setEnableDynamicPricing(e.target.checked)}
              className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-bold text-ink-800">Enable automatic dynamic distance routing via Google / OpenStreetMap</span>
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

