import { useState, useEffect } from 'react';
import { Bike, Award, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, Spinner, PageHeader, Stat, ErrorNote } from '../../../components/ui';

export default function RiderAnalytics() {
  const [days, setDays] = useState(30);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/analytics/deep?type=riders&days=${days}`);
      setRiders(res.data || []);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [days]);

  const totalDelivered = riders.reduce((acc, r) => acc + (Number(r.delivered_count) || 0), 0);
  const totalRiderPayouts = riders.reduce((acc, r) => acc + (Number(r.rider_earnings) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rider Analytics"
        sub="Fleet fulfillment efficiency, courier delivery trip volume, and driver earnings"
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

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total Couriers Evaluated" value={riders.length} hint="Fleet drivers" icon={Bike} tone="orange" />
        <Stat label="Total Trips Delivered" value={totalDelivered} hint={`In selected ${days} days`} icon={Award} tone="green" />
        <Stat label="Total Driver Earnings" value={money(totalRiderPayouts)} hint="80% delivery fee share" icon={DollarSign} tone="amber" />
      </div>

      {loading ? (
        <Spinner />
      ) : riders.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <p className="text-xs">No courier activity logged in this timeframe.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Courier Name</th>
                  <th className="px-4 py-3.5">Vehicle Type</th>
                  <th className="px-4 py-3.5 text-center">Delivered Orders</th>
                  <th className="px-4 py-3.5 text-center">In Progress</th>
                  <th className="px-4 py-3.5 text-right">Rider Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {riders.map((r, i) => (
                  <tr key={r.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-700 font-extrabold text-[10px]">
                          {i + 1}
                        </span>
                        <div>
                          <p>{r.name}</p>
                          <p className="text-[10px] text-ink-400 font-normal">{r.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-700 font-medium">{r.vehicle_type || 'Motorcycle'}</td>
                    <td className="px-4 py-3 text-center font-extrabold text-ink-900">{r.delivered_count || 0}</td>
                    <td className="px-4 py-3 text-center font-bold text-brand-600">{r.in_progress_count || 0}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-700">{money(r.rider_earnings || 0)}</td>
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
