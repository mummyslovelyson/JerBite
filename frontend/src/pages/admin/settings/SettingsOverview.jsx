import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Sliders, Power, Percent, MapPin, Key, CreditCard, Mail, Shield,
  Save, RefreshCw, CheckCircle2, AlertTriangle, Search, Plus, Trash2,
  Edit2, Globe, Bike, DollarSign, ArrowRight, ExternalLink, Copy, Check
} from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import useApi from '../../../hooks/useApi';
import { Spinner, ErrorNote, Modal } from '../../../components/ui';

export default function SettingsOverview({ defaultSection = 'overview' }) {
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Load all settings
  const { data: allSettings, loading, error, reload } = useApi('/admin/settings/all');

  // Zones state
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneSaving, setZoneSaving] = useState(false);
  const [zoneForm, setZoneForm] = useState({
    name: '',
    city: 'Accra',
    description: '',
    baseDeliveryFee: 15,
    isActive: true
  });

  // Main Form State
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (allSettings) {
      setForm({
        // 1. Platform & Operations
        platform_name: allSettings.platform_name ?? 'JerBite Delivery',
        currency_code: allSettings.currency_code ?? 'GHS',
        currency_symbol: allSettings.currency_symbol ?? 'GH₵',
        platform_open: allSettings.platform_open !== undefined ? allSettings.platform_open : true,
        min_order_amount: allSettings.min_order_amount ?? 20,
        support_email: allSettings.support_email ?? 'support@jerbite.com',
        support_phone: allSettings.support_phone ?? '+233 24 000 0000',

        // 2. Tax & Commission
        commission_percent: allSettings.commission_percent ?? 10,
        tax_percent: allSettings.tax_percent ?? 5,

        // 3. Delivery Fee Parameters
        base_delivery_fee: allSettings.base_delivery_fee ?? 15,
        base_distance_km: allSettings.base_distance_km ?? 3,
        per_km_fee: allSettings.per_km_fee ?? 2.5,
        delivery_radius_km: allSettings.delivery_radius_km ?? 20,
        free_delivery_threshold: allSettings.free_delivery_threshold ?? 250,
        surge_multiplier: allSettings.surge_multiplier ?? 1.0,
        enable_dynamic_pricing: allSettings.enable_dynamic_pricing !== undefined ? !!allSettings.enable_dynamic_pricing : true,

        // 4. Verification & OTP
        otp_expiry_minutes: allSettings.otp_expiry_minutes ?? 10,
        max_otp_attempts: allSettings.max_otp_attempts ?? 5,

        // 5. Payment Provider
        payment_provider: typeof allSettings.payment_provider === 'object' && allSettings.payment_provider !== null
          ? allSettings.payment_provider
          : { provider: 'paystack', mode: 'test', public_key: '' },

        // 6. Email Provider
        email_provider: typeof allSettings.email_provider === 'object' && allSettings.email_provider !== null
          ? allSettings.email_provider
          : { provider: 'smtp', from_name: 'JerBite Support', from_email: 'support@jerbite.com' },

        // 7. SMS Provider
        sms_provider: typeof allSettings.sms_provider === 'object' && allSettings.sms_provider !== null
          ? allSettings.sms_provider
          : { provider: 'termii', sender_id: 'JerBite' },

        // 8. Security & Auth Policies
        security_settings: typeof allSettings.security_settings === 'object' && allSettings.security_settings !== null
          ? allSettings.security_settings
          : { max_login_attempts: 5, lockout_minutes: 15, require_verified_email: true, require_verified_phone: true }
      });
    }
  }, [allSettings]);

  // Load delivery zones
  const loadZones = async () => {
    setZonesLoading(true);
    try {
      const res = await api.get('/admin/delivery-zones');
      setZones(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Non-blocking fallback
    } finally {
      setZonesLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  // Save All Settings
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings/all', form);
      // Legacy sync
      await api.put('/admin/settings', {
        commissionPercent: form.commission_percent,
        deliveryRadiusKm: form.delivery_radius_km,
        platformOpen: form.platform_open
      });
      toast.success('All settings saved successfully');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  // Save specific section
  const handleSaveSection = async (sectionName, payload) => {
    setSaving(true);
    try {
      await api.put(`/admin/settings/section/${sectionName}`, payload);
      toast.success('Settings section updated');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  // Zone CRUD
  const openCreateZone = () => {
    setEditingZone(null);
    setZoneForm({
      name: '',
      city: 'Accra',
      description: '',
      baseDeliveryFee: 15,
      isActive: true
    });
    setZoneModalOpen(true);
  };

  const openEditZone = (z) => {
    setEditingZone(z);
    setZoneForm({
      name: z.name,
      city: z.city || 'Accra',
      description: z.description || '',
      baseDeliveryFee: z.base_delivery_fee || 15,
      isActive: z.is_active !== undefined ? !!z.is_active : true
    });
    setZoneModalOpen(true);
  };

  const handleSaveZoneModal = async (e) => {
    e.preventDefault();
    setZoneSaving(true);
    try {
      if (editingZone) {
        await api.put(`/admin/delivery-zones/${editingZone.id}`, {
          name: zoneForm.name,
          city: zoneForm.city,
          description: zoneForm.description,
          baseDeliveryFee: Number(zoneForm.baseDeliveryFee),
          isActive: zoneForm.isActive
        });
        toast.success(`Zone "${zoneForm.name}" updated`);
      } else {
        await api.post('/admin/delivery-zones', {
          name: zoneForm.name,
          city: zoneForm.city,
          description: zoneForm.description,
          baseDeliveryFee: Number(zoneForm.baseDeliveryFee)
        });
        toast.success(`Zone "${zoneForm.name}" created`);
      }
      setZoneModalOpen(false);
      loadZones();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setZoneSaving(false);
    }
  };

  const handleToggleZoneStatus = async (z) => {
    try {
      await api.put(`/admin/delivery-zones/${z.id}`, {
        isActive: !z.is_active
      });
      toast.success(`Zone ${!z.is_active ? 'activated' : 'deactivated'}`);
      loadZones();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const handleDeleteZone = async (z) => {
    if (!window.confirm(`Delete delivery zone "${z.name}"?`)) return;
    try {
      await api.delete(`/admin/delivery-zones/${z.id}`);
      toast.success(`Zone "${z.name}" deleted`);
      loadZones();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/payments/webhook`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    toast.success('Webhook URL copied');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  if (loading || !form) {
    return (
      <div className="space-y-4 py-8">
        <ErrorNote message={error} />
        <Spinner />
      </div>
    );
  }

  const navTabs = [
    { id: 'overview', label: 'Overview Hub', icon: Sliders },
    { id: 'all', label: 'All Settings (Forms)', icon: Globe },
    { id: 'platform', label: 'Platform & Operations', icon: Power },
    { id: 'tax_commission', label: 'Tax & Commission', icon: Percent },
    { id: 'delivery_fee', label: 'Delivery Fees', icon: Bike },
    { id: 'service_areas', label: 'Service Areas & Zones', icon: MapPin },
    { id: 'verification_otp', label: 'Verification & OTP', icon: Key },
    { id: 'payment', label: 'Payment Provider', icon: CreditCard },
    { id: 'email_sms', label: 'Email & SMS Gateways', icon: Mail },
    { id: 'security', label: 'Security Policies', icon: Shield }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink-950">Settings Overview</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
              form.platform_open ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${form.platform_open ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {form.platform_open ? 'Orders Open' : 'Orders Paused'}
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-1">
            Complete platform configuration console. All operational, financial, delivery, communication, and security settings in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { reload(); loadZones(); }}
            className="rounded-xl border border-ink-200 bg-white p-2.5 text-ink-600 hover:bg-ink-50 transition shadow-xs"
            title="Reload settings"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Changes…' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF5A26] to-[#FA4A0C] text-white shadow-sm shadow-orange-500/25 font-extrabold'
                  : 'bg-white border border-[#EFEBE4] text-ink-700 hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2]'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-ink-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 1. SETTINGS OVERVIEW HUB (DASHBOARD CARDS)                     */}
      {/* ============================================================== */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Quick Status Strip */}
          <div className="rounded-2xl border border-ink-200 bg-gradient-to-r from-ink-900 to-ink-950 text-white p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Live Platform Engine</span>
                <h3 className="text-lg font-black text-white mt-0.5">JerBite Platform Configuration Overview</h3>
                <p className="text-xs text-ink-300 mt-1">
                  Currency: <span className="font-mono text-white font-bold">{form.currency_code} ({form.currency_symbol})</span> · Commission: <span className="text-white font-bold">{form.commission_percent}%</span> · Max Radius: <span className="text-white font-bold">{form.delivery_radius_km} km</span> · Zones: <span className="text-white font-bold">{zones.length} Active</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = !form.platform_open;
                    setForm({ ...form, platform_open: next });
                    handleSaveSection('platform', { platformOpen: next });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                    form.platform_open
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>{form.platform_open ? 'Pause Platform Ordering' : 'Resume Platform Ordering'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('all')}
                  className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition"
                >
                  Edit All Settings
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Platform & General */}
            <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#FED7C2] hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF2EB] text-[#FF5A26] font-bold">
                    <Power className="h-5 w-5" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    form.platform_open ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {form.platform_open ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-ink-950">Platform &amp; Operations</h4>
                  <p className="text-xs text-ink-500">Core store identity &amp; ordering state</p>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-[#F4EFEA]">
                  <div className="flex justify-between text-ink-600">
                    <span>Platform Name:</span>
                    <span className="font-bold text-ink-900">{form.platform_name}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Currency:</span>
                    <span className="font-mono font-bold text-ink-900">{form.currency_code} ({form.currency_symbol})</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Minimum Basket:</span>
                    <span className="font-bold text-ink-900">{form.currency_symbol} {form.min_order_amount}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Support Email:</span>
                    <span className="font-mono text-ink-700 truncate max-w-[140px]">{form.support_email}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('platform')}
                className="mt-4 flex items-center justify-between w-full text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] pt-3 border-t border-[#F4EFEA] cursor-pointer"
              >
                <span>Configure Platform Settings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 2: Tax & Commission */}
            <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#FED7C2] hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF2EB] text-[#FF5A26] font-bold">
                    <Percent className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#FF5A26] border border-[#FED7C2]">
                    {form.commission_percent}% Commission
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-ink-950">Tax &amp; Commission</h4>
                  <p className="text-xs text-ink-500">Revenue split and customer sales VAT</p>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-[#F4EFEA]">
                  <div className="flex justify-between text-ink-600">
                    <span>Platform Commission:</span>
                    <span className="font-bold text-[#FF5A26]">{form.commission_percent}% of food subtotal</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Sales Tax / VAT:</span>
                    <span className="font-bold text-ink-900">{form.tax_percent}% at checkout</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Restaurant Retains:</span>
                    <span className="font-bold text-emerald-700">{100 - form.commission_percent}%</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('tax_commission')}
                className="mt-4 flex items-center justify-between w-full text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] pt-3 border-t border-[#F4EFEA] cursor-pointer"
              >
                <span>Configure Tax &amp; Commission</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 3: Delivery Fees */}
            <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#FED7C2] hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEF9C3] text-[#F59E0B] font-bold">
                    <Bike className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {form.delivery_radius_km} km Radius
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-ink-950">Delivery &amp; Courier Fees</h4>
                  <p className="text-xs text-ink-500">Dispatch pricing calculation engine</p>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-[#F4EFEA]">
                  <div className="flex justify-between text-ink-600">
                    <span>Base Delivery Fee:</span>
                    <span className="font-bold text-ink-900">{form.currency_symbol} {form.base_delivery_fee} (up to {form.base_distance_km} km)</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Per-Km Surcharge:</span>
                    <span className="font-bold text-ink-900">{form.currency_symbol} {form.per_km_fee} / km</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Free Delivery Above:</span>
                    <span className="font-bold text-emerald-700">{form.currency_symbol} {form.free_delivery_threshold}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Dynamic Surge Pricing:</span>
                    <span className="font-bold text-ink-900">{form.enable_dynamic_pricing ? `Enabled (${form.surge_multiplier}x)` : 'Disabled'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('delivery_fee')}
                className="mt-4 flex items-center justify-between w-full text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] pt-3 border-t border-[#F4EFEA] cursor-pointer"
              >
                <span>Configure Delivery Fees</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 4: Service Areas & Zones */}
            <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#FED7C2] hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#10B981] font-bold">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {zones.length} Zones
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-ink-950">Service Areas &amp; Zones</h4>
                  <p className="text-xs text-ink-500">Operational delivery boundaries</p>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-[#F4EFEA]">
                  <div className="flex justify-between text-ink-600">
                    <span>Covered City:</span>
                    <span className="font-bold text-ink-900">Greater Accra Region</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Active Hubs:</span>
                    <span className="font-bold text-ink-900 truncate max-w-[140px]">
                      {zones.slice(0, 3).map(z => z.name).join(', ') || 'Airport, Osu, East Legon'}
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Zone Fallback:</span>
                    <span className="font-bold text-emerald-700">Radius check fallback</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('service_areas')}
                className="mt-4 flex items-center justify-between w-full text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] pt-3 border-t border-[#F4EFEA] cursor-pointer"
              >
                <span>Manage Service Areas ({zones.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 5: Verification & OTP */}
            <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#FED7C2] hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEF9C3] text-[#F59E0B] font-bold">
                    <Key className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {form.otp_expiry_minutes} Min Expiry
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-ink-950">Verification &amp; OTP</h4>
                  <p className="text-xs text-ink-500">Authentication token security rules</p>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-[#F4EFEA]">
                  <div className="flex justify-between text-ink-600">
                    <span>OTP Expiry:</span>
                    <span className="font-bold text-ink-900">{form.otp_expiry_minutes} minutes</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Max Invalid Attempts:</span>
                    <span className="font-bold text-ink-900">{form.max_otp_attempts} tries</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Email Verification:</span>
                    <span className="font-bold text-emerald-700">{form.security_settings.require_verified_email ? 'Mandatory' : 'Optional'}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Phone Verification:</span>
                    <span className="font-bold text-emerald-700">{form.security_settings.require_verified_phone ? 'Mandatory' : 'Optional'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('verification_otp')}
                className="mt-4 flex items-center justify-between w-full text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] pt-3 border-t border-[#F4EFEA] cursor-pointer"
              >
                <span>Configure OTP Settings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 6: Payment Provider */}
            <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#FED7C2] hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#10B981] font-bold">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    form.payment_provider.mode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {form.payment_provider.mode || 'Test'} Mode
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-ink-950">Payment Gateway</h4>
                  <p className="text-xs text-ink-500">Paystack, Mobile Money &amp; Card checkout</p>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-[#F4EFEA]">
                  <div className="flex justify-between text-ink-600">
                    <span>Gateway:</span>
                    <span className="font-bold text-ink-900 capitalize">{form.payment_provider.provider || 'Paystack'}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Environment:</span>
                    <span className="font-bold text-ink-900 capitalize">{form.payment_provider.mode || 'test'}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Public Key:</span>
                    <span className="font-mono text-xs text-ink-600 truncate max-w-[130px]">
                      {form.payment_provider.public_key ? `${form.payment_provider.public_key.slice(0, 10)}…` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Webhook Status:</span>
                    <span className="font-bold text-emerald-700">Active</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('payment')}
                className="mt-4 flex items-center justify-between w-full text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] pt-3 border-t border-[#F4EFEA] cursor-pointer"
              >
                <span>Configure Payment Gateway</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 7: Email & SMS Dispatch */}
            <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#FED7C2] hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF2EB] text-[#FF5A26] font-bold">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#FF5A26] border border-[#FED7C2]">
                    SMTP &amp; Termii
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-ink-950">Email &amp; SMS Dispatch</h4>
                  <p className="text-xs text-ink-500">Outbound notifications &amp; order receipts</p>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-[#F4EFEA]">
                  <div className="flex justify-between text-ink-600">
                    <span>Email Sender:</span>
                    <span className="font-bold text-ink-900">{form.email_provider.from_name}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>From Address:</span>
                    <span className="font-mono text-xs text-ink-700 truncate max-w-[130px]">{form.email_provider.from_email}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>SMS Gateway:</span>
                    <span className="font-bold text-ink-900 capitalize">{form.sms_provider.provider}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>SMS Sender ID:</span>
                    <span className="font-bold text-[#FF5A26]">{form.sms_provider.sender_id}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('email_sms')}
                className="mt-4 flex items-center justify-between w-full text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] pt-3 border-t border-[#F4EFEA] cursor-pointer"
              >
                <span>Configure Email &amp; SMS</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 8: Security Policies */}
            <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#FED7C2] hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 font-bold">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Protected
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-ink-950">Security &amp; Governance</h4>
                  <p className="text-xs text-ink-500">Brute-force lockout &amp; access defense</p>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-[#F4EFEA]">
                  <div className="flex justify-between text-ink-600">
                    <span>Lockout Threshold:</span>
                    <span className="font-bold text-ink-900">{form.security_settings.max_login_attempts} failed tries</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Lockout Window:</span>
                    <span className="font-bold text-ink-900">{form.security_settings.lockout_minutes} minutes</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Audit Trail:</span>
                    <span className="font-bold text-emerald-700">100% Logged</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('security')}
                className="mt-4 flex items-center justify-between w-full text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] pt-3 border-t border-[#F4EFEA] cursor-pointer"
              >
                <span>Configure Security Policies</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. FORMS SECTIONS (INDIVIDUAL OR "ALL")                         */}
      {/* ============================================================== */}
      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* ---------------- PLATFORM & OPERATIONS ---------------- */}
        {(activeSection === 'all' || activeSection === 'platform') && (
          <div className="card p-6 sm:p-7 space-y-5 border border-ink-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 font-bold">
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink-950">Platform &amp; General Operations</h3>
                  <p className="text-xs text-ink-500">Live ordering switch, currency symbol, and minimum basket sizes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSection('platform', {
                  platformName: form.platform_name,
                  currencyCode: form.currency_code,
                  currencySymbol: form.currency_symbol,
                  platformOpen: form.platform_open,
                  minOrderAmount: form.min_order_amount,
                  supportEmail: form.support_email,
                  supportPhone: form.support_phone
                })}
                className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Save Section
              </button>
            </div>

            {/* Master Switch */}
            <div className={`rounded-2xl border p-4.5 transition ${
              form.platform_open ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/60'
            }`}>
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <span className="font-extrabold text-sm text-ink-900 block">
                    Master Platform Ordering Status: {form.platform_open ? 'Open & Accepting Orders' : 'Paused Platform-Wide'}
                  </span>
                  <p className="text-xs text-ink-600 mt-0.5">
                    When toggled off, diners can browse menus and review dishes, but checkout and ordering will be paused.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.platform_open}
                  onChange={(e) => setForm({ ...form, platform_open: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded-md border-ink-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Platform Brand Name</label>
                <input
                  type="text"
                  required
                  value={form.platform_name}
                  onChange={(e) => setForm({ ...form, platform_name: e.target.value })}
                  className="input font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Platform Currency Code</label>
                <input
                  type="text"
                  required
                  value={form.currency_code}
                  onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })}
                  className="input uppercase font-mono font-bold"
                />
                <p className="text-[11px] text-ink-400">Default: GHS (Ghanaian Cedi), USD, NGN, etc.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={form.currency_symbol}
                  onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Example: GH₵, $, ₦, etc.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Minimum Order Amount ({form.currency_code})</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={form.min_order_amount}
                  onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Minimum food subtotal required before checkout unlocks.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Support Inquiries Email</label>
                <input
                  type="email"
                  required
                  value={form.support_email}
                  onChange={(e) => setForm({ ...form, support_email: e.target.value })}
                  className="input font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Customer Helpline Phone</label>
                <input
                  type="text"
                  required
                  value={form.support_phone}
                  onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
                  className="input font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAX & COMMISSION ---------------- */}
        {(activeSection === 'all' || activeSection === 'tax_commission') && (
          <div className="card p-6 sm:p-7 space-y-5 border border-ink-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink-950">Tax &amp; Commission Settings</h3>
                  <p className="text-xs text-ink-500">Platform revenue share and customer sales tax / VAT</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSection('tax_commission', {
                  commission_percent: form.commission_percent,
                  tax_percent: form.tax_percent
                })}
                className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Save Section
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Platform Commission Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    required
                    value={form.commission_percent}
                    onChange={(e) => setForm({ ...form, commission_percent: Number(e.target.value) })}
                    className="input font-bold pl-8"
                  />
                  <Percent className="absolute left-2.5 top-3 h-3.5 w-3.5 text-ink-400" />
                </div>
                <p className="text-[11px] text-ink-400">
                  Deducted automatically from the restaurant food subtotal on successful orders.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Sales Tax / VAT Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    required
                    value={form.tax_percent}
                    onChange={(e) => setForm({ ...form, tax_percent: Number(e.target.value) })}
                    className="input font-bold pl-8"
                  />
                  <Percent className="absolute left-2.5 top-3 h-3.5 w-3.5 text-ink-400" />
                </div>
                <p className="text-[11px] text-ink-400">
                  Computed during customer checkout according to municipal sales tax regulations.
                </p>
              </div>
            </div>

            {/* Interactive Calculator Preview */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 space-y-2 text-xs">
              <span className="font-black text-purple-900 block">Example Revenue Calculation on GH₵ 100.00 Order:</span>
              <div className="grid grid-cols-3 gap-2 font-mono">
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-ink-500 text-[10px] block">Customer Pays</span>
                  <span className="font-bold text-ink-900 text-sm">GH₵ {(100 + (100 * form.tax_percent / 100)).toFixed(2)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-purple-600 text-[10px] block">Platform Fee ({form.commission_percent}%)</span>
                  <span className="font-bold text-purple-700 text-sm">GH₵ {(100 * form.commission_percent / 100).toFixed(2)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-emerald-600 text-[10px] block">Restaurant Receives</span>
                  <span className="font-bold text-emerald-700 text-sm">GH₵ {(100 - (100 * form.commission_percent / 100)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- DELIVERY FEES ---------------- */}
        {(activeSection === 'all' || activeSection === 'delivery_fee') && (
          <div className="card p-6 sm:p-7 space-y-5 border border-ink-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                  <Bike className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink-950">Delivery &amp; Courier Fee Parameters</h3>
                  <p className="text-xs text-ink-500">Base distance, per-km rate, coverage radius, and surge pricing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSection('delivery-fee', {
                  base_delivery_fee: form.base_delivery_fee,
                  base_distance_km: form.base_distance_km,
                  per_km_fee: form.per_km_fee,
                  deliveryRadiusKm: form.delivery_radius_km,
                  free_delivery_threshold: form.free_delivery_threshold,
                  surge_multiplier: form.surge_multiplier,
                  enable_dynamic_pricing: form.enable_dynamic_pricing
                })}
                className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Save Section
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Base Delivery Fee ({form.currency_code})</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={form.base_delivery_fee}
                  onChange={(e) => setForm({ ...form, base_delivery_fee: Number(e.target.value) })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Baseline charge covering the first few kilometers.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Base Distance Covered (km)</label>
                <input
                  type="number"
                  min="0.5"
                  max="20"
                  step="0.5"
                  required
                  value={form.base_distance_km}
                  onChange={(e) => setForm({ ...form, base_distance_km: Number(e.target.value) })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Included distance before per-km surcharge kicks in.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Per-Km Fee Beyond Base ({form.currency_code})</label>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  required
                  value={form.per_km_fee}
                  onChange={(e) => setForm({ ...form, per_km_fee: Number(e.target.value) })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Rate billed per kilometer after the base distance.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Maximum Service Radius (km)</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  step="1"
                  required
                  value={form.delivery_radius_km}
                  onChange={(e) => setForm({ ...form, delivery_radius_km: Number(e.target.value) })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Orders exceeding this radius are blocked at checkout.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Free Delivery Basket Threshold ({form.currency_code})</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={form.free_delivery_threshold}
                  onChange={(e) => setForm({ ...form, free_delivery_threshold: Number(e.target.value) })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Orders above this qualify for free customer delivery.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Peak / Surge Multiplier</label>
                <input
                  type="number"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  required
                  value={form.surge_multiplier}
                  onChange={(e) => setForm({ ...form, surge_multiplier: Number(e.target.value) })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Applied during high demand, rain, or courier shortages.</p>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-ink-200 bg-ink-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enable_dynamic_pricing}
                onChange={(e) => setForm({ ...form, enable_dynamic_pricing: e.target.checked })}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-xs font-bold text-ink-900 block">Enable Dynamic Distance-Based Calculation</span>
                <span className="text-[11px] text-ink-500">Computes actual road distance between kitchen and drop-off GPS coordinates.</span>
              </div>
            </label>
          </div>
        )}

        {/* ---------------- SERVICE AREAS & ZONES ---------------- */}
        {(activeSection === 'all' || activeSection === 'service_areas') && (
          <div className="card p-6 sm:p-7 space-y-5 border border-ink-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink-950">Service Areas &amp; Operational Delivery Zones</h3>
                  <p className="text-xs text-ink-500">Manage regional hubs, municipal dispatch zones, and custom delivery tariffs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openCreateZone}
                className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Delivery Zone
              </button>
            </div>

            {/* Zones Table */}
            {zonesLoading ? (
              <Spinner />
            ) : zones.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-ink-200 rounded-2xl bg-ink-50/50">
                <MapPin className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-ink-700">No delivery zones configured</p>
                <p className="text-[11px] text-ink-400 mt-0.5">Click "Add Delivery Zone" to define operational zones.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-ink-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ink-50 border-b border-ink-200 font-bold text-ink-600">
                    <tr>
                      <th className="py-2.5 px-4">Zone Name</th>
                      <th className="py-2.5 px-4">City / Region</th>
                      <th className="py-2.5 px-4">Base Fee</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {zones.map((z) => (
                      <tr key={z.id} className="hover:bg-ink-50/50 transition">
                        <td className="py-3 px-4 font-bold text-ink-950">
                          {z.name}
                          {z.description && <span className="block text-[11px] font-normal text-ink-500">{z.description}</span>}
                        </td>
                        <td className="py-3 px-4 text-ink-700">{z.city || 'Accra'}</td>
                        <td className="py-3 px-4 font-bold text-ink-900">{form.currency_symbol} {Number(z.base_delivery_fee || 15).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleZoneStatus(z)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                              z.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-ink-100 text-ink-600'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${z.is_active !== false ? 'bg-emerald-500' : 'bg-ink-400'}`} />
                            {z.is_active !== false ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditZone(z)}
                            className="p-1 text-ink-500 hover:text-ink-900 transition"
                            title="Edit Zone"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteZone(z)}
                            className="p-1 text-rose-500 hover:text-rose-700 transition"
                            title="Delete Zone"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---------------- VERIFICATION & OTP ---------------- */}
        {(activeSection === 'all' || activeSection === 'verification_otp') && (
          <div className="card p-6 sm:p-7 space-y-5 border border-ink-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink-950">Verification &amp; OTP Settings</h3>
                  <p className="text-xs text-ink-500">One-time password lifetime, invalid attempt throttles, and verification policies</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSection('otp', {
                  otp_expiry_minutes: form.otp_expiry_minutes,
                  max_otp_attempts: form.max_otp_attempts
                })}
                className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Save Section
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">OTP Code Expiry Time (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={form.otp_expiry_minutes}
                  onChange={(e) => setForm({ ...form, otp_expiry_minutes: Number(e.target.value) })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Standard expiration window for sign-up and password reset tokens.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Max OTP Attempts Before Invalidation</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={form.max_otp_attempts}
                  onChange={(e) => setForm({ ...form, max_otp_attempts: Number(e.target.value) })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Number of wrong attempts permitted before token revocation.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-ink-200 bg-ink-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.security_settings.require_verified_email}
                  onChange={(e) => setForm({
                    ...form,
                    security_settings: { ...form.security_settings, require_verified_email: e.target.checked }
                  })}
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-ink-900 block">Enforce Verified Email for Checkout</span>
                  <span className="text-[11px] text-ink-500">Requires customers to confirm email token before placing orders.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-ink-200 bg-ink-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.security_settings.require_verified_phone}
                  onChange={(e) => setForm({
                    ...form,
                    security_settings: { ...form.security_settings, require_verified_phone: e.target.checked }
                  })}
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-ink-900 block">Enforce Verified Phone for Registration</span>
                  <span className="text-[11px] text-ink-500">Sends SMS OTP token upon customer/courier registration.</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ---------------- PAYMENT PROVIDER ---------------- */}
        {(activeSection === 'all' || activeSection === 'payment') && (
          <div className="card p-6 sm:p-7 space-y-5 border border-ink-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink-950">Payment Gateway Provider Settings</h3>
                  <p className="text-xs text-ink-500">Configure online debit card, Mobile Money (MoMo), and Paystack integration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSection('payment', {
                  payment_provider: form.payment_provider
                })}
                className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Save Section
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Payment Gateway Provider</label>
                <select
                  value={form.payment_provider.provider || 'paystack'}
                  onChange={(e) => setForm({
                    ...form,
                    payment_provider: { ...form.payment_provider, provider: e.target.value }
                  })}
                  className="input"
                >
                  <option value="paystack">Paystack Payments</option>
                  <option value="hubtel">Hubtel / Ghana Interbank</option>
                  <option value="flutterwave">Flutterwave</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Gateway Environment Mode</label>
                <select
                  value={form.payment_provider.mode || 'test'}
                  onChange={(e) => setForm({
                    ...form,
                    payment_provider: { ...form.payment_provider, mode: e.target.value }
                  })}
                  className="input font-bold"
                >
                  <option value="test">Test Mode (Sandbox)</option>
                  <option value="live">Live Production</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Public Client Key</label>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  value={form.payment_provider.public_key || ''}
                  onChange={(e) => setForm({
                    ...form,
                    payment_provider: { ...form.payment_provider, public_key: e.target.value }
                  })}
                  className="input font-mono text-xs"
                />
              </div>
            </div>

            {/* Webhook notification */}
            <div className="rounded-xl border border-ink-200 bg-ink-50/70 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink-800">Paystack Webhook Endpoint URL:</span>
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                >
                  {copiedWebhook ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedWebhook ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
              <p className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-ink-200 text-ink-700 break-all select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/payments/webhook` : 'https://your-domain.com/api/payments/webhook'}
              </p>
              <p className="text-[11px] text-ink-500">
                Register this endpoint in your Paystack Dashboard under Settings → API Keys &amp; Webhooks. Secret keys are kept server-side in backend/.env for PCI compliance.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- EMAIL & SMS DISPATCH ---------------- */}
        {(activeSection === 'all' || activeSection === 'email_sms') && (
          <div className="card p-6 sm:p-7 space-y-6 border border-ink-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 font-bold">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink-950">Email &amp; SMS Gateway Providers</h3>
                  <p className="text-xs text-ink-500">Outbound transactional receipts, status alerts, and SMS OTP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSection('providers', {
                  email_provider: form.email_provider,
                  sms_provider: form.sms_provider
                })}
                className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Save Section
              </button>
            </div>

            {/* Email sub-section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500">Email Dispatch (SMTP / Mailer)</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-700 block">Sender Display Name</label>
                  <input
                    type="text"
                    required
                    value={form.email_provider.from_name}
                    onChange={(e) => setForm({
                      ...form,
                      email_provider: { ...form.email_provider, from_name: e.target.value }
                    })}
                    className="input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-700 block">Outbound From Address</label>
                  <input
                    type="email"
                    required
                    value={form.email_provider.from_email}
                    onChange={(e) => setForm({
                      ...form,
                      email_provider: { ...form.email_provider, from_email: e.target.value }
                    })}
                    className="input font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SMS sub-section */}
            <div className="space-y-3 pt-3 border-t border-ink-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500">SMS Dispatch (Termii / Gateway)</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-700 block">SMS Gateway Provider</label>
                  <select
                    value={form.sms_provider.provider}
                    onChange={(e) => setForm({
                      ...form,
                      sms_provider: { ...form.sms_provider, provider: e.target.value }
                    })}
                    className="input"
                  >
                    <option value="termii">Termii (Ghana &amp; West Africa)</option>
                    <option value="twilio">Twilio Global SMS</option>
                    <option value="hubtel">Hubtel SMS</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-700 block">SMS Sender ID (Header)</label>
                  <input
                    type="text"
                    maxLength={11}
                    required
                    value={form.sms_provider.sender_id}
                    onChange={(e) => setForm({
                      ...form,
                      sms_provider: { ...form.sms_provider, sender_id: e.target.value }
                    })}
                    className="input font-bold uppercase tracking-wider"
                  />
                  <p className="text-[11px] text-ink-400">Max 11 alphanumeric characters (e.g., JERBITE).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SECURITY POLICIES ---------------- */}
        {(activeSection === 'all' || activeSection === 'security') && (
          <div className="card p-6 sm:p-7 space-y-5 border border-ink-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-bold">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink-950">Security, Lockout &amp; Governance Policies</h3>
                  <p className="text-xs text-ink-500">Brute-force protection thresholds and login cooldown windows</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSection('security', {
                  security_settings: form.security_settings
                })}
                className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Save Section
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Max Failed Login Attempts Before Lockout</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  required
                  value={form.security_settings.max_login_attempts}
                  onChange={(e) => setForm({
                    ...form,
                    security_settings: { ...form.security_settings, max_login_attempts: Number(e.target.value) }
                  })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Protects administrator and customer credentials from automated guessing.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Account Lockout Cooling Period (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  required
                  value={form.security_settings.lockout_minutes}
                  onChange={(e) => setForm({
                    ...form,
                    security_settings: { ...form.security_settings, lockout_minutes: Number(e.target.value) }
                  })}
                  className="input font-bold"
                />
                <p className="text-[11px] text-ink-400">Duration a locked account must wait before next login retry.</p>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        {activeSection !== 'overview' && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-200">
            <button
              type="button"
              onClick={() => reload()}
              className="btn-ghost text-xs"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-3 px-8 text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving All Settings…' : 'Save All Settings'}</span>
            </button>
          </div>
        )}
      </form>

      {/* Delivery Zone Modal */}
      {zoneModalOpen && (
        <Modal
          title={editingZone ? `Edit Zone: ${editingZone.name}` : 'Create Operational Delivery Zone'}
          onClose={() => setZoneModalOpen(false)}
        >
          <form onSubmit={handleSaveZoneModal} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-700 block">Zone Name</label>
              <input
                type="text"
                required
                placeholder="e.g. East Legon, Osu, Tema Community 1"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">City / Territory</label>
                <input
                  type="text"
                  required
                  value={zoneForm.city}
                  onChange={(e) => setZoneForm({ ...zoneForm, city: e.target.value })}
                  className="input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700 block">Zone Base Delivery Fee ({form.currency_code})</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={zoneForm.baseDeliveryFee}
                  onChange={(e) => setZoneForm({ ...zoneForm, baseDeliveryFee: Number(e.target.value) })}
                  className="input font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-700 block">Zone Description / Landmarks</label>
              <textarea
                rows={2}
                placeholder="Covers Boundary Road, American House, A&C Mall corridor..."
                value={zoneForm.description}
                onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                className="input resize-none text-xs"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={zoneForm.isActive}
                onChange={(e) => setZoneForm({ ...zoneForm, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-bold text-ink-800">Zone is Active for Delivery Dispatch</span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setZoneModalOpen(false)}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={zoneSaving}
                className="btn-primary py-2 px-5 text-xs font-bold"
              >
                {zoneSaving ? 'Saving…' : editingZone ? 'Update Zone' : 'Create Zone'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
