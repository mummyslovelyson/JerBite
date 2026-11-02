import { useState, useEffect } from 'react';
import { Activity, Database, Server, Cpu, HardDrive, RefreshCw, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Stat, ErrorNote } from '../../../components/ui';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/system/health');
      setHealth(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) return <Spinner />;

  const formatUptime = (sec) => {
    const d = Math.floor(sec / (3600 * 24));
    const h = Math.floor((sec % (3600 * 24)) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m`;
  };

  const memMb = (bytes) => (bytes ? `${Math.round(bytes / 1024 / 1024)} MB` : 'N/A');

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        sub="Infrastructure telemetry: PostgreSQL database connection, Node.js process runtime, uptime, and memory consumption"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Check Status
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {/* Top Banner Status */}
      <div className="card p-6 border-l-4 border-l-emerald-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-ink-900">All Systems Operational</h2>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                Healthy
              </span>
            </div>
            <p className="text-xs text-ink-500 mt-0.5">JerBite API server and background workers running without degradation</p>
          </div>
        </div>

        <div className="text-right text-xs">
          <p className="text-ink-400">Server Clock:</p>
          <p className="font-mono font-bold text-ink-900">{new Date(health?.serverTime || Date.now()).toUTCString()}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="PostgreSQL DB" value={health?.dbConnected ? 'Connected' : 'Disconnected'} hint="Database pool" icon={Database} tone={health?.dbConnected ? 'green' : 'red'} />
        <Stat label="Process Uptime" value={formatUptime(health?.uptimeSeconds || 0)} hint="Continuous run" icon={Server} tone="orange" />
        <Stat label="Node Runtime" value={health?.nodeVersion || 'v20+'} hint="Engine environment" icon={Cpu} tone="amber" />
        <Stat label="Heap Memory" value={memMb(health?.memoryUsage?.heapUsed)} hint={`Total: ${memMb(health?.memoryUsage?.heapTotal)}`} icon={HardDrive} tone="blue" />
      </div>

      {/* System Metrics Table */}
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold text-sm text-ink-900">Database Record Totals</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
          <div className="rounded-xl bg-ink-50 p-3 text-center">
            <span className="text-ink-400 font-bold text-[10px] uppercase">Registered Users</span>
            <p className="text-xl font-black text-ink-900 mt-1">{health?.metrics?.users || 0}</p>
          </div>
          <div className="rounded-xl bg-ink-50 p-3 text-center">
            <span className="text-ink-400 font-bold text-[10px] uppercase">All Orders</span>
            <p className="text-xl font-black text-ink-900 mt-1">{health?.metrics?.orders || 0}</p>
          </div>
          <div className="rounded-xl bg-ink-50 p-3 text-center">
            <span className="text-ink-400 font-bold text-[10px] uppercase">Payments</span>
            <p className="text-xl font-black text-ink-900 mt-1">{health?.metrics?.payments || 0}</p>
          </div>
          <div className="rounded-xl bg-ink-50 p-3 text-center">
            <span className="text-ink-400 font-bold text-[10px] uppercase">Menu Products</span>
            <p className="text-xl font-black text-ink-900 mt-1">{health?.metrics?.products || 0}</p>
          </div>
          <div className="rounded-xl bg-ink-50 p-3 text-center">
            <span className="text-ink-400 font-bold text-[10px] uppercase">Logged Errors</span>
            <p className="text-xl font-black text-ink-900 mt-1">{health?.metrics?.total_errors || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
