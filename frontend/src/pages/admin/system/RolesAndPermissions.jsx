import { useState, useEffect } from 'react';
import { Shield, Check, Lock, Save, RefreshCw, Key } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, ErrorNote } from '../../../components/ui';

const PERMISSION_GROUPS = [
  {
    group: 'Restaurants',
    items: [
      { key: 'manage_restaurants', label: 'View & Edit Restaurants' },
      { key: 'approve_restaurants', label: 'Approve & Reject Applications' },
      { key: 'suspend_restaurants', label: 'Suspend & Reinstate Stores' }
    ]
  },
  {
    group: 'Customers',
    items: [
      { key: 'manage_customers', label: 'View Customer Profiles' },
      { key: 'verify_customers', label: 'Manual Identity Verification' },
      { key: 'suspend_customers', label: 'Ban & Suspend Diners' }
    ]
  },
  {
    group: 'Food & Menu',
    items: [
      { key: 'manage_menu', label: 'View Food Catalog & Categories' },
      { key: 'approve_food', label: 'Approve & Delist Dishes' }
    ]
  },
  {
    group: 'Rider Fleet',
    items: [
      { key: 'manage_riders', label: 'View Rider Fleet' },
      { key: 'approve_riders', label: 'Approve Courier Documents' },
      { key: 'dispatch_orders', label: 'Manual Delivery Dispatch Override' }
    ]
  },
  {
    group: 'Orders',
    items: [
      { key: 'manage_orders', label: 'View Master Orders' },
      { key: 'override_order_status', label: 'Override Order Lifecycle Status' }
    ]
  },
  {
    group: 'Payments & Finances',
    items: [
      { key: 'manage_payments', label: 'View Ledger & Transactions' },
      { key: 'process_refunds', label: 'Issue Electronic Gateway Refunds' },
      { key: 'settle_commissions', label: 'Disburse Merchant Settlements' }
    ]
  },
  {
    group: 'Support & Helpdesk',
    items: [
      { key: 'manage_support', label: 'Resolve Complaints & Disputes' }
    ]
  },
  {
    group: 'Administration & System',
    items: [
      { key: 'manage_admins', label: 'Create & Manage Admin Users' },
      { key: 'manage_roles', label: 'Modify Roles & Permissions Matrix' },
      { key: 'view_audit_logs', label: 'Inspect Security & Audit Logs' },
      { key: 'manage_settings', label: 'Modify Global Platform Settings' }
    ]
  }
];

export default function RolesAndPermissions() {
  const [roles, setRoles] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/system/roles');
      setRoles(res.data);
      if (res.data.length > 0) setActiveRole(res.data[0]);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePermission = (permKey) => {
    if (!activeRole || activeRole.isSystem) return; // Super admin locked
    const perms = activeRole.permissions || [];
    const updatedPerms = perms.includes(permKey)
      ? perms.filter(p => p !== permKey)
      : [...perms, permKey];

    const updatedRole = { ...activeRole, permissions: updatedPerms };
    setActiveRole(updatedRole);
    setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
    setSavedSuccess(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setErr('');
    setSavedSuccess(false);
    try {
      await api.put('/admin/system/roles', { roles });
      setSavedSuccess(true);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !roles.length) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles and Permissions"
        sub="Role-Based Access Control (RBAC): Configure granular permission capabilities across administrative tiers"
      >
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving Changes...' : 'Save Permissions Matrix'}
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}
      {savedSuccess && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200">
          Permissions matrix updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Role Selector Sidebar */}
        <div className="card p-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">Platform Roles</p>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => { setActiveRole(r); setSavedSuccess(false); }}
              className={`w-full rounded-xl p-3 text-left transition ${
                activeRole?.id === r.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-ink-50/70 text-ink-800 hover:bg-ink-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-xs">{r.name}</p>
                {r.isSystem && (
                  <Lock className={`h-3 w-3 ${activeRole?.id === r.id ? 'text-white/70' : 'text-ink-400'}`} />
                )}
              </div>
              <p className={`text-[10px] mt-1 line-clamp-1 ${activeRole?.id === r.id ? 'text-white/80' : 'text-ink-400'}`}>
                {r.description}
              </p>
            </button>
          ))}
        </div>

        {/* Permissions Checklist Grid */}
        <div className="lg:col-span-3 card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-ink-900">{activeRole?.name}</h3>
                {activeRole?.isSystem && (
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                    System Root Role (Full Access)
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-500 mt-1">{activeRole?.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            {PERMISSION_GROUPS.map((grp) => (
              <div key={grp.group} className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand-700">{grp.group}</h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {grp.items.map((item) => {
                    const isChecked = activeRole?.isSystem || activeRole?.permissions?.includes(item.key);
                    return (
                      <label
                        key={item.key}
                        className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                          isChecked
                            ? 'border-brand-300 bg-brand-50/40'
                            : 'border-ink-200 bg-white hover:bg-ink-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={activeRole?.isSystem}
                          checked={isChecked}
                          onChange={() => togglePermission(item.key)}
                          className="h-4 w-4 rounded-md text-brand-600 focus:ring-brand-500"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-ink-900">{item.label}</p>
                          <p className="font-mono text-[10px] text-ink-400">{item.key}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
