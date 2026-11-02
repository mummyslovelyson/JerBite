import { useState, useEffect } from 'react';
import { Bike, TrendingUp, DollarSign, Award, RefreshCw, Search, CheckCircle } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Stat, ErrorNote } from '../../../components/ui';

export default function RiderPerformance() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/rider-performance');
      setRiders(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = riders.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search)
  );

  const totalDeliveries = riders.reduce((acc, r) => acc + (Number(r.total_deliveries) || 0), 0);
  const totalEarnings = riders.reduce((acc, r) => acc + (Number(r.estimated_earnings) || 0), 0);
  const activeCount = riders.filter(r => r.is_online).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rider Performance"
        sub="Fleet efficiency metrics, trips fulfilled, driver payout estimates, and customer rating scores"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Metrics
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {/* Aggregate KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Fleet" value={riders.length} hint="Registered couriers" icon={Bike} tone="orange" />
        <Stat label="Online Now" value={activeCount} hint="Available for dispatch" icon={CheckCircle} tone="green" />
        <Stat label="Trips Fulfilled" value={totalDeliveries} hint="Delivered orders" icon={Award} tone="amber" />
        <Stat label="Total Payouts" value={money(totalEarnings)} hint="Estimated courier pay" icon={DollarSign} tone="orange" />
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search performance table by courier name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <p className="text-xs">No couriers match the current filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Courier</th>
                  <th className="px-4 py-3.5">Vehicle</th>
                  <th className="px-4 py-3.5 text-center">Duty Status</th>
                  <th className="px-4 py-3.5 text-center">Completed Deliveries</th>
                  <th className="px-4 py-3.5 text-center">Active Jobs</th>
                  <th className="px-4 py-3.5 text-right">Est. Payouts</th>
                  <th className="px-4 py-3.5">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((r, i) => (
                  <tr key={r.user_id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-extrabold text-[10px]">
                          {i + 1}
                        </span>
                        <div>
                          <p>{r.name}</p>
                          <p className="text-[10px] text-ink-400 font-normal">{r.phone || r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-700 font-medium">
                      {r.vehicle_type || 'Motorcycle'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        r.is_online ? 'bg-emerald-100 text-emerald-800' : 'bg-ink-100 text-ink-600'
                      }`}>
                        {r.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-extrabold text-ink-900">
                      {r.total_deliveries || 0}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-brand-700">
                      {r.active_deliveries || 0}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-700">
                      {money(r.estimated_earnings || 0)}
                    </td>
                    <td className="px-4 py-3 text-ink-500 text-[11px]">
                      {r.last_location_update ? when(r.last_location_update) : 'N/A'}
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
