import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Store, Users, TrendingUp, Bike,
  AlertCircle, ChefHat, Sparkles, ArrowRight, Calendar
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import { ErrorNote, Spinner, Stat, money } from '../../components/ui';
import { ChartCard, OrdersBar, RankList, RevenueChart, StatusPie } from '../../components/Charts';

export default function AdminOverview() {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi('/admin/analytics', { days });

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!data) return null;

  const { counts: c, totals: t } = data;

  const pendingItems = [
    { count: c.pending_restaurants, label: 'Restaurant review pending', to: '/admin/restaurants', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    { count: c.pending_products, label: 'Dishes review pending', to: '/admin/products', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
    { count: c.pending_riders, label: 'Riders review pending', to: '/admin/riders', bg: 'bg-sky-50 text-sky-800 border-sky-200' },
    { count: c.pending_refunds, label: 'Refunds due', to: '/admin/orders', bg: 'bg-rose-50 text-rose-800 border-rose-200' }
  ].filter((item) => item.count > 0);

  return (
    <div className="w-full space-y-5 pb-16">
      {/* Top Filter Bar (No big heading banner) */}
      <div className="flex items-center justify-between">
        {pendingItems.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {pendingItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition hover:shadow-xs ${item.bg}`}
              >
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/80 font-black text-[10px]">
                  {item.count}
                </span>
                <span>{item.label}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-ink-400" />
          <select
            className="input text-xs font-bold py-1.5 px-3 w-auto bg-white shadow-2xs"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="Period"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat
          label="Gross Sales"
          value={money(t.revenue)}
          icon={DollarSign}
          hint="Completed orders total"
        />
        <Stat
          label="Platform Commission"
          value={money(t.commission)}
          icon={TrendingUp}
          hint="Net platform revenue"
        />
        <Stat
          label="Total Orders"
          value={t.orders}
          icon={ShoppingBag}
        />
        <Stat
          label="Average Order"
          value={money(t.avg_order)}
          icon={Sparkles}
        />
        <Stat
          label="Restaurants"
          value={c.restaurants}
          icon={Store}
        />
        <Stat
          label="Customers"
          value={c.customers}
          icon={Users}
        />
        <Stat
          label="Active Riders"
          value={c.riders}
          icon={Bike}
        />
        <Stat
          label="Managers"
          value={c.managers || 0}
          icon={ChefHat}
        />
      </div>

      {/* Main Revenue Chart */}
      <ChartCard title="Daily Sales">
        <RevenueChart data={data.series} />
      </ChartCard>

      {/* Secondary Metrics Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Orders per Day">
          <OrdersBar data={data.series} />
        </ChartCard>
        <ChartCard title="New Sign-ups">
          <OrdersBar data={data.signups} dataKey="users" color="#10b981" />
        </ChartCard>
        <ChartCard title="Orders by Status">
          <StatusPie data={data.byStatus} />
        </ChartCard>
        <ChartCard title="Top Restaurants">
          <RankList rows={data.topRestaurants} label="name" value="revenue" format={money} />
        </ChartCard>
      </div>
    </div>
  );
}
