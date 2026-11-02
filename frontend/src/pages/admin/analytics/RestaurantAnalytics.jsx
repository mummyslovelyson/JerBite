import { useState, useEffect } from 'react';
import { Store, TrendingUp, DollarSign, Star, Calendar, RefreshCw, Search } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, Spinner, PageHeader, Stat, ErrorNote } from '../../../components/ui';

export default function RestaurantAnalytics() {
  const [days, setDays] = useState(30);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/analytics/deep?type=restaurants&days=${days}`);
      setRestaurants(res.data || []);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [days]);

  const filtered = restaurants.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.cuisine?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Analytics"
        sub="Vendor performance benchmarks, sales generation rankings, and customer satisfaction ratings"
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

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search restaurant performance rankings..."
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
          <p className="text-xs">No restaurant analytics found for this period.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Rank & Restaurant</th>
                  <th className="px-4 py-3.5">Cuisine</th>
                  <th className="px-4 py-3.5 text-center">Customer Rating</th>
                  <th className="px-4 py-3.5 text-center">Orders Fulfilled</th>
                  <th className="px-4 py-3.5 text-right">Gross GMV</th>
                  <th className="px-4 py-3.5 text-right">Commission Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((r, i) => (
                  <tr key={r.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-700 font-extrabold text-[10px]">
                          {i + 1}
                        </span>
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{r.cuisine || 'Various'}</td>
                    <td className="px-4 py-3 text-center font-bold text-amber-600">
                      ★ {r.rating || '5.0'}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-ink-900">{r.orders_count || 0}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-ink-900">{money(r.total_sales || 0)}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-brand-600">{money(r.commission_paid || 0)}</td>
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
