import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, CheckCircle2, XCircle, Eye, RefreshCw, AlertCircle, Store } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function PendingFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [modal, setModal] = useState({ open: false, food: null, action: 'approve', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/products?status=pending');
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

  const handleReview = async (e) => {
    e.preventDefault();
    if (modal.action === 'reject' && !modal.note.trim()) {
      alert('Please state a reason for rejecting this dish.');
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
        title="Pending Food Approvals"
        sub="Dishes submitted by restaurant partners awaiting food safety and compliance authorization before appearing live"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Queue
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : foods.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">Food moderation queue is empty!</h3>
          <p className="text-xs text-ink-500">All submitted items have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((f) => (
            <div key={f.id} className="card p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start gap-3">
                  {f.image_url ? (
                    <img src={f.image_url} alt={f.name} className="h-16 w-16 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                      🍲
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <Badge status="pending" />
                      <span className="font-extrabold text-sm text-brand-700">{money(f.price)}</span>
                    </div>
                    <h4 className="mt-1 font-bold text-sm text-ink-900 truncate">{f.name}</h4>
                    <p className="text-xs text-brand-600 font-medium truncate flex items-center gap-1">
                      <Store className="h-3 w-3" /> {f.restaurant_name}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-ink-600 line-clamp-2">
                  {f.description || 'No description provided by restaurant.'}
                </p>
                <p className="mt-2 text-[11px] text-ink-400">Category: {f.category_name || 'General'}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-ink-100 flex items-center justify-between">
                <Link
                  to={`/admin/food/details?id=${f.id}`}
                  className="text-xs font-bold text-ink-600 hover:text-ink-900"
                >
                  Inspect
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setModal({ open: true, food: f, action: 'reject', note: '' })}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setModal({ open: true, food: f, action: 'approve', note: '' })}
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      {modal.open && (
        <Modal
          title={`${modal.action === 'approve' ? 'Approve' : 'Reject'} ${modal.food?.name}`}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <form onSubmit={handleReview} className="space-y-4">
            <p className="text-xs text-ink-600">
              Restaurant: <strong>{modal.food?.restaurant_name}</strong> • Price: <strong>{money(modal.food?.price)}</strong>
            </p>

            <Field label="Review Feedback" hint={modal.action === 'reject' ? 'Mandatory for restaurant' : 'Optional'}>
              <textarea
                rows={3}
                required={modal.action === 'reject'}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Enter note or reason for decision..."
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
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs ${
                  modal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? 'Updating...' : `Confirm ${modal.action.toUpperCase()}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
