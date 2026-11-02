import { useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote, money } from '../../components/ui';
import toast from 'react-hot-toast';

export default function DeliveryZones() {
  const { data, loading, error, reload } = useApi('/admin/delivery-zones');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Accra');
  const [description, setDescription] = useState('');
  const [baseFee, setBaseFee] = useState('10');
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/delivery-zones', {
        name,
        city,
        description,
        baseDeliveryFee: baseFee
      });
      toast.success('Delivery zone created');
      setName('');
      setDescription('');
      setShowAdd(false);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this delivery zone?')) return;
    try {
      await api.delete(`/admin/delivery-zones/${id}`);
      toast.success('Delivery zone removed');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Delivery Zones &amp; Coverage Areas</h1>
          <p className="text-xs text-ink-500">Configure serviceable operational zones, base dispatch rates, and cities</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add Delivery Zone
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="card p-5 space-y-4 border-brand-200 bg-brand-50/20">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-800">New Delivery Zone</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Zone Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Airport Residential & Osu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">City / Region</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Base Delivery Fee</label>
              <input
                type="number"
                step="0.5"
                required
                value={baseFee}
                onChange={(e) => setBaseFee(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-ink-700 block mb-1">Description / Key Landmarks</label>
            <input
              type="text"
              placeholder="e.g. Covers Ridge, Cantonments, Osu Oxford St"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary text-xs"
            >
              {busy ? 'Saving…' : 'Save Zone'}
            </button>
          </div>
        </form>
      )}

      <ErrorNote message={error} />
      {loading ? (
        <Spinner />
      ) : !data?.length ? (
        <Empty title="No delivery zones configured" hint="Add your first operating delivery zone above." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((z) => (
            <div key={z.id} className="card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
                    <h3 className="font-extrabold text-sm text-ink-950">{z.name}</h3>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Active
                  </span>
                </div>
                <p className="mt-1 text-xs text-brand-700 font-semibold">{z.city}</p>
                {z.description && <p className="mt-2 text-xs text-ink-500 leading-relaxed">{z.description}</p>}
              </div>

              <div className="pt-3 border-t border-ink-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-ink-400 block uppercase font-bold">Base Delivery</span>
                  <span className="font-black text-xs text-ink-950">{money(z.base_delivery_fee)}</span>
                </div>
                <button
                  onClick={() => handleDelete(z.id)}
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  title="Delete zone"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
