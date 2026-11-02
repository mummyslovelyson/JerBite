import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Store, ArrowRight } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function RestaurantChangeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [err, setErr] = useState('');

  const [modal, setModal] = useState({ open: false, request: null, action: 'approve', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/restaurant-change-requests?status=${statusFilter}`);
      setRequests(res.data);
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
      alert('Please specify why this change request is being rejected.');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/admin/restaurant-change-requests/${modal.request.id}/review`, {
        action: modal.action,
        note: modal.note.trim()
      });
      setModal({ open: false, request: null, action: 'approve', note: '' });
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
        title="Restaurant Profile Change Requests"
        sub="Review requested modifications submitted by managers before updating live restaurant details"
      >
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
          >
            <option value="">All Change Requests</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No change requests found</h3>
          <p className="text-xs text-ink-500">There are no pending profile updates in this view.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((cr) => (
            <div key={cr.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 font-bold text-brand-700">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-ink-900">{cr.restaurant_name}</h3>
                    <p className="text-xs text-ink-500">
                      Requested by <span className="font-semibold text-ink-700">{cr.requester_name}</span> • {when(cr.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge status={cr.status} />
                  {cr.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setModal({ open: true, request: cr, action: 'reject', note: '' })}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setModal({ open: true, request: cr, action: 'approve', note: '' })}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
                      >
                        Approve & Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {cr.reason && (
                <div className="mt-3 text-xs text-ink-700">
                  <span className="font-bold text-ink-900">Manager Reason:</span> {cr.reason}
                </div>
              )}

              {/* Proposed Field Changes Diff */}
              <div className="mt-3 rounded-xl bg-ink-50/70 p-3 border border-ink-100">
                <p className="font-bold text-[11px] uppercase tracking-wider text-ink-500 mb-2">Proposed Field Updates</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.entries(cr.changes || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs border border-ink-200/80">
                      <span className="font-bold text-ink-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-extrabold text-ink-900 truncate max-w-[200px]">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {cr.review_note && (
                <p className="mt-2 text-xs text-ink-500 italic">
                  Auditor Note: {cr.review_note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      {modal.open && (
        <Modal
          title={`${modal.action === 'approve' ? 'Approve & Apply' : 'Reject'} Updates for ${modal.request?.restaurant_name}`}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <form onSubmit={handleReview} className="space-y-4">
            <p className="text-xs text-ink-600">
              {modal.action === 'approve'
                ? `Approving these updates will immediately apply them to the public restaurant listing.`
                : `Please provide a reason why these changes are being declined.`}
            </p>

            <Field label="Decision Reason" hint={modal.action === 'reject' ? 'Required' : 'Optional'}>
              <textarea
                rows={3}
                required={modal.action === 'reject'}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Enter explanation..."
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
                {submitting ? 'Applying...' : `Confirm ${modal.action.toUpperCase()}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
