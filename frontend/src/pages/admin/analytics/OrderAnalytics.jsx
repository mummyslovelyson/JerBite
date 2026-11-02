import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Calendar, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Stat, ErrorNote } from '../../../components/ui';
import { ChartCard, OrdersBar } from '../../../components/Charts';

export default function OrderAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/analytics/deep?type=orders&days=${days}`);
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

  const statusBreakdown = data?.statusBreakdown || [];
  const hourly = data?.hourly || [];
  const series = data?.series || [];

  const totalOrders = statusBreakdown.reduce((sum, s) => sum + (Number(s.count) || 0), 0);
  const delivered = statusBreakdown.find(s => s.status === 'delivered')?.count || 0;
  const cancelled = statusBreakdown.find(s => s.status === 'cancelled')?.count || 0;
  const fulfillmentRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Analytics"
        sub="Fulfillment velocity, peak ordering time patterns, cancellation ratios, and order lifecycle breakdown"
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
              {d} Days
            </button>
          ))}
        </div>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Orders" value={totalOrders} hint={`Across past ${days} days`} icon={ShoppingBag} tone="orange" />
        <Stat label="Delivered" value={delivered} hint="Fulfilled successfully" icon={CheckCircle2} tone="green" />
        <Stat label="Cancelled" value={cancelled} hint="Aborted orders" icon={XCircle} tone="red" />
        <Stat label="Fulfillment Rate" value={`${fulfillmentRate}%`} hint="Order success ratio" icon={Clock} tone="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Daily Order Fulfilled vs Cancelled" subtitle="Fulfillment trends over time">
          <OrdersBar data={series} dataKey="delivered" color="#10b981" />
        </ChartCard>

        <div className="card p-5">
          <h3 className="font-extrabold text-sm text-ink-900">Status Distribution</h3>
          <p className="text-xs text-ink-500 mt-0.5">All orders grouped by their lifecycle phase</p>

          <div className="mt-4 space-y-2.5">
            {statusBreakdown.map((s) => {
              const pct = totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0;
              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold capitalize text-ink-800">{s.status.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-ink-500">{s.count} orders ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
