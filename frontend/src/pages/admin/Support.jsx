import { useState } from 'react';
import {
  LifeBuoy, Search, MessageSquare, CheckCircle2, Clock,
  AlertTriangle, User, Store, Send, ShieldAlert, ArrowRight
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminSupport() {
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const { data: tickets, loading, error, reload } = useApi('/admin/support/tickets', { status, category, search });

  // Selected ticket for modal / detail drawer
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const { data: ticketDetail, loading: loadingDetail, reload: reloadDetail } = useApi(
    selectedTicketId ? `/admin/support/tickets/${selectedTicketId}` : null
  );

  const [replyText, setReplyText] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      await api.post(`/admin/support/tickets/${selectedTicketId}/reply`, { message: replyText.trim() });
      toast.success('Reply dispatched to user');
      setReplyText('');
      reloadDetail();
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setBusy(true);
    try {
      await api.patch(`/admin/support/tickets/${selectedTicketId}/status`, {
        status: newStatus,
        notes: resolutionNote
      });
      toast.success(`Ticket marked as ${newStatus}`);
      reloadDetail();
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-ink-950">Support &amp; Dispute Management</h1>
        <p className="text-xs text-ink-500">Handle customer complaints, restaurant disputes, rider tickets, and customer inquiries</p>
      </div>

      {/* Filter and Search */}
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by ticket #, subject or user name…"
            className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-xs text-ink-900 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700"
          >
            <option value="">All Ticket Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700"
          >
            <option value="">All Issue Categories</option>
            <option value="complaint">Customer Complaints</option>
            <option value="dispute">Order Disputes</option>
            <option value="order">Order Issues</option>
            <option value="payment">Payment &amp; Refund</option>
            <option value="delivery">Delivery Issues</option>
          </select>
        </div>
      </div>

      <ErrorNote message={error} />
      {loading ? (
        <Spinner />
      ) : !tickets?.length ? (
        <Empty title="No support tickets found" hint="All user issues are resolved." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3">Ticket #</th>
                  <th className="px-5 py-3">Requester</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-ink-50/50 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-brand-700">
                      {t.ticket_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-ink-950">{t.user_name}</p>
                      <p className="text-[10px] text-ink-400 capitalize">{t.user_role}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase text-ink-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs font-medium text-ink-800 truncate">
                      {t.subject}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={t.status} />
                    </td>
                    <td className="px-5 py-3.5 text-ink-400 text-[11px]">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedTicketId(t.id)}
                        className="rounded-lg border border-ink-200 bg-white px-3 py-1 text-xs font-bold text-brand-700 hover:bg-brand-50 shadow-2xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Details & Conversation Modal */}
      {selectedTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-ink-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-brand-600">
                  {ticketDetail?.ticket?.ticket_number}
                </span>
                <h3 className="font-black text-lg text-ink-950 mt-0.5">
                  {ticketDetail?.ticket?.subject}
                </h3>
                <p className="text-xs text-ink-500">
                  By {ticketDetail?.ticket?.user_name} ({ticketDetail?.ticket?.user_email})
                </p>
              </div>
              <button
                onClick={() => setSelectedTicketId(null)}
                className="rounded-xl p-2 text-ink-400 hover:bg-ink-100"
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <Spinner />
            ) : (
              <div className="space-y-4">
                {/* Initial Description */}
                <div className="rounded-2xl bg-ink-50 p-4 text-xs text-ink-800 leading-relaxed border border-ink-100">
                  <span className="font-bold block text-ink-900 mb-1">Issue Description:</span>
                  {ticketDetail?.ticket?.message}
                </div>

                {/* Messages Timeline */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Discussion History</p>
                  {!ticketDetail?.messages?.length ? (
                    <p className="text-xs text-ink-400 italic">No admin replies sent yet.</p>
                  ) : (
                    ticketDetail.messages.map((m) => (
                      <div key={m.id} className="rounded-xl border border-ink-200 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand-700">{m.sender_name}</span>
                          <span className="text-[10px] text-ink-400">{new Date(m.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-ink-700">{m.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-ink-100 space-y-2">
                  <label className="text-xs font-bold text-ink-700 block">Dispatch Reply</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Type official response to user…"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="input flex-1"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="btn-primary text-xs px-4 flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" /> Send
                    </button>
                  </div>
                </form>

                {/* Resolution Status Actions */}
                <div className="pt-3 border-t border-ink-100 flex items-center justify-between">
                  <span className="text-xs text-ink-500 font-medium">Update Status:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('resolved')}
                      className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('closed')}
                      className="rounded-lg bg-ink-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-ink-700"
                    >
                      Close Ticket
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
