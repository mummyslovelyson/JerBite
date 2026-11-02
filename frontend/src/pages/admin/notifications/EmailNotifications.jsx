import { useState, useEffect } from 'react';
import { Mail, Send, RefreshCw, CheckCircle2, Search, AlertCircle } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Field, ErrorNote } from '../../../components/ui';

export default function EmailNotifications() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Compose email form
  const [recipient, setRecipient] = useState('');
  const [targetRole, setTargetRole] = useState('customer');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/notifications/logs?channel=email');
      setLogs(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim()) return;
    setSending(true);
    setSuccessMsg('');
    try {
      await api.post('/admin/notifications/send', {
        channel: 'email',
        recipient: recipient.trim(),
        title: subject.trim(),
        message: message.trim(),
        targetRole
      });
      setSuccessMsg('Email dispatched successfully to delivery queue.');
      setSubject('');
      setMessage('');
      setRecipient('');
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Notifications"
        sub="Dispatch custom email announcements and review outbound SMTP email delivery logs"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Logs
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200">
          {successMsg}
        </div>
      )}

      {/* Two Columns: Compose on Left, Outbound Delivery Log on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Compose Form */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
            <Mail className="h-4 w-4 text-brand-600" />
            <h3 className="font-extrabold text-sm text-ink-900">Send Direct Email</h3>
          </div>

          <form onSubmit={handleSend} className="space-y-3.5 text-xs">
            <Field label="Recipient Target Role">
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 bg-white text-xs focus:border-brand-500 focus:outline-hidden"
              >
                <option value="all">All Platform Users</option>
                <option value="customer">Customers Only</option>
                <option value="manager">Restaurant Managers</option>
                <option value="rider">Rider Fleet</option>
              </select>
            </Field>

            <Field label="Specific Recipient Email (Optional)">
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Leave blank to broadcast to selected role..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Email Subject Line" required>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Important updates regarding JerBite..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Email Message Body" required>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose your message..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 p-2.5 font-bold text-white shadow-xs hover:bg-brand-700"
            >
              <Send className="h-4 w-4" /> {sending ? 'Transmitting Email...' : 'Send Outbound Email'}
            </button>
          </form>
        </div>

        {/* Email Logs */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <h3 className="font-extrabold text-sm text-ink-900">Sent Email History ({logs.length})</h3>
            <span className="text-[11px] text-ink-400">SMTP Gateway</span>
          </div>

          {loading ? (
            <Spinner />
          ) : logs.length === 0 ? (
            <p className="py-8 text-center text-xs text-ink-400">No outbound emails logged.</p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-ink-100 bg-ink-50/50 p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink-900 truncate max-w-[200px]">{log.title || 'Notification'}</span>
                    <Badge status={log.status} />
                  </div>
                  <p className="text-ink-600 font-medium">To: {log.recipient}</p>
                  <p className="text-ink-500 line-clamp-2">{log.content}</p>
                  <p className="text-[10px] text-ink-400 pt-1">{when(log.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
