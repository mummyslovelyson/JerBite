import { useState, useEffect } from 'react';
import { Smartphone, Send, RefreshCw, CheckCircle2, MessageSquare } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Field, ErrorNote } from '../../../components/ui';

export default function SmsNotifications() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Form state
  const [phone, setPhone] = useState('');
  const [targetRole, setTargetRole] = useState('rider');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/notifications/logs?channel=sms');
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
    if (!message.trim()) return;
    setSending(true);
    setSuccessMsg('');
    try {
      await api.post('/admin/notifications/send', {
        channel: 'sms',
        recipient: phone.trim(),
        message: message.trim(),
        targetRole
      });
      setSuccessMsg('SMS text dispatched successfully to telecommunication gateway.');
      setMessage('');
      setPhone('');
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
        title="SMS Notifications"
        sub="Broadcast instant cellular SMS text alerts and monitor SMS delivery confirmations"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SMS Sender */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
            <Smartphone className="h-4 w-4 text-brand-600" />
            <h3 className="font-extrabold text-sm text-ink-900">Transmit SMS Message</h3>
          </div>

          <form onSubmit={handleSend} className="space-y-3.5 text-xs">
            <Field label="Recipient Target Role">
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 bg-white text-xs focus:border-brand-500 focus:outline-hidden"
              >
                <option value="rider">Rider Fleet (Couriers)</option>
                <option value="customer">Customers</option>
                <option value="manager">Restaurant Managers</option>
                <option value="all">Broadcast to All Users</option>
              </select>
            </Field>

            <Field label="Specific Phone Number (Optional)">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="SMS Body (160 characters per segment)" required>
              <textarea
                rows={4}
                required
                maxLength={320}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type SMS text..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-ink-400 mt-1 block">
                {message.length} / 320 characters ({Math.ceil(message.length / 160) || 1} SMS segment)
              </span>
            </Field>

            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 p-2.5 font-bold text-white shadow-xs hover:bg-brand-700"
            >
              <Send className="h-4 w-4" /> {sending ? 'Dispatching SMS...' : 'Send SMS Message'}
            </button>
          </form>
        </div>

        {/* Outbound SMS Logs */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <h3 className="font-extrabold text-sm text-ink-900">Dispatched SMS History ({logs.length})</h3>
            <span className="text-[11px] text-ink-400">Termii / Twilio</span>
          </div>

          {loading ? (
            <Spinner />
          ) : logs.length === 0 ? (
            <p className="py-8 text-center text-xs text-ink-400">No outbound SMS logged.</p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-ink-100 bg-ink-50/50 p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-ink-900">{log.recipient}</span>
                    <Badge status={log.status} />
                  </div>
                  <p className="text-ink-600">{log.content}</p>
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
