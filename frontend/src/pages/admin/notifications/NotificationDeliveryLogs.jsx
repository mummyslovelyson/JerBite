import { useState, useEffect } from 'react';
import { Mail, Smartphone, RefreshCw, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function NotificationDeliveryLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/notifications/logs?channel=${channelFilter}`);
      setLogs(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [channelFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Delivery Logs"
        sub="Audit log of all system and marketing messages dispatched via Email, SMS, and Push channels"
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
        <span className="text-xs font-bold text-ink-600">Filter Channel:</span>
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
        >
          <option value="">All Channels</option>
          <option value="email">Email Logs Only</option>
          <option value="sms">SMS Logs Only</option>
          <option value="in_app">In-App Alerts</option>
        </select>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <p className="text-xs">No delivery logs recorded.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Channel</th>
                  <th className="px-4 py-3.5">Recipient</th>
                  <th className="px-4 py-3.5">Title / Subject</th>
                  <th className="px-4 py-3.5">Content Preview</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold capitalize text-ink-800">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] ${
                        log.channel === 'email' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {log.channel === 'email' ? <Mail className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-ink-900">{log.recipient}</td>
                    <td className="px-4 py-3 font-semibold text-ink-800">{log.title || 'N/A'}</td>
                    <td className="px-4 py-3 text-ink-500 max-w-[280px] truncate">{log.content}</td>
                    <td className="px-4 py-3 text-ink-400 text-[11px]">{when(log.created_at)}</td>
                    <td className="px-4 py-3 text-right"><Badge status={log.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
