import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XCircle, Search, RefreshCw, AlertTriangle, Store, DollarSign } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function CancelledOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/orders?status=cancelled&search=${encodeURIComponent(search)}`);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cancelled Orders"
        sub="Orders revoked before completion, refund statuses, and cancellation post-mortems"
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
              placeholder="Search cancelled orders..."
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
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <XCircle className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No cancelled orders found</h3>
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
                  <th className="px-4 py-3.5">Cancellation Time</th>
                  <th className="px-4 py-3.5">Payment Status</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-rose-700">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-800">{o.restaurant_name}</td>
                    <td className="px-4 py-3 text-ink-700">{o.customer_name}</td>
                    <td className="px-4 py-3 text-ink-500">{when(o.updated_at || o.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge status={o.payment_status} />
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-ink-900">{money(o.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/orders/details?id=${o.id}`}
                          className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                        >
                          Details
                        </Link>
                        {o.payment_status === 'refund_pending' && (
                          <Link
                            to="/admin/payments/refund-requests"
                            className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700 shadow-2xs"
                          >
                            Refund
                          </Link>
                        )}
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
