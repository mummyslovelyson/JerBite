import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Search, Eye, CheckCircle2, XCircle, RefreshCw, SlidersHorizontal, AlertCircle } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function AllFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [err, setErr] = useState('');

  // Review modal
  const [modal, setModal] = useState({ open: false, food: null, action: 'approve', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/products?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setFoods(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (modal.action === 'reject' && !modal.note.trim()) {
      alert('A reason is required to reject a food listing');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/admin/products/${modal.food.id}/review`, {
        action: modal.action,
        note: modal.note.trim()
      });
      setModal({ open: false, food: null, action: 'approve', note: '' });
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Food Listings"
        sub="Full catalog of dishes, pricing, restaurant associations, and publication status"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by food name or restaurant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved & Live</option>
            <option value="pending">Pending Approval</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={load}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
          >
            Filter
          </button>
        </div>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : foods.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <UtensilsCrossed className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No food items found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Food Item</th>
                  <th className="px-4 py-3.5">Restaurant</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-right">Price</th>
                  <th className="px-4 py-3.5">Availability</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {foods.map((f) => (
                  <tr key={f.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <div className="flex items-center gap-3">
                        {f.image_url ? (
                          <img src={f.image_url} alt={f.name} className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-500 font-bold">
                            🍲
                          </div>
                        )}
                        <div>
                          <p>{f.name}</p>
                          <p className="text-[10px] text-ink-400 font-normal truncate max-w-[180px]">{f.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-800">{f.restaurant_name}</td>
                    <td className="px-4 py-3 text-ink-600">{f.category_name || 'General'}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-ink-900">{money(f.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        f.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {f.is_available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={f.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/food/details?id=${f.id}`}
                          className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                        >
                          Details
                        </Link>
                        {f.status === 'pending' && (
                          <button
                            onClick={() => setModal({ open: true, food: f, action: 'approve', note: '' })}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <Modal
          title={`${modal.action === 'approve' ? 'Approve' : 'Reject'} Food: ${modal.food?.name}`}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <form onSubmit={handleReview} className="space-y-4">
            <Field label="Audit Reason & Feedback" hint={modal.action === 'reject' ? 'Required' : 'Optional'}>
              <textarea
                rows={3}
                required={modal.action === 'reject'}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Write feedback..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal({ ...modal, open: false })}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {submitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
