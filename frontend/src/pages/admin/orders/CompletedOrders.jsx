import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search, RefreshCw, Eye, Store, User } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function CompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/orders?status=delivered&search=${encodeURIComponent(search)}`);
      setOrders(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalDeliveredGMV = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Completed Orders"
        sub="Fulfilled and delivered order history with courier proof and financial settlement records"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Search */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search completed orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          />
        </form>

        <div className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800">
          Delivered GMV: {money(totalDeliveredGMV)} ({orders.length} orders)
        </div>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No completed orders found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Restaurant</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Courier</th>
                  <th className="px-4 py-3.5">Fulfilled At</th>
                  <th className="px-4 py-3.5 text-right">Order Total</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-ink-900">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-800">{o.restaurant_name}</td>
                    <td className="px-4 py-3 text-ink-700">{o.customer_name}</td>
                    <td className="px-4 py-3 text-ink-600">{o.rider_name || 'Pickup'}</td>
                    <td className="px-4 py-3 text-ink-500">{when(o.updated_at || o.created_at)}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-700">{money(o.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/orders/details?id=${o.id}`}
                        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                      >
                        Inspect
                      </Link>
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
