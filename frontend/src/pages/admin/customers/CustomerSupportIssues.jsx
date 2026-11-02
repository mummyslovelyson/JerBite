import { useState, useEffect } from 'react';
import { LifeBuoy, Search, Eye, MessageSquare, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function CustomerSupportIssues() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  // Reply modal
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/support/tickets?userRole=customer&status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setTickets(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

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
        title="Customer Support Issues"
        sub="Diner queries, missing items, food quality complaints, and delivery arbitration"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Filter and Search */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search tickets by ticket #, customer name, or subject..."
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
            <option value="">All Ticket Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
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
      ) : tickets.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <LifeBuoy className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No active customer issues!</h3>
          <p className="text-xs text-ink-500">All customer support requests are currently resolved.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-sm text-brand-700">#{t.ticket_number}</span>
                  <Badge status={t.status} />
                  <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink-600">
                    {t.category}
                  </span>
                </div>
                <span className="text-xs text-ink-400">{when(t.created_at)}</span>
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-sm text-ink-900">{t.subject}</h4>
                <p className="mt-1 text-xs text-ink-600 line-clamp-2">{t.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-500">
                  <span>Customer: <strong className="text-ink-800">{t.user_name}</strong> ({t.user_email})</span>
                  {t.restaurant_name && <span>Restaurant: <strong className="text-ink-800">{t.restaurant_name}</strong></span>}
                </div>
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
                  {t.status === 'resolved' && (
                    <button
                      onClick={() => updateStatus(t, 'open')}
                      className="rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-1 text-xs font-bold text-ink-700 hover:bg-ink-100"
                    >
                      Reopen
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setActiveTicket(t)}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Reply to Customer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {activeTicket && (
        <Modal
          title={`Respond to Ticket #${activeTicket.ticket_number}`}
          onClose={() => setActiveTicket(null)}
        >
          <form onSubmit={handleReply} className="space-y-4">
            <div className="rounded-xl bg-ink-50 p-3 text-xs">
              <p className="font-bold text-ink-900">{activeTicket.subject}</p>
              <p className="text-ink-600 mt-1">{activeTicket.message}</p>
            </div>

            <Field label="Administrator Response">
              <textarea
                rows={4}
                required
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write message to diner..."
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
                {submitting ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
