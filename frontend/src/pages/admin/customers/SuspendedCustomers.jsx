import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, RefreshCw, CheckCircle2, Search, UserX } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, money, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function SuspendedCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/customers?status=suspended&search=${encodeURIComponent(search)}`);
      setCustomers(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reactivate = async (c) => {
    if (!confirm(`Reactivate customer account for ${c.name}?`)) return;
    setUpdatingId(c.id);
    try {
      await api.patch(`/admin/customers/${c.id}/status`, { status: 'active' });
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
        title="Suspended Customers"
        sub="Diners with restricted access due to chargebacks, fraudulent activity, or terms violations"
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
              placeholder="Search suspended customers..."
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
      ) : customers.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No suspended customer accounts!</h3>
          <p className="text-xs text-ink-500">There are currently no diner accounts on hold.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <div key={c.id} className="card p-5 border-l-4 border-l-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-black">
                  <UserX className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-ink-900">{c.name}</h3>
                    <Badge status="suspended" />
                  </div>
                  <p className="text-xs text-ink-600 mt-0.5">
                    {c.email} • Phone: {c.phone || 'N/A'}
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Orders prior to ban: {c.order_count || 0} • Lifetime spend: {money(c.total_spent || 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/customers/details?id=${c.id}`}
                  className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => reactivate(c)}
                  disabled={updatingId === c.id}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" /> {updatingId === c.id ? 'Reactivating...' : 'Reactivate Account'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
