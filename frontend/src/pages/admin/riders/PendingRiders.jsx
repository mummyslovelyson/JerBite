import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Eye, RefreshCw, Bike, ShieldCheck } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function PendingRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [modal, setModal] = useState({ open: false, rider: null, action: 'approve', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/riders?status=pending');
      setRiders(res.data);
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
      alert('Please specify reason for rejection');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/admin/riders/${modal.rider.user_id}/review`, {
        action: modal.action,
        note: modal.note.trim()
      });
      setModal({ open: false, rider: null, action: 'approve', note: '' });
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
        title="Pending Rider Approvals"
        sub="Fast-track onboarding queue for couriers whose document checks are ready for final administrative sign-off"
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
      ) : riders.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">Rider approval queue is clear!</h3>
          <p className="text-xs text-ink-500">All submitted riders are authorized.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {riders.map((r) => (
            <div key={r.user_id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold">
                  <Bike className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-ink-900">{r.name}</h3>
                    <Badge status="pending" />
                    <span className="font-bold text-xs text-brand-700 capitalize">{r.vehicle_type || 'Motorcycle'}</span>
                  </div>
                  <p className="text-xs text-ink-600 mt-0.5">
                    Email: <strong>{r.email}</strong> • Phone: {r.phone || 'N/A'}
                  </p>
                  <p className="text-[11px] text-ink-400 mt-0.5">
                    Registered on {when(r.joined_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/riders/details?id=${r.user_id}`}
                  className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                >
                  Full Inspection
                </Link>
                <button
                  onClick={() => setModal({ open: true, rider: r, action: 'reject', note: '' })}
                  className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
                <button
                  onClick={() => setModal({ open: true, rider: r, action: 'approve', note: '' })}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve Driver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <Modal
          title={`${modal.action === 'approve' ? 'Approve' : 'Reject'} Courier: ${modal.rider?.name}`}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <form onSubmit={handleReview} className="space-y-4">
            <Field label="Review Note" hint={modal.action === 'reject' ? 'Required' : 'Optional'}>
              <textarea
                rows={3}
                required={modal.action === 'reject'}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Enter feedback or administrative reason..."
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
                {submitting ? 'Processing...' : `Confirm ${modal.action.toUpperCase()}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
