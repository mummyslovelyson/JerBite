import { useState, useEffect } from 'react';
import { LifeBuoy, Search, Eye, MessageSquare, CheckCircle2, RefreshCw, User } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function CustomerComplaints() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/support/tickets?userRole=customer&category=complaint&search=${encodeURIComponent(search)}`);
      setTickets(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/admin/support/tickets/${activeTicket.id}/reply`, { message: replyMessage.trim() });
      setActiveTicket(null);
      setReplyMessage('');
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (ticket, status) => {
    try {
      await api.patch(`/admin/support/tickets/${ticket.id}/status`, { status });
      load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Complaints"
        sub="Diner grievance log: food hygiene issues, missing items, late deliveries, and driver etiquette"
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
              placeholder="Search customer complaints..."
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
      ) : tickets.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">Zero customer complaints!</h3>
          <p className="text-xs text-ink-500">Customers are satisfied with their delivery experiences.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="card p-5 border-l-4 border-l-rose-500">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-sm text-rose-700">#{t.ticket_number}</span>
                  <Badge status={t.status} />
                  <span className="text-xs text-ink-500 font-bold">
                    Diner: {t.user_name} ({t.user_email})
                  </span>
                </div>
                <span className="text-xs text-ink-400">{when(t.created_at)}</span>
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-sm text-ink-900">{t.subject}</h4>
                <p className="mt-1 text-xs text-ink-600">{t.message}</p>
                {t.restaurant_name && (
                  <p className="mt-2 text-xs text-ink-500">
                    Target Restaurant: <strong className="text-ink-800">{t.restaurant_name}</strong>
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {t.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus(t, 'resolved')}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setActiveTicket(t)}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
                >
                  Reply to Customer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      {activeTicket && (
        <Modal
          title={`Reply to Complaint #${activeTicket.ticket_number}`}
          onClose={() => setActiveTicket(null)}
        >
          <form onSubmit={handleReply} className="space-y-4">
            <div className="rounded-xl bg-ink-50 p-3 text-xs">
              <p className="font-bold text-ink-900">{activeTicket.subject}</p>
              <p className="text-ink-600 mt-1">{activeTicket.message}</p>
            </div>

            <Field label="Response Message">
              <textarea
                rows={4}
                required
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write response..."
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
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
              >
                {submitting ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
