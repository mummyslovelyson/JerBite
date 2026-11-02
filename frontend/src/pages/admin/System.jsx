import { useState } from 'react';
import {
  Shield, Activity, Server, Users, Lock, AlertTriangle,
  CheckCircle2, Clock, Plus, Search, RefreshCw
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote, Stat } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminSystem() {
  const [activeTab, setActiveTab] = useState('health'); // 'health', 'admins', 'audit', 'security', 'errors'

  const { data: health, loading: loadingHealth, reload: reloadHealth } = useApi('/admin/system/health');
  const { data: admins, loading: loadingAdmins, reload: reloadAdmins } = useApi('/admin/system/admins');
  const { data: auditLogs, loading: loadingAudit } = useApi('/admin/system/audit-logs');
  const { data: security, loading: loadingSec } = useApi('/admin/system/security');
  const { data: errorLogs, loading: loadingErrors } = useApi('/admin/system/api-logs');

  // New admin state
  const [showNewAdmin, setShowNewAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/system/admins', {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword
      });
      toast.success('Administrator staff account created');
      setAdminName('');
      setAdminEmail('');
      setAdminPhone('');
      setAdminPassword('');
      setShowNewAdmin(false);
      reloadAdmins();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Security, System &amp; Governance</h1>
          <p className="text-xs text-ink-500">Monitor system health, error traces, audit trails, and manage operator credentials</p>
        </div>
        {activeTab === 'admins' && (
          <button
            onClick={() => setShowNewAdmin(!showNewAdmin)}
            className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Admin Staff
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-200 gap-6 text-xs font-bold overflow-x-auto">
        {[
          { key: 'health', label: 'System Health', icon: Activity },
          { key: 'admins', label: 'Admin Users & Roles', icon: Users },
          { key: 'audit', label: 'Activity Logs', icon: Clock },
          { key: 'security', label: 'Security & Auth Alerts', icon: Shield },
          { key: 'errors', label: 'API Error Logs', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-b-2 border-brand-600 text-brand-700 font-black'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM HEALTH */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Platform State" value="Operational" hint="All services active" icon={Activity} tone="green" />
            <Stat label="Database Connection" value={health?.dbConnected ? 'Connected' : 'Offline'} hint="PostgreSQL Neon" icon={Server} tone={health?.dbConnected ? 'green' : 'red'} />
            <Stat label="Process Uptime" value={`${Math.floor((health?.uptimeSeconds || 0) / 60)} mins`} hint={`Node.js ${health?.nodeVersion || 'v18+'}`} icon={Clock} tone="orange" />
            <Stat label="Total Process Errors" value={health?.metrics?.total_errors || 0} hint="Recorded exceptions" icon={AlertTriangle} tone={health?.metrics?.total_errors > 0 ? 'amber' : 'green'} />
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider flex items-center gap-2">
                <Server className="h-4 w-4 text-brand-600" /> Database Table Counts
              </h3>
              <button onClick={() => reloadHealth()} className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl bg-ink-50 p-3">
                <span className="text-ink-500 block">Users</span>
                <span className="font-black text-base text-ink-900">{health?.metrics?.users || 0}</span>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <span className="text-ink-500 block">Orders</span>
                <span className="font-black text-base text-ink-900">{health?.metrics?.orders || 0}</span>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <span className="text-ink-500 block">Payments</span>
                <span className="font-black text-base text-ink-900">{health?.metrics?.payments || 0}</span>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <span className="text-ink-500 block">Menu Items</span>
                <span className="font-black text-base text-ink-900">{health?.metrics?.products || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADMIN USERS */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {showNewAdmin && (
            <form onSubmit={handleCreateAdmin} className="card p-5 space-y-4 border-brand-200 bg-brand-50/20">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-800">Add Administrator Staff</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">Full Name</label>
                  <input type="text" required value={adminName} onChange={(e) => setAdminName(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">Email Address</label>
                  <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">Phone Number</label>
                  <input type="text" required value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">Temporary Password</label>
                  <input type="password" required minLength={8} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="input" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNewAdmin(false)} className="btn-ghost text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="btn-primary text-xs">
                  {busy ? 'Creating…' : 'Create Admin'}
                </button>
              </div>
            </form>
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3">Administrator</th>
                  <th className="px-5 py-3">Contact Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role &amp; Permissions</th>
                  <th className="px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {admins?.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3.5 font-bold text-ink-950">{a.name}</td>
                    <td className="px-5 py-3.5 text-ink-700">{a.email}</td>
                    <td className="px-5 py-3.5 font-mono text-ink-600">{a.phone}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase text-rose-700">
                        Super Admin (All Privileges)
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-400 text-[11px]">{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT ACTIVITY LOGS */}
      {activeTab === 'audit' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Operator</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Target Entity</th>
                  <th className="px-5 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {!auditLogs?.length ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-ink-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-5 py-3 text-ink-500 text-[11px] font-mono">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-5 py-3 font-bold text-ink-900">{log.user_name || 'System'}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-mono font-bold text-ink-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-600">{log.entity_type} {log.entity_id ? `(#${log.entity_id.slice(0, 8)})` : ''}</td>
                      <td className="px-5 py-3 font-mono text-[11px] text-ink-400">{log.ip_address || '127.0.0.1'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & AUTH ALERTS */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Failed Logins (Last 24h)" value={security?.failed24h || 0} hint="Monitored authentication attempts" icon={AlertTriangle} tone="amber" />
            <Stat label="Security Alerts Count" value={security?.alerts?.length || 0} hint="Flagged sign-ins and OTP events" icon={Shield} tone="orange" />
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-ink-100">
              <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider">
                Authentication Security Events
              </h3>
            </div>
            <div className="divide-y divide-ink-100 text-xs">
              {!security?.alerts?.length ? (
                <p className="p-6 text-center text-ink-400">No security alerts triggered.</p>
              ) : (
                security.alerts.map((a) => (
                  <div key={a.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-950">{a.title}</span>
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase text-rose-700">
                          {a.event_type}
                        </span>
                      </div>
                      <p className="mt-1 text-ink-600">{a.message}</p>
                      <p className="mt-1 font-mono text-[10px] text-ink-400">
                        IP: {a.ip_address || 'Local'} &bull; {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: API ERROR LOGS */}
      {activeTab === 'errors' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500 font-sans">
                <tr>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Endpoint</th>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Error Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {!errorLogs?.length ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-ink-400 font-sans">
                      No system runtime errors logged. Clean operations!
                    </td>
                  </tr>
                ) : (
                  errorLogs.map((e) => (
                    <tr key={e.id} className="hover:bg-rose-50/20 transition">
                      <td className="px-5 py-3 text-ink-400 text-[11px]">{new Date(e.created_at).toLocaleTimeString()}</td>
                      <td className="px-5 py-3 font-bold text-ink-800">{e.method} {e.endpoint}</td>
                      <td className="px-5 py-3 font-black text-rose-600">{e.status_code}</td>
                      <td className="px-5 py-3 text-ink-600 max-w-md truncate">{e.error_message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
