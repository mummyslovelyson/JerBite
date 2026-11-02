import { useState, useEffect } from 'react';
import { ShieldCheck, Search, RefreshCw, Clock, Filter, User } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/system/audit-logs?action=${actionFilter}&search=${encodeURIComponent(search)}`);
      setLogs(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Activity Logs"
        sub="Immutable administrative audit trail recording all sensitive overrides, approvals, bans, and settlements"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Audit Trail
        </button>
      </PageHeader>

      {/* Filter and Search */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by administrator name, entity, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
          >
            <option value="">All Action Types</option>
            <option value="restaurant">Restaurant Approvals/Bans</option>
            <option value="customer">Customer Actions</option>
            <option value="rider">Rider Authorizations</option>
            <option value="refund">Refund Processing</option>
            <option value="status">Order Overrides</option>
            <option value="settings">Settings Changes</option>
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
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <p className="text-xs">No audit logs matching this search criteria.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Admin Operator</th>
                  <th className="px-4 py-3.5">Action Executed</th>
                  <th className="px-4 py-3.5">Target Entity</th>
                  <th className="px-4 py-3.5">Entity Reference</th>
                  <th className="px-4 py-3.5">Payload Details</th>
                  <th className="px-4 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-extrabold text-[10px]">
                        {log.user_name ? log.user_name[0] : 'A'}
                      </span>
                      <span>{log.user_name || 'System Admin'}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-brand-700">{log.action}</td>
                    <td className="px-4 py-3 capitalize text-ink-700 font-semibold">{log.entity_type}</td>
                    <td className="px-4 py-3 font-mono text-ink-500 text-[11px]">{log.entity_id || 'N/A'}</td>
                    <td className="px-4 py-3 max-w-[240px] truncate font-mono text-[11px] text-ink-600">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '')}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-400 text-[11px]">{when(log.created_at)}</td>
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
