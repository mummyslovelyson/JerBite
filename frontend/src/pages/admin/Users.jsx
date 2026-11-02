import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import { Badge, Empty, ErrorNote, Spinner, Tabs, when } from '../../components/ui';

export default function AdminUsers() {
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const { data, loading, error, reload } = useApi('/admin/users', { role, search: applied });

  const flip = async (u) => {
    const status = u.status === 'active' ? 'suspended' : 'active';
    if (
      status === 'suspended' &&
      !window.confirm(`Suspend ${u.name}? They will lose platform access immediately.`)
    )
      return;
    try {
      await api.patch(`/admin/users/${u.id}/status`, { status });
      toast.success(status === 'active' ? 'User reinstated' : 'User suspended');
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'admin':
        return <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[11px] font-bold">Admin</span>;
      case 'manager':
        return <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-bold">Manager</span>;
      case 'rider':
        return <span className="rounded-full bg-sky-100 text-sky-800 px-2 py-0.5 text-[11px] font-bold">Rider</span>;
      default:
        return <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">Customer</span>;
    }
  };

  return (
    <div className="w-full space-y-4 pb-16">
      {/* Top Filter and Search Bar (No redundant heading) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs
          value={role}
          onChange={setRole}
          tabs={[
            ['', 'All Accounts'],
            ['customer', 'Customers'],
            ['manager', 'Managers'],
            ['rider', 'Riders'],
            ['admin', 'Admins']
          ]}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(search.trim());
          }}
          className="relative w-full sm:w-64"
        >
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <input
            className="input pl-9 pr-4 py-1.5 text-xs w-full bg-white shadow-2xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            aria-label="Search users"
          />
        </form>
      </div>

      <ErrorNote message={error} />

      {loading ? (
        <Spinner />
      ) : !data?.length ? (
        <Empty
          title="No users found"
          hint="Try adjusting your filter or search."
        />
      ) : (
        <div className="card overflow-hidden border border-ink-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50/60 text-ink-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Verification</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.map((u) => {
                  const initials = u.name
                    ? u.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'U';

                  return (
                    <tr key={u.id} className="hover:bg-ink-50/50 transition">
                      <td className="p-4 font-bold text-ink-900">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-black text-xs shrink-0">
                            {initials}
                          </span>
                          <span className="font-extrabold text-sm text-ink-900">{u.name}</span>
                        </div>
                      </td>

                      <td className="text-ink-700 font-medium">
                        <p>{u.email}</p>
                        <p className="text-ink-500 text-[11px]">{u.phone}</p>
                      </td>

                      <td>{getRoleBadge(u.role)}</td>

                      <td>
                        {u.email_verified ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                            <XCircle className="h-3.5 w-3.5 text-amber-500" /> Pending
                          </span>
                        )}
                      </td>

                      <td className="text-ink-500 font-medium">{when(u.created_at)}</td>

                      <td>
                        <Badge status={u.status} />
                      </td>

                      <td className="pr-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition shadow-2xs cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                            onClick={() => flip(u)}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Reinstate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
