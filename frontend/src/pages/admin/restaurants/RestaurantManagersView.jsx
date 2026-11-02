import { useState, useEffect } from 'react';
import { Users, Search, Store, Mail, Phone, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function RestaurantManagersView() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/restaurant-managers?search=${encodeURIComponent(search)}`);
      setManagers(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (mgr) => {
    const nextStatus = mgr.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change ${mgr.name}'s account status to ${nextStatus.toUpperCase()}?`)) {
      return;
    }
    setUpdatingId(mgr.id);
    try {
      await api.patch(`/admin/users/${mgr.id}/status`, { status: nextStatus });
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Managers"
        sub="Assigned managerial accounts, credentials, and merchant authorization"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Search */}
      <div className="card p-4">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search by manager name, email, or restaurant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
          >
            Search
          </button>
        </form>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : managers.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <Users className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No managers found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Manager</th>
                  <th className="px-4 py-3.5">Assigned Restaurant</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-4 py-3.5">Account Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {managers.map((m) => (
                  <tr key={m.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700">
                          {m.name[0]}
                        </div>
                        <div>
                          <p className="font-extrabold">{m.name}</p>
                          <p className="text-[10px] text-ink-400">ID: #{m.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-800">
                      {m.restaurant_name ? (
                        <div className="flex items-center gap-1.5">
                          <Store className="h-3.5 w-3.5 text-brand-600" />
                          <span>{m.restaurant_name}</span>
                        </div>
                      ) : (
                        <span className="text-ink-400 italic">No restaurant assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      <p>{m.email}</p>
                      <p className="text-[11px] text-ink-400">{m.phone || 'No phone'}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500 font-medium">{when(m.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge status={m.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleStatus(m)}
                        disabled={updatingId === m.id}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-2xs transition ${
                          m.status === 'active'
                            ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {updatingId === m.id ? 'Updating...' : m.status === 'active' ? 'Suspend Account' : 'Reactivate'}
                      </button>
                    </td>
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
