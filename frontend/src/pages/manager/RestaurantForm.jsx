import { useState } from 'react';
import {
  Building, ExternalLink, Image as ImageIcon, MapPin, Navigation, Phone,
  Store, Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { assetUrl, errMsg } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Field, ErrorNote, Badge } from '../../components/ui';

const hhmm = (t) => (t ? t.slice(0, 5) : '');

// Used for first-time setup (POST) and for editing (PUT). Starts empty on setup.
export default function RestaurantForm({ existing, onDone }) {
  const { refresh } = useAuth();
  const [f, setF] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    cuisine: existing?.cuisine || '',
    phone: existing?.phone || '',
    email: existing?.email || '',
    address: existing?.address || '',
    city: existing?.city || '',
    openingTime: hhmm(existing?.opening_time),
    closingTime: hhmm(existing?.closing_time),
    deliveryFee: existing?.delivery_fee ?? '',
    minOrder: existing?.min_order ?? '',
    prepTime: existing?.prep_time_minutes ?? '',
    latitude: existing?.latitude ?? '',
    longitude: existing?.longitude ?? ''
  });

  const [files, setFiles] = useState({});
  const [logoPreview, setLogoPreview] = useState(existing?.logo_url ? assetUrl(existing.logo_url) : null);
  const [coverPreview, setCoverPreview] = useState(existing?.cover_url ? assetUrl(existing.cover_url) : null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, cover: file }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const useHere = () => {
    if (!navigator.geolocation) return setError('Your browser cannot share its location');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setF((x) => ({
          ...x,
          latitude: p.coords.latitude.toFixed(6),
          longitude: p.coords.longitude.toFixed(6)
        }));
        toast.success('Restaurant coordinates detected');
      },
      () => setError('Location permission was denied. You can type the coordinates manually.')
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (files.logo) fd.append('logo', files.logo);
    if (files.cover) fd.append('cover', files.cover);
    try {
      await (existing ? api.put('/manager/restaurant', fd) : api.post('/manager/restaurant', fd));
      await refresh();
      toast.success(existing ? 'Restaurant details saved' : 'Submitted for admin review');
      onDone?.();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6 space-y-6">
      {/* Rejection Alert if applicable */}
      {existing?.status === 'rejected' && existing?.review_note && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
          <p className="font-bold mb-1">Feedback from Administrator Review:</p>
          <p>{existing.review_note}</p>
          <p className="mt-1 text-ink-500">
            Please resolve the items above and save changes. Your restaurant will automatically be resubmitted for approval.
          </p>
        </div>
      )}

      {/* Section 1: Brand & Profile */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-700 flex items-center gap-2 border-b border-ink-100 pb-2">
          <Store className="h-4 w-4 text-brand-600" /> 1. Brand Identity & Overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Restaurant Name"
            className="sm:col-span-2"
            value={f.name}
            onChange={set('name')}
            required
            placeholder="e.g. Mama's Kitchen & Grill"
          />

          <Field
            label="Description & Story"
            className="sm:col-span-2"
          >
            <textarea
              className="input min-h-24 text-sm"
              value={f.description}
              onChange={set('description')}
              required
              placeholder="Tell customers about your kitchen, specialties, and ingredients."
            />
          </Field>

          <Field
            label="Cuisine Specialty"
            value={f.cuisine}
            onChange={set('cuisine')}
            placeholder="e.g. Ghanaian, Nigerian, Fast Food, Pizza, Grill"
          />

          <Field
            label="City"
            value={f.city}
            onChange={set('city')}
            required
            placeholder="e.g. Accra, Kumasi, Lagos"
          />
        </div>

        {/* Logo & Cover Photos with Live Previews */}
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1">Restaurant Logo</label>
            {logoPreview && (
              <div className="mb-2 relative h-24 w-24 rounded-xl overflow-hidden border border-ink-200 bg-ink-100">
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="input text-xs"
              onChange={handleLogoFile}
            />
            <span className="text-[11px] text-ink-500 mt-1 block">Square JPG/PNG (500×500 recommended)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1">Cover Banner Photo</label>
            {coverPreview && (
              <div className="mb-2 relative h-24 w-full rounded-xl overflow-hidden border border-ink-200 bg-ink-100">
                <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="input text-xs"
              onChange={handleCoverFile}
            />
            <span className="text-[11px] text-ink-500 mt-1 block">Wide banner JPG/PNG (1200×400 recommended)</span>
          </div>
        </div>
      </div>

      {/* Section 2: Contact & Physical Location */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-700 flex items-center gap-2 border-b border-ink-100 pb-2">
          <MapPin className="h-4 w-4 text-brand-600" /> 2. Contact & Physical Location
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Business Phone"
            type="tel"
            value={f.phone}
            onChange={set('phone')}
            required
            placeholder="+233 24 123 4567"
          />

          <Field
            label="Business Email"
            type="email"
            value={f.email}
            onChange={set('email')}
            placeholder="orders@restaurant.com"
          />

          <Field
            label="Physical Street Address & Landmark"
            className="sm:col-span-2"
            value={f.address}
            onChange={set('address')}
            required
            placeholder="e.g. 14 Oxford Street, near Total Station, Osu"
            hint="Provide clear directions so pickup riders can easily locate your kitchen."
          />
        </div>

        {/* Geolocation Coordinates */}
        <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                GPS Geolocation Coordinates
              </h3>
              <p className="text-[11px] text-ink-500">
                Used to determine delivery radius. Customers beyond the allowed platform radius will not be able to order.
              </p>
            </div>
            <button
              type="button"
              className="btn-ghost text-xs font-semibold inline-flex items-center gap-1.5"
              onClick={useHere}
            >
              <Navigation className="h-3.5 w-3.5 text-brand-600" /> Detect Current GPS
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Latitude"
              type="number"
              step="any"
              value={f.latitude}
              onChange={set('latitude')}
              placeholder="e.g. 5.6037"
            />
            <Field
              label="Longitude"
              type="number"
              step="any"
              value={f.longitude}
              onChange={set('longitude')}
              placeholder="e.g. -0.1870"
            />
          </div>

          {f.latitude && f.longitude && (
            <div className="text-[11px]">
              <a
                href={`https://maps.google.com/?q=${f.latitude},${f.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <ExternalLink className="h-3 w-3" /> Test GPS pin in Google Maps
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Delivery Terms & Timing */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-700 flex items-center gap-2 border-b border-ink-100 pb-2">
          <Utensils className="h-4 w-4 text-brand-600" /> 3. Ordering & Delivery Terms
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Delivery Fee"
            type="number"
            min="0"
            step="0.01"
            value={f.deliveryFee}
            onChange={set('deliveryFee')}
            placeholder="0.00"
          />

          <Field
            label="Minimum Order Amount"
            type="number"
            min="0"
            step="0.01"
            value={f.minOrder}
            onChange={set('minOrder')}
            placeholder="0.00"
          />

          <Field
            label="Standard Prep Time (min)"
            type="number"
            min="1"
            value={f.prepTime}
            onChange={set('prepTime')}
            placeholder="30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Default Opens At"
            type="time"
            value={f.openingTime}
            onChange={set('openingTime')}
          />
          <Field
            label="Default Closes At"
            type="time"
            value={f.closingTime}
            onChange={set('closingTime')}
          />
        </div>
      </div>

      <ErrorNote message={error} />

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
        <button className="btn-primary" disabled={busy}>
          {busy ? 'Saving…' : existing ? 'Save Restaurant Profile' : 'Submit Restaurant Profile for Approval'}
        </button>
      </div>
    </form>
  );
}
