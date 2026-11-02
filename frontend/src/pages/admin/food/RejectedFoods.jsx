import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, RefreshCw, CheckCircle2, Eye, Search, AlertTriangle, Store } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function RejectedFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const [modal, setModal] = useState({ open: false, food: null, note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/products?status=rejected&search=${encodeURIComponent(search)}`);
      setFoods(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReconsider = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/admin/products/${modal.food.id}/review`, {
        action: 'approve',
        note: modal.note.trim() || 'Approved on reconsideration'
      });
      setModal({ open: false, food: null, note: '' });
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
        title="Rejected Foods"
        sub="Food listings that did not meet catalog guidelines, pricing rules, or photo standards"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Search */}
      <div className="card p-4">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search rejected dishes or restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
          >
            Search
          </button>
        </form>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : foods.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No rejected dishes</h3>
          <p className="text-xs text-ink-500">There are no dishes currently marked as rejected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {foods.map((f) => (
            <div key={f.id} className="card p-5 border-l-4 border-l-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-xl font-bold">
                  🥣
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-ink-900">{f.name}</h3>
                    <Badge status="rejected" />
                    <span className="font-extrabold text-xs text-brand-700">{money(f.price)}</span>
                  </div>
                  <p className="text-xs text-ink-600 mt-0.5">
                    Restaurant: <strong>{f.restaurant_name}</strong>
                  </p>
                  {f.review_note && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Reason: {f.review_note}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/food/details?id=${f.id}`}
                  className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                >
                  Inspect
                </Link>
                <button
                  onClick={() => setModal({ open: true, food: f, note: '' })}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" /> Re-Approve Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Re-approve Modal */}
      {modal.open && (
        <Modal
          title={`Re-Approve ${modal.food?.name}`}
          onClose={() => setModal({ open: false, food: null, note: '' })}
        >
          <form onSubmit={handleReconsider} className="space-y-4">
            <p className="text-xs text-ink-600">
              This will update the item status to <strong>Approved</strong> and publish it live to {modal.food?.restaurant_name}&apos;s menu.
            </p>

            <Field label="Reconsideration Note">
              <textarea
                rows={3}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Reason for overturning rejection..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal({ open: false, food: null, note: '' })}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {submitting ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
