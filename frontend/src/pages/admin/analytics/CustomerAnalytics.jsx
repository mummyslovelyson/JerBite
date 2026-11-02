import { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, RefreshCw, ShoppingBag, DollarSign } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Stat, ErrorNote } from '../../../components/ui';
import { ChartCard, OrdersBar } from '../../../components/Charts';

export default function CustomerAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/analytics/deep?type=customers&days=${days}`);
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

  const growth = data?.growth || [];
  const topCustomers = data?.topCustomers || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Analytics"
        sub="Diner growth trends, user acquisition pace, cohort retention, and top customer lifetime spend"
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

      {/* Signups Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="New Customer Registrations" subtitle={`Daily diner signups over past ${days} days`}>
          <OrdersBar data={growth} dataKey="new_signups" color="#8b5cf6" />
        </ChartCard>

        {/* Top Spenders */}
        <div className="card p-5">
          <h3 className="font-extrabold text-sm text-ink-900">Top 10 Customers by Lifetime Value</h3>
          <p className="text-xs text-ink-500 mt-0.5">High-frequency ordering diners on the platform</p>

          <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto">
            {topCustomers.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink-400">No order data in this timeframe.</p>
            ) : (
              topCustomers.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl bg-ink-50/70 p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-black text-[10px]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-ink-900">{c.name}</p>
                      <p className="text-[10px] text-ink-400">{c.order_count} orders completed</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-brand-700">{money(c.total_spent)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
