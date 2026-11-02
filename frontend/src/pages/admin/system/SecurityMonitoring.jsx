import { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2, Lock, AlertTriangle, Eye } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Stat, ErrorNote } from '../../../components/ui';

export default function SecurityMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/system/security');
      setData(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) return <Spinner />;

  const alerts = data?.alerts || [];
  const failed24h = data?.failed24h || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Monitoring"
        sub="Continuous authentication watchdog: brute-force mitigation, IP tracking, and suspicious authorization events"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Security Status
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {/* Security KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Failed Auth Events (24h)" value={failed24h} hint="Blocked credential attempts" icon={ShieldAlert} tone="amber" />
        <Stat label="Active Threat Level" value="Low / Normal" hint="No automated attack patterns" icon={Lock} tone="green" />
        <Stat label="Total Monitored Incidents" value={alerts.length} hint="Stored security events" icon={AlertTriangle} tone="orange" />
      </div>

      {/* Security Alerts Stream */}
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold text-sm text-ink-900">Authentication & Security Event Log</h3>
        {alerts.length === 0 ? (
          <div className="py-12 text-center text-ink-400">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h4 className="mt-2 font-bold text-sm text-ink-900">Zero security incidents detected!</h4>
            <p className="text-xs text-ink-500">System credentials and sessions are securely functioning.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((al) => (
              <div key={al.id} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-ink-900">{al.title}</p>
                      <span className="rounded-md bg-rose-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-rose-800 uppercase">
                        {al.event_type}
                      </span>
                    </div>
                    <p className="text-ink-600 mt-0.5">{al.message}</p>
                    <p className="text-[10px] text-ink-400 mt-1">IP: {al.ip_address || 'Internal Network'} • User Agent: {al.user_agent || 'Unknown'}</p>
                  </div>
                </div>

                <span className="text-[10px] text-ink-400 shrink-0">{when(al.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
