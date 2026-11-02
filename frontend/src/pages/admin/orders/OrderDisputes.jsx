import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Search, Eye, RefreshCw, AlertTriangle, MessageSquare, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function OrderDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [err, setErr] = useState('');

  // Mediation resolution dialog
  const [activeTicket, setActiveTicket] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/support/tickets?category=dispute&status=${statusFilter}`);
      setDisputes(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleResolve = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/admin/support/tickets/${activeTicket.id}/status`, {
        status: resolutionStatus,
        notes: resolutionNotes.trim()
      });
      setActiveTicket(null);
      setResolutionNotes('');
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
        title="Order Disputes"
        sub="Mediation queue for customer chargebacks, undelivered claims, damaged parcels, and merchant disputes"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Filter */}
      <div className="card p-4 flex items-center justify-between">
        <span className="text-xs font-bold text-ink-600">Filter Dispute Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
        >
          <option value="">All Dispute Statuses</option>
          <option value="open">Open / Under Review</option>
          <option value="in_progress">In Arbitration</option>
          <option value="resolved">Resolved / Settled</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : disputes.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No open order disputes!</h3>
          <p className="text-xs text-ink-500">All customer claims have been investigated and settled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="card p-5 border-l-4 border-l-amber-500">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-sm text-amber-700">#{d.ticket_number}</span>
                  <Badge status={d.status} />
                  <span className="rounded-full bg-rose-50 text-rose-700 font-bold px-2 py-0.5 text-[10px] uppercase">
                    Dispute
                  </span>
                </div>
                <span className="text-xs text-ink-400">{when(d.created_at)}</span>
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-sm text-ink-900">{d.subject}</h4>
                <p className="mt-1 text-xs text-ink-600">{d.message}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-500">
                  <span>Claimant: <strong className="text-ink-800">{d.user_name}</strong> ({d.user_email})</span>
                  {d.restaurant_name && <span>Respondent: <strong className="text-ink-800">{d.restaurant_name}</strong></span>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                <div>
                  {d.resolution_notes && (
                    <p className="text-[11px] text-ink-500 italic">Resolution: {d.resolution_notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setActiveTicket(d); setResolutionNotes(d.resolution_notes || ''); }}
                    className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
                  >
                    Resolve Dispute
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Dialog */}
      {activeTicket && (
        <Modal
          title={`Arbitration Resolution: #${activeTicket.ticket_number}`}
          onClose={() => setActiveTicket(null)}
        >
          <form onSubmit={handleResolve} className="space-y-4">
            <div className="rounded-xl bg-ink-50 p-3 text-xs">
              <p className="font-bold text-ink-900">{activeTicket.subject}</p>
              <p className="text-ink-600 mt-1">{activeTicket.message}</p>
            </div>

            <Field label="Resolution Outcome">
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs bg-white focus:border-brand-500 focus:outline-hidden"
              >
                <option value="resolved">Resolved in Customer Favor</option>
                <option value="closed">Closed / Claim Dismissed</option>
                <option value="in_progress">Keep in Arbitration</option>
              </select>
            </Field>

            <Field label="Mediation Notes / Justification" required>
              <textarea
                rows={3}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter mediation terms or refund reasoning..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {submitting ? 'Recording...' : 'Finalize Resolution'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
