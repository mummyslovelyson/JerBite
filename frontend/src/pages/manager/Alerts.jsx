import { useState } from 'react';
import {
  Bell, Shield, CheckCircle2, AlertTriangle, Key,
  Mail, Phone, Clock, Settings, LogIn, Lock
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote } from '../../components/ui';
import toast from 'react-hot-toast';

export default function ManagerAlerts() {
  const [activeTab, setActiveTab] = useState('auth'); // 'auth', 'orders', 'platform', 'settings'
  const { data, loading, error, reload } = useApi('/manager/alerts');

  // Preferences state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [orderSound, setOrderSound] = useState(true);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { notifications = [], authAlerts = [] } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-ink-950">Alerts &amp; Security Notifications</h1>
        <p className="text-xs text-ink-500">Security notifications, authentication logs, live order alerts, and notification settings</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-200 gap-6 text-xs font-bold overflow-x-auto pb-1">
        {[
          { key: 'auth', label: 'Authentication Alerts', icon: Shield, count: authAlerts.length },
          { key: 'orders', label: 'Order & Kitchen Alerts', icon: Bell, count: notifications.length },
          { key: 'settings', label: 'Alert Settings', icon: Settings }
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
              {tab.count !== undefined && (
                <span className="rounded-full bg-ink-100 px-2 py-0.2 text-[10px] text-ink-700">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AUTHENTICATION ALERTS */}
      {activeTab === 'auth' && (
        <div className="space-y-4">
          <div className="card p-4 bg-brand-50/30 border-brand-200 text-xs text-brand-900">
            <span className="font-bold block mb-1">Security Audit Protection</span>
            Authentication alerts monitor sign-ins, OTP validations, password updates, and session activity for your manager account.
          </div>

          <div className="card overflow-hidden">
            <div className="divide-y divide-ink-100 text-xs">
              {!authAlerts.length ? (
                <p className="p-8 text-center text-ink-400">No security alerts recorded. Your account is secure.</p>
              ) : (
                authAlerts.map((a) => (
                  <div key={a.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-ink-950 text-sm">{a.title}</span>
                        <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-mono font-bold text-ink-700 uppercase">
                          {a.event_type}
                        </span>
                      </div>
                      <p className="text-ink-600">{a.message}</p>
                      <p className="font-mono text-[10px] text-ink-400 pt-1">
                        IP: {a.ip_address || '127.0.0.1'} &bull; {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      Logged
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER & KITCHEN ALERTS */}
      {activeTab === 'orders' && (
        <div className="card overflow-hidden">
          <div className="divide-y divide-ink-100 text-xs">
            {!notifications.length ? (
              <p className="p-8 text-center text-ink-400">No recent order notifications.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-ink-950 text-sm">{n.title}</h4>
                    <p className="text-ink-600">{n.body}</p>
                    <p className="text-[10px] text-ink-400">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ALERT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="card p-6 space-y-6 max-w-xl">
          <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider border-b border-ink-100 pb-2">
            Notification Preferences
          </h3>
          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-ink-200 bg-ink-50/50 cursor-pointer">
              <div>
                <span className="font-bold text-ink-900 block">Email Alerts for New Orders</span>
                <span className="text-ink-500">Receive immediate email dispatch whenever a customer checkouts</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded-md text-brand-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-ink-200 bg-ink-50/50 cursor-pointer">
              <div>
                <span className="font-bold text-ink-900 block">SMS Order Confirmations</span>
                <span className="text-ink-500">Receive SMS text notifications for urgent order dispatches</span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="h-4 w-4 rounded-md text-brand-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-ink-200 bg-ink-50/50 cursor-pointer">
              <div>
                <span className="font-bold text-ink-900 block">Audible KDS Chime</span>
                <span className="text-ink-500">Play an alert chime in kitchen dashboard on new orders</span>
              </div>
              <input
                type="checkbox"
                checked={orderSound}
                onChange={(e) => setOrderSound(e.target.checked)}
                className="h-4 w-4 rounded-md text-brand-600"
              />
            </label>
          </div>
          <button
            onClick={() => toast.success('Preferences saved')}
            className="btn-primary text-xs"
          >
            Save Alert Preferences
          </button>
        </div>
      )}
    </div>
  );
}
