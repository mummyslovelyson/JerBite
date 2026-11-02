import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Eye, ShieldAlert, CheckCircle2, SlidersHorizontal, RefreshCw, Mail, Phone } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function AllCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [err, setErr] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/customers?status=${statusFilter}&verified=${verifiedFilter}&search=${encodeURIComponent(search)}`);
      setCustomers(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, verifiedFilter]);

  const toggleStatus = async (customer) => {
    const nextStatus = customer.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change ${customer.name}'s account status to ${nextStatus.toUpperCase()}?`)) {
      return;
    }
    setUpdatingId(customer.id);
    try {
      await api.patch(`/admin/customers/${customer.id}/status`, { status: nextStatus });
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
        title="All Customers"
        sub="Full directory of registered diners, account security status, and order activity"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
          >
            <option value="">All Verifications</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
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
      ) : customers.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <Users className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No customers found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5 text-center">Orders</th>
                  <th className="px-4 py-3.5 text-right">Lifetime Spend</th>
                  <th className="px-4 py-3.5">Verification</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700">
                          {c.name ? c.name[0] : 'C'}
                        </div>
                        <div>
                          <p className="font-extrabold">{c.name}</p>
                          <p className="text-[10px] text-ink-400 font-normal">Joined {when(c.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      <p>{c.email}</p>
                      <p className="text-[11px] text-ink-400">{c.phone || 'No phone'}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-extrabold text-ink-900">
                      {c.order_count || 0}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-brand-700">
                      {money(c.total_spent || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.email_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.email_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/customers/details?id=${c.id}`}
                          className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                        >
                          <Eye className="h-3 w-3" /> View
                        </Link>
                        <button
                          onClick={() => toggleStatus(c)}
                          disabled={updatingId === c.id}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-2xs transition ${
                            c.status === 'active'
                              ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {updatingId === c.id ? 'Saving...' : c.status === 'active' ? 'Suspend' : 'Unsuspend'}
                        </button>
                      </div>
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
