import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, Eye, RefreshCw, ShieldCheck, FileCheck } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function PendingRestaurants() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [modal, setModal] = useState({ open: false, restaurant: null, action: 'approve', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/restaurants?status=pending');
      setPending(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    if (modal.action === 'reject' && !modal.note.trim()) {
      alert('A review reason is mandatory when rejecting');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/admin/restaurants/${modal.restaurant.id}/review`, {
        action: modal.action,
        note: modal.note.trim()
      });
      setModal({ open: false, restaurant: null, action: 'approve', note: '' });
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
        title="Pending Restaurant Approvals"
        sub="Priority moderation queue: Review and verify restaurant credentials before onboarding"
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
      ) : pending.length === 0 ? (
        <div className="card p-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">Queue is completely clear!</h3>
          <p className="text-xs text-ink-500">All submitted restaurant requests have been processed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((r) => (
            <div key={r.id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 font-black text-amber-700 text-lg">
                  {r.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-ink-900 truncate">{r.name}</h3>
                    <Badge status="pending" />
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Owner: <span className="font-semibold text-ink-800">{r.owner_name}</span> ({r.owner_email} / {r.owner_phone || 'No phone'})
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Cuisine: {r.cuisine || 'Unspecified'} • Applied {when(r.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                <Link
                  to={`/admin/restaurants/details?id=${r.id}`}
                  className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5" /> Full Inspection
                </Link>
                <button
                  onClick={() => setModal({ open: true, restaurant: r, action: 'reject', note: '' })}
                  className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
                <button
                  onClick={() => setModal({ open: true, restaurant: r, action: 'approve', note: '' })}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      {modal.open && (
        <Modal
          title={`${modal.action === 'approve' ? 'Approve' : 'Reject'} ${modal.restaurant?.name}`}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <form onSubmit={submitReview} className="space-y-4">
            <p className="text-xs text-ink-600">
              {modal.action === 'approve'
                ? `You are about to approve ${modal.restaurant?.name}. This grants store manager privileges to ${modal.restaurant?.owner_name} and records the action in the system audit log.`
                : `Please document the reason for rejection for compliance and notification purposes.`}
            </p>

            <Field label="Audit Reason & Feedback" hint={modal.action === 'reject' ? 'Required' : 'Optional'}>
              <textarea
                rows={3}
                required={modal.action === 'reject'}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Enter justification..."
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
