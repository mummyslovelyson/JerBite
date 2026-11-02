import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, ShieldAlert, CheckCircle2, XCircle,
  ShoppingBag, Phone, Mail, Calendar, ArrowRight
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote, Badge, money } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [verified, setVerified] = useState('');

  const { data, loading, error, reload } = useApi('/admin/customers', { search, status, verified });

  const toggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to mark ${user.name} as ${nextStatus}?`)) return;
    try {
      await api.patch(`/admin/customers/${user.id}/status`, { status: nextStatus });
      toast.success(`Customer ${user.name} is now ${nextStatus}`);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const handleManualVerify = async (user) => {
    try {
      await api.patch(`/admin/customers/${user.id}/verify`);
      toast.success(`Verified contact details for ${user.name}`);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Customer Management</h1>
          <p className="text-xs text-ink-500">Monitor all registered customer accounts, verification, and spending</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email or phone…"
            className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-xs text-ink-900 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700"
          >
            <option value="">All Account Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
          <select
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700"
          >
            <option value="">Verification Status</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
        </div>
      </div>

      <ErrorNote message={error} />
      {loading ? (
        <Spinner />
      ) : !data?.length ? (
        <Empty title="No customers found" hint="Try adjusting your search criteria." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Contact Details</th>
                  <th className="px-5 py-3">Verification</th>
                  <th className="px-5 py-3">Orders &amp; Spent</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.map((c) => (
                  <tr key={c.id} className="hover:bg-ink-50/50 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-ink-950 text-sm">{c.name}</p>
                      <p className="text-[10px] text-ink-400">Joined {new Date(c.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-ink-700 font-medium">{c.email}</p>
                      <p className="text-ink-500 font-mono text-[11px]">{c.phone}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            c.email_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {c.email_verified ? 'Verified' : 'Unverified'}
                        </span>
                        {!c.email_verified && (
                          <button
                            onClick={() => handleManualVerify(c)}
                            className="text-[10px] text-brand-600 font-bold hover:underline"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-extrabold text-ink-900">{money(c.total_spent)}</p>
                      <p className="text-[11px] text-ink-500">{c.order_count} orders</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/customers/${c.id}`}
                          className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-bold text-ink-700 hover:bg-ink-100"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => toggleStatus(c)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                            c.status === 'active'
                              ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500'
                          }`}
                        >
                          {c.status === 'active' ? 'Suspend' : 'Activate'}
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
