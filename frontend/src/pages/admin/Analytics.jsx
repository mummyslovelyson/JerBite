import { useState } from 'react';
import {
  BarChart3, TrendingUp, Users, ShoppingBag, Store,
  Bike, Calendar, DollarSign, ArrowUpRight
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import { Spinner, ErrorNote, Stat, money } from '../../components/ui';
import { AreaChart, BarChart } from '../../components/Charts';

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi('/admin/analytics', { days });

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { totals = {}, counts = {}, series = [], byStatus = [], topRestaurants = [], signups = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Header with Days filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Platform Analytics</h1>
          <p className="text-xs text-ink-500">Live operational &amp; financial performance indicators</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white p-1 shadow-xs">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                days === d ? 'bg-brand-600 text-white shadow-xs' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={`Gross Sales (${days}d)`}
          value={money(totals.revenue || 0)}
          hint={`${totals.orders || 0} completed orders`}
        />
        <Stat
          label="Commission Earned"
          value={money(totals.commission || 0)}
          hint="Net platform revenue"
        />
        <Stat
          label="Average Order Value"
          value={money(totals.avg_order || 0)}
          hint="Per successful checkout"
        />
        <Stat
          label="Delivery Fees Volume"
          value={money(totals.delivery_fees || 0)}
          hint="Dispatched to riders"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink-950 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-600" /> Revenue Trend
            </h3>
            <span className="text-xs text-ink-400 font-medium">Daily paid volume</span>
          </div>
          <div className="h-64">
            <AreaChart data={series} xKey="date" yKey="revenue" color="#e11d48" money />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink-950 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-brand-600" /> Daily Orders Volume
            </h3>
            <span className="text-xs text-ink-400 font-medium">Completed checkouts</span>
          </div>
          <div className="h-64">
            <BarChart data={series} xKey="date" yKey="orders" color="#0284c7" />
          </div>
        </div>
      </div>

      {/* Lower Row: Top Restaurants & New User Signups */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Kitchens */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-ink-950 flex items-center gap-2">
            <Store className="h-4 w-4 text-brand-600" /> Top Performing Restaurants
          </h3>
          <div className="divide-y divide-ink-100">
            {topRestaurants.map((r, i) => (
              <div key={r.name || i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 text-xs font-black text-ink-700">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-xs text-ink-900">{r.name}</p>
                    <p className="text-[11px] text-ink-500">{r.orders} orders fulfilled</p>
                  </div>
                </div>
                <span className="font-extrabold text-xs text-brand-700">{money(r.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Registration Trend */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-ink-950 flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-600" /> User Sign-up Velocity
          </h3>
          <div className="h-56">
            <BarChart data={signups} xKey="date" yKey="users" color="#10b981" />
          </div>
        </div>
      </div>
    </div>
  );
}
