import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, RefreshCw, Eye, Bike, Store, MapPin, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/orders');
      // active orders: placed, accepted, preparing, ready, picked_up
      const active = res.data.filter((o) =>
        ['placed', 'accepted', 'preparing', 'ready', 'picked_up'].includes(o.status)
      );
      setOrders(active);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000); // Poll every 20s for live operations
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Orders"
        sub="Live operational dashboard tracking in-progress kitchen preparations and out-for-delivery orders"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Live
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading && !orders.length ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No active orders right now</h3>
          <p className="text-xs text-ink-500">All orders have either been delivered or completed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((o) => (
            <div key={o.id} className="card p-5 flex flex-col justify-between hover:shadow-md transition border-t-4 border-t-brand-500">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-brand-700">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </span>
                  <Badge status={o.status} />
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-ink-700">
                  <p className="font-bold flex items-center gap-1.5 text-ink-900">
                    <Store className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                    <span className="truncate">{o.restaurant_name}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-ink-600">
                    <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                    <span className="truncate">{o.delivery_address || 'Pickup'}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-ink-500 text-[11px]">
                    <Clock className="h-3 w-3" /> Placed {when(o.created_at)}
                  </p>
                </div>

                <div className="mt-3 rounded-lg bg-ink-50 p-2 text-xs flex items-center justify-between">
                  <span className="text-ink-600 font-medium">Customer: {o.customer_name}</span>
                  <span className="font-extrabold text-ink-900">{money(o.total)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                <span className="text-[11px] text-ink-500 font-medium flex items-center gap-1">
                  <Bike className="h-3.5 w-3.5" /> {o.rider_name || 'Awaiting rider'}
                </span>
                <Link
                  to={`/admin/orders/details?id=${o.id}`}
                  className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-bold text-white hover:bg-brand-700 shadow-2xs"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
