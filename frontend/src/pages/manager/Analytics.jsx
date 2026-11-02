import { useState } from 'react';
import {
  BarChart3, CheckCircle2, DollarSign, Download, Filter,
  Percent, ShoppingBag, TrendingUp, Users, Wallet, XCircle
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { ErrorNote, PageHeader, Spinner, Stat, money } from '../../components/ui';
import {
  ChartCard, RevenueChart, OrdersBar, HourlyChart, StatusPie, RankList
} from '../../components/Charts';

export default function ManagerAnalytics() {
  const { restaurant } = useAuth();
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi('/manager/analytics', { days });

  return (
    <div className="w-full space-y-6">
      {/* Header with Period Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold sm:text-2xl text-ink-900">Business Analytics & Reports</h1>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
              {restaurant?.name}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-500">
            Performance metrics, sales velocity, customer breakdown, and peak ordering trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-ink-600">Period:</label>
          <select
            className="input w-auto text-xs py-1.5 font-medium"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="Analytics Period"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 12 months</option>
          </select>
        </div>
      </div>

      <ErrorNote message={error} />

      {loading || !data ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div>
            <div className="mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Performance Overview ({days} Days)
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <Stat
                label="Food Revenue"
                value={money(data.totals?.revenue)}
                icon={DollarSign}
                hint="Food sales (excluding delivery)"
              />
              <Stat
                label="Platform Commission"
                value={money(data.totals?.commission)}
                icon={Percent}
                hint="Platform service deduction"
              />
              <Stat
                label="Net Restaurant Payout"
                value={money(data.totals?.payout)}
                icon={Wallet}
                hint="Net food sales earnings"
              />
              <Stat
                label="Paid Orders"
                value={data.totals?.orders || 0}
                icon={ShoppingBag}
                hint="Completed customer orders"
              />
              <Stat
                label="Average Basket Value"
                value={money(data.totals?.avg_order)}
                icon={TrendingUp}
                hint="Average food subtotal per order"
              />
              <Stat
                label="Completion Rate"
                value={
                  data.customerStats?.total_non_pending > 0
                    ? `${Math.round(
                        ((data.customerStats.delivered_count || 0) /
                          data.customerStats.total_non_pending) *
                          100
                      )}%`
                    : '100%'
                }
                icon={CheckCircle2}
                hint={`${data.customerStats?.delivered_count || 0} fulfilled`}
              />
              <Stat
                label="Cancellation Rate"
                value={
                  data.customerStats?.total_non_pending > 0
                    ? `${Math.round(
                        ((data.customerStats.cancelled_count || 0) /
                          data.customerStats.total_non_pending) *
                          100
                      )}%`
                    : '0%'
                }
                icon={XCircle}
                hint={`${data.customerStats?.cancelled_count || 0} cancelled`}
              />
              <Stat
                label="Unique Customers"
                value={data.customerStats?.unique_customers || 0}
                icon={Users}
                hint="Distinct customers served"
              />
            </div>
          </div>

          {/* Revenue & Volume Charts */}
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Revenue Growth Trend" subtitle="Daily food sales over selected timeframe">
              <RevenueChart data={data.series} />
            </ChartCard>

            <ChartCard title="Daily Order Volume" subtitle="Number of completed orders each day">
              <OrdersBar data={data.series} color="#0ea5e9" />
            </ChartCard>
          </div>

          {/* Peak Hours & Status Breakdown */}
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="Peak 24-Hour Ordering Hours"
              subtitle="Identify lunch and dinner rush hours to optimize kitchen staffing"
            >
              <HourlyChart data={data.hourly} />
            </ChartCard>

            <ChartCard
              title="Order Status Breakdown"
              subtitle="Proportion of orders by current operational status"
            >
              <StatusPie data={data.byStatus} />
            </ChartCard>
          </div>

          {/* Best Selling Dishes & Category Sales */}
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="Top Performing Dishes"
              subtitle="Ranked by total quantity sold in this period"
            >
              <RankList
                rows={data.topProducts}
                label="name"
                value="sold"
                subLabel={(r) => money(r.revenue)}
                format={(v) => `${v} sold`}
              />
            </ChartCard>

            <ChartCard
              title="Sales by Category"
              subtitle="Menu category sales and popularity"
            >
              <RankList
                rows={data.categorySales}
                label="name"
                value="sold"
                subLabel={(r) => money(r.revenue)}
                format={(v) => `${v} items`}
              />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
