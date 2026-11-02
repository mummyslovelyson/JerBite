import { useState, useEffect } from 'react';
import { Percent, DollarSign, Store, Search, RefreshCw, ArrowUpRight } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, Spinner, PageHeader, Stat, ErrorNote } from '../../../components/ui';

export default function RestaurantCommissions() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/analytics/deep?type=restaurants');
      setRestaurants(res.data || []);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = restaurants.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.cuisine?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSales = restaurants.reduce((sum, r) => sum + (Number(r.total_sales) || 0), 0);
  const totalCommission = restaurants.reduce((sum, r) => sum + (Number(r.commission_paid) || 0), 0);
  const netMerchantShare = totalSales - totalCommission;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Commissions"
        sub="Platform take-rate breakdown, gross merchandise value split, and net marketplace earnings"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Platform Gross Sales" value={money(totalSales)} hint="Customer spend" icon={DollarSign} tone="orange" />
        <Stat label="Platform Commission" value={money(totalCommission)} hint="Net fee retained" icon={Percent} tone="amber" />
        <Stat label="Merchant Share" value={money(netMerchantShare)} hint="Payable to restaurants" icon={Store} tone="green" />
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by restaurant name or cuisine..."
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
          <Store className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No restaurants found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Restaurant</th>
                  <th className="px-4 py-3.5">Cuisine</th>
                  <th className="px-4 py-3.5 text-center">Orders Count</th>
                  <th className="px-4 py-3.5 text-right">Gross Sales</th>
                  <th className="px-4 py-3.5 text-right">Platform Fee (Comm.)</th>
                  <th className="px-4 py-3.5 text-right">Net Payable to Store</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((r) => {
                  const gross = Number(r.total_sales) || 0;
                  const comm = Number(r.commission_paid) || (gross * 0.15); // Fallback to 15% default if 0
                  const net = gross - comm;
                  return (
                    <tr key={r.id} className="hover:bg-ink-50/60 transition">
                      <td className="px-4 py-3 font-bold text-ink-900">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 text-ink-600">{r.cuisine || 'Various'}</td>
                      <td className="px-4 py-3 text-center font-bold text-ink-900">{r.orders_count || 0}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-ink-900">{money(gross)}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-brand-600">{money(comm)}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-emerald-700">{money(net)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
