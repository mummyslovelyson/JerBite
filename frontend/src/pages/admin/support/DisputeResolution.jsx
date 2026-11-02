import { useState, useEffect } from 'react';
import { LifeBuoy, CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [activeTicket, setActiveTicket] = useState(null);
  const [status, setStatus] = useState('resolved');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/support/tickets?category=dispute');
      setDisputes(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/admin/support/tickets/${activeTicket.id}/status`, {
        status,
        notes: notes.trim()
      });
      setActiveTicket(null);
      setNotes('');
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
        title="Dispute Resolution"
        sub="Administrative arbitration between customers, restaurant merchants, and couriers"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : disputes.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No active dispute cases!</h3>
          <p className="text-xs text-ink-500">There are no contentious orders requiring formal arbitration.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="card p-5 border-l-4 border-l-amber-500">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-sm text-amber-700">#{d.ticket_number}</span>
                  <Badge status={d.status} />
                  <span className="text-xs text-ink-500 font-bold uppercase">Role: {d.user_role}</span>
                </div>
                <span className="text-xs text-ink-400">{when(d.created_at)}</span>
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-sm text-ink-900">{d.subject}</h4>
                <p className="mt-1 text-xs text-ink-700">{d.message}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-500">
                  <span>Filed by: <strong className="text-ink-800">{d.user_name}</strong> ({d.user_email})</span>
                  {d.restaurant_name && <span>Associated Store: <strong className="text-ink-800">{d.restaurant_name}</strong></span>}
                </div>
              </div>

              {d.resolution_notes && (
                <div className="mt-3 rounded-lg bg-ink-50 p-3 text-xs text-ink-700">
                  <span className="font-bold text-ink-900">Arbitration Record: </span>
                  {d.resolution_notes}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-ink-100 flex justify-end">
                <button
                  onClick={() => { setActiveTicket(d); setNotes(d.resolution_notes || ''); }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  Arbitrate & Settle Case
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settle Modal */}
      {activeTicket && (
        <Modal
          title={`Arbitrate Dispute: #${activeTicket.ticket_number}`}
          onClose={() => setActiveTicket(null)}
        >
          <form onSubmit={handleResolve} className="space-y-4">
            <Field label="Final Decision">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs bg-white focus:border-brand-500 focus:outline-hidden"
              >
                <option value="resolved">Resolved / Settle with Claimant</option>
                <option value="closed">Dismissed / In Favor of Merchant</option>
                <option value="in_progress">Keep Under Active Investigation</option>
              </select>
            </Field>

            <Field label="Formal Resolution Findings" required>
              <textarea
                rows={4}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document arbitration findings, refund decisions, and justification..."
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
                {submitting ? 'Recording...' : 'Confirm Arbitration Decision'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
