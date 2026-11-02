import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, Spinner, Stat, PageHeader } from '../../../components/ui';
import { ChartCard, RevenueChart, OrdersBar } from '../../../components/Charts';

export default function PlatformAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/analytics?days=${days}`);
      setData(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [days]);

  if (loading && !data) return <Spinner />;

  const totals = data?.totals || {};
  const series = data?.series || [];
  const topRestaurants = data?.topRestaurants || [];
  const byStatus = data?.byStatus || [];
  const signups = data?.signups || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        sub="High-level financial performance, volume trajectories, and growth indicators"
      >
        <div className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white p-1 shadow-2xs">
          <Calendar className="h-4 w-4 text-ink-400 ml-2" />
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                days === d
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}
            >
              Last {d}d
            </button>
          ))}
        </div>
      </PageHeader>

      {err && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{err}</div>}

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Gross Merchandise Value"
          value={money(totals.revenue || 0)}
          hint={`In selected ${days} days`}
          icon={DollarSign}
          tone="orange"
        />
        <Stat
          label="Orders Fulfilled"
          value={totals.orders || 0}
          hint="Paid completed volume"
          icon={ShoppingBag}
          tone="green"
        />
        <Stat
          label="Average Basket Size"
          value={money(totals.avg_order || 0)}
          hint="Per paid checkout"
          icon={TrendingUp}
          tone="amber"
        />
        <Stat
          label="Delivery Fees Paid"
          value={money(totals.delivery_fees || 0)}
          hint="Rider fleet gross"
          icon={BarChart3}
          tone="orange"
        />
      </div>

      {/* Primary Graphs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Revenue (GMV) Trend"
          subtitle={`Daily completed payments (${days} days)`}
        >
          <RevenueChart data={series} />
        </ChartCard>

        <ChartCard
          title="Daily Order Volume"
          subtitle="Orders successfully placed and paid"
        >
          <OrdersBar data={series} />
        </ChartCard>
      </div>

      {/* User Growth & Top Performing Vendors */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="User Signups"
          subtitle="New customer and partner registrations"
        >
          <OrdersBar data={signups} dataKey="users" color="#10b981" />
        </ChartCard>

        <div className="card p-5">
          <h3 className="font-bold text-sm text-ink-900">Top 5 Restaurants by Sales</h3>
          <p className="text-xs text-ink-500 mt-0.5">Ranked by gross sales volume during selected period</p>

          <div className="mt-4 space-y-3">
            {topRestaurants.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink-400">No sales recorded in this timeframe.</p>
            ) : (
              topRestaurants.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between rounded-xl bg-ink-50/70 p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 font-black text-xs text-brand-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-xs text-ink-900">{r.name}</p>
                      <p className="text-[11px] text-ink-500">{r.orders} orders processed</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-ink-900">{money(r.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
