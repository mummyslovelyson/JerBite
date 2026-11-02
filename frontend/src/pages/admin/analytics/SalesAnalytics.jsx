import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, RefreshCw, ArrowUpRight, BarChart3 } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, Spinner, PageHeader, Stat, ErrorNote } from '../../../components/ui';
import { ChartCard, RevenueChart, OrdersBar } from '../../../components/Charts';

export default function SalesAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/analytics/deep?type=sales&days=${days}`);
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

  const summary = data?.summary || {};
  const series = data?.series || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        sub="Gross merchandise value (GMV), net platform fee collections, and average ticket size metrics"
      >
        <div className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white p-1 shadow-2xs">
          <Calendar className="h-4 w-4 text-ink-400 ml-2" />
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                days === d
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}
            >
              {d === 365 ? '1 Year' : `${d}d`}
            </button>
          ))}
        </div>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total GMV" value={money(summary.total_gmv || 0)} hint={`Past ${days} days`} icon={DollarSign} tone="orange" />
        <Stat label="Platform Commission" value={money(summary.total_commission || 0)} hint="Net marketplace retainage" icon={ArrowUpRight} tone="amber" />
        <Stat label="Delivery Fees" value={money(summary.total_delivery_fees || 0)} hint="Fleet transport gross" icon={BarChart3} tone="orange" />
        <Stat label="Average Basket Size" value={money(summary.avg_order_value || 0)} hint="Per checkout" icon={TrendingUp} tone="green" />
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Daily Gross Revenue" subtitle="Total customer checkout volume over time">
          <RevenueChart data={series} />
        </ChartCard>

        <ChartCard title="Daily Platform Commission" subtitle="Marketplace fee share generated per day">
          <OrdersBar data={series} dataKey="net_commission" color="#FF5A26" />
        </ChartCard>
      </div>
    </div>
  );
}
