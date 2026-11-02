import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, TrendingUp, ChefHat, Clock, AlertTriangle,
  ArrowRight, CheckCircle2, XCircle, Users, Sparkles, Utensils,
  Layers, Calendar, Wallet, Settings, BarChart3, Store, Timer
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { Stat, Spinner, ErrorNote, money, Badge, when } from '../../components/ui';

const NEXT = {
  placed: [['accepted', 'Accept Order', 'btn-primary'], ['cancelled', 'Decline', 'btn-ghost text-red-600']],
  accepted: [['preparing', 'Start Preparing', 'btn-primary']],
  preparing: [['ready', 'Mark Ready', 'btn-primary']]
};

export default function ManagerOverview() {
  const { restaurant, refresh } = useAuth();
  const { data, loading, error, reload } = useApi('/manager/analytics', { days: 7 });
  const [actionBusy, setActionBusy] = useState(false);

  const toggleOpen = async () => {
    try {
      await api.patch('/manager/restaurant/open', { isOpen: !restaurant.is_open });
      await refresh();
      toast.success(restaurant.is_open ? 'Restaurant is now closed' : 'Restaurant is now open');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const pauseRush = async (minutes) => {
    try {
      await api.post('/manager/schedule/pause', { minutes });
      await refresh();
      toast.success(minutes > 0 ? `Orders paused for ${minutes} minutes` : 'Order pause cleared');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const moveOrder = async (orderId, toStatus) => {
    if (toStatus === 'cancelled' && !window.confirm('Decline this order? The customer will be refunded.')) return;
    setActionBusy(true);
    try {
      await api.patch(`/manager/orders/${orderId}/status`, { status: toStatus });
      toast.success('Order status updated');
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setActionBusy(false);
    }
  };

  const isPaused = restaurant?.pause_until && new Date(restaurant.pause_until) > new Date();

  return (
    <div className="w-full space-y-6">
      {/* Operational Control Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-ink-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
              restaurant.is_open ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${restaurant.is_open ? 'animate-pulse bg-emerald-500' : 'bg-rose-500'}`} />
            {restaurant.is_open ? 'Accepting Orders' : 'Store Closed'}
          </span>
          {isPaused && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
              <Clock className="h-3 w-3" />
              Paused until {new Date(restaurant.pause_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isPaused ? (
            <button onClick={() => pauseRush(0)} className="btn-ghost text-xs font-semibold">
              Resume Orders
            </button>
          ) : (
            <button
              onClick={() => pauseRush(30)}
              className="btn-ghost text-xs font-semibold"
              title="Pause new incoming orders during kitchen rush"
            >
              Pause 30m
            </button>
          )}

          <button
            onClick={toggleOpen}
            className={`text-xs ${restaurant.is_open ? 'btn-ghost border-rose-200 text-rose-600 hover:bg-rose-50' : 'btn-primary'}`}
          >
            {restaurant.is_open ? 'Close Restaurant' : 'Open Restaurant'}
          </button>

          <Link to="/manager/analytics" className="btn-primary text-xs flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            View Analytics
          </Link>
        </div>
      </div>

      <ErrorNote message={error} />

      {/* Review Alert if items pending approval */}
      {data?.pendingProducts > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-sm text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="text-xs sm:text-sm">
              <strong>{data.pendingProducts} menu item{data.pendingProducts > 1 ? 's' : ''}</strong> waiting for administrator approval.
            </span>
          </div>
          <Link to="/manager/products" className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline shrink-0">
            Review <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {loading || !data ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* Today's Live Pulse Strip */}
          <div className="rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-amber-50/40 p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
                <Sparkles className="h-3.5 w-3.5" /> Today's Live Operations
              </span>
              <span className="text-xs text-ink-500 font-medium">
                {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-ink-500 font-medium">Today's Orders</p>
                <p className="mt-0.5 text-2xl font-black text-ink-900">{data.today?.orders || 0}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500 font-medium">Today's Sales</p>
                <p className="mt-0.5 text-2xl font-black text-brand-600">{money(data.today?.revenue || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500 font-medium">Today's Net Payout</p>
                <p className="mt-0.5 text-2xl font-black text-emerald-600">{money(data.today?.payout || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500 font-medium">Active in Kitchen</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-2xl font-black text-amber-600">{data.totals?.active || 0}</p>
                  <Link to="/manager/orders" className="text-xs font-bold text-brand-600 hover:underline">
                    Live KDS &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Active Orders Strip (if any orders placed, accepted, preparing, or ready) */}
          {data.recentActive?.length > 0 ? (
            <div className="card border-l-4 border-l-amber-500 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-amber-600" />
                    Kitchen Active Orders ({data.recentActive.length})
                  </h2>
                  <p className="text-xs text-ink-500">Orders requiring preparation or ready for rider pickup</p>
                </div>
                <Link to="/manager/orders" className="btn-ghost text-xs font-semibold">
                  Open Full Kitchen Display &rarr;
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.recentActive.map((o) => (
                  <div key={o.id} className="rounded-xl border border-ink-200 bg-white p-3.5 shadow-xs transition hover:border-brand-400">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="font-bold text-sm text-ink-900">#{o.id.slice(0, 8).toUpperCase()}</span>
                        <p className="text-xs text-ink-500">{o.customer_name} · {when(o.created_at)}</p>
                      </div>
                      <Badge status={o.status} />
                    </div>

                    <ul className="mt-2 text-xs text-ink-700 space-y-0.5 max-h-20 overflow-y-auto">
                      {o.items?.map((item, idx) => (
                        <li key={idx} className="font-medium">
                          {item.quantity}× {item.name}
                        </li>
                      ))}
                    </ul>

                    {o.notes && (
                      <p className="mt-1.5 rounded bg-amber-50/70 p-1 text-[11px] italic text-amber-800">
                        "{o.notes}"
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-2.5">
                      <span className="font-bold text-sm text-ink-900">{money(o.total)}</span>
                      <div className="flex gap-1.5">
                        {(NEXT[o.status] || []).map(([to, label, cls]) => (
                          <button
                            key={to}
                            disabled={actionBusy}
                            onClick={() => moveOrder(o.id, to)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${cls}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center text-center gap-2 bg-gradient-to-b from-white to-ink-50/40">
              <ChefHat className="h-10 w-10 text-ink-300" />
              <h3 className="font-bold text-sm text-ink-800">Kitchen is All Caught Up</h3>
              <p className="text-xs text-ink-500 max-w-sm">
                No active orders in the queue right now. New customer orders will trigger an alert chime here.
              </p>
              <Link to="/manager/orders" className="btn-ghost text-xs mt-1">
                View Past Order History &rarr;
              </Link>
            </div>
          )}

          {/* Operational Info & Settings Highlights */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Kitchen Timing</span>
                <Timer className="h-4 w-4 text-brand-600" />
              </div>
              <p className="text-xl font-bold text-ink-900">
                {restaurant.prep_time_minutes || 30} mins
              </p>
              <p className="text-xs text-ink-500">
                Standard order preparation time shown to customers.
              </p>
              <Link to="/manager/schedule" className="text-xs font-semibold text-brand-600 hover:underline block pt-1">
                Adjust Kitchen Hours & Schedule &rarr;
              </Link>
            </div>

            <div className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Delivery Terms</span>
                <Store className="h-4 w-4 text-brand-600" />
              </div>
              <p className="text-xl font-bold text-ink-900">
                {money(restaurant.delivery_fee || 0)} fee
              </p>
              <p className="text-xs text-ink-500">
                Minimum order: {money(restaurant.min_order || 0)}
              </p>
              <Link to="/manager/settings" className="text-xs font-semibold text-brand-600 hover:underline block pt-1">
                Edit Restaurant Settings &rarr;
              </Link>
            </div>

            <div className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Finances & Payouts</span>
                <Wallet className="h-4 w-4 text-brand-600" />
              </div>
              <p className="text-xl font-bold text-emerald-700">
                {money(data.totals?.payout || 0)}
              </p>
              <p className="text-xs text-ink-500">
                Lifetime net earnings accrued from orders.
              </p>
              <Link to="/manager/finances" className="text-xs font-semibold text-brand-600 hover:underline block pt-1">
                View Payouts & Ledger &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Management Shortcuts Grid */}
          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
              Management Command Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Link
                to="/manager/orders"
                className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 p-3.5 text-center transition hover:border-brand-500 hover:bg-brand-50/30"
              >
                <ChefHat className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">Live Orders & KDS</span>
              </Link>

              <Link
                to="/manager/products"
                className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 p-3.5 text-center transition hover:border-brand-500 hover:bg-brand-50/30"
              >
                <Utensils className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">Menu Dishes</span>
              </Link>

              <Link
                to="/manager/categories"
                className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 p-3.5 text-center transition hover:border-brand-500 hover:bg-brand-50/30"
              >
                <Layers className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">Categories</span>
              </Link>

              <Link
                to="/manager/analytics"
                className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 p-3.5 text-center transition hover:border-brand-500 hover:bg-brand-50/30"
              >
                <BarChart3 className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">Analytics Reports</span>
              </Link>

              <Link
                to="/manager/finances"
                className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 p-3.5 text-center transition hover:border-brand-500 hover:bg-brand-50/30"
              >
                <Wallet className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">Finances & Payouts</span>
              </Link>

              <Link
                to="/manager/settings"
                className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 p-3.5 text-center transition hover:border-brand-500 hover:bg-brand-50/30"
              >
                <Settings className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-bold text-ink-900">Restaurant Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
