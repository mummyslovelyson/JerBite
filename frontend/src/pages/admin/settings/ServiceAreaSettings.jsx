import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Save, X } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Field, ErrorNote, Modal } from '../../../components/ui';

export default function ServiceAreaSettings() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [city, setCity] = useState('Accra');
  const [description, setDescription] = useState('');
  const [baseDeliveryFee, setBaseDeliveryFee] = useState('15.00');
  const [isActive, setIsActive] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/delivery-zones');
      setZones(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditingZone(null);
    setName('');
    setCity('Accra');
    setDescription('');
    setBaseDeliveryFee('15.00');
    setIsActive(true);
    setFormErr('');
    setIsModalOpen(true);
  };

  const openEditModal = (zone) => {
    setEditingZone(zone);
    setName(zone.name);
    setCity(zone.city || 'Accra');
    setDescription(zone.description || '');
    setBaseDeliveryFee(zone.base_delivery_fee || '15.00');
    setIsActive(zone.is_active !== undefined ? !!zone.is_active : true);
    setFormErr('');
    setIsModalOpen(true);
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();
    setModalSaving(true);
    setFormErr('');
    try {
      if (editingZone) {
        await api.put(`/admin/delivery-zones/${editingZone.id}`, {
          name,
          city,
          description,
          baseDeliveryFee: Number(baseDeliveryFee),
          isActive
        });
      } else {
        await api.post('/admin/delivery-zones', {
          name,
          city,
          description,
          baseDeliveryFee: Number(baseDeliveryFee)
        });
      }
      setIsModalOpen(false);
      load();
    } catch (e) {
      setFormErr(errMsg(e));
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteZone = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete delivery zone "${name}"?`)) return;
    try {
      await api.delete(`/admin/delivery-zones/${id}`);
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const handleToggleStatus = async (zone) => {
    try {
      await api.put(`/admin/delivery-zones/${zone.id}`, {
        isActive: !zone.is_active
      });
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const filtered = zones.filter((z) => {
    const q = search.toLowerCase();
    return (
      (z.name || '').toLowerCase().includes(q) ||
      (z.city || '').toLowerCase().includes(q) ||
      (z.description || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Service Area Settings"
          sub="Define operational delivery hubs, regional coverage boundaries, municipal zones, and default local dispatch rates"
        />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add Delivery Zone
        </button>
      </div>

      {err && <ErrorNote message={err} />}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-semibold text-ink-500">Configured Zones</p>
          <p className="mt-1 text-2xl font-extrabold text-ink-900">{zones.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold text-ink-500">Active Operational Hubs</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">
            {zones.filter((z) => z.is_active !== false).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold text-ink-500">Cities Covered</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-600">
            {new Set(zones.map((z) => z.city || 'Accra')).size}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search zones by name, city, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50 font-bold text-ink-700">
                <th className="p-3.5">Zone Name</th>
                <th className="p-3.5">City / Region</th>
                <th className="p-3.5">Coverage Description</th>
                <th className="p-3.5">Base Delivery Fee</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((z) => (
                <tr key={z.id} className="hover:bg-ink-50/40">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-brand-50 p-1.5 text-brand-600">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-ink-900">{z.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-ink-700">{z.city || 'Accra'}</td>
                  <td className="p-3.5 text-ink-500 max-w-xs truncate">{z.description || '—'}</td>
                  <td className="p-3.5 font-bold text-ink-900">
                    GH₵{Number(z.base_delivery_fee || 15).toFixed(2)}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleStatus(z)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        z.is_active !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {z.is_active !== false ? (
                        <>
                          <CheckCircle className="h-3 w-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" /> Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(z)}
                      className="rounded-lg border border-ink-200 p-1.5 text-ink-600 hover:bg-ink-100"
                      title="Edit Zone"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(z.id, z.name)}
                      className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                      title="Delete Zone"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-ink-500">
                    No delivery zones match your criteria. Click "Add Delivery Zone" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          title={editingZone ? `Edit Zone: ${editingZone.name}` : 'Create New Delivery Zone'}
          onClose={() => setIsModalOpen(false)}
        >
          {formErr && <ErrorNote message={formErr} />}
          <form onSubmit={handleSaveZone} className="space-y-4 pt-2">
            <Field label="Zone / Neighborhood Name" required>
              <input
                type="text"
                required
                placeholder="e.g. East Legon & Adjiringanor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City / Region" required>
                <input
                  type="text"
                  required
                  placeholder="Accra"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
                />
              </Field>

              <Field label="Base Delivery Fee (GH₵)" required>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={baseDeliveryFee}
                  onChange={(e) => setBaseDeliveryFee(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-hidden"
                />
              </Field>
            </div>

            <Field label="Coverage Description / Key Landmarks">
              <textarea
                rows={3}
                placeholder="Boundary notes, major roads, delivery radius exceptions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <label className="flex items-center gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-bold text-ink-800">Zone is currently open for deliveries</span>
            </label>

            <div className="flex justify-end gap-2 pt-4 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalSaving}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {modalSaving ? 'Saving...' : 'Save Zone'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

