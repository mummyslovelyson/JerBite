import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, User, Mail, Phone, Calendar, Search } from 'lucide-react';
import useApi from '../../hooks/useApi';
import { Spinner, Empty, ErrorNote, Badge } from '../../components/ui';

export default function RestaurantManagers() {
  const [search, setSearch] = useState('');
  const { data: restaurants, loading, error } = useApi('/admin/restaurants');

  const filtered = restaurants?.filter((r) =>
    r.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.owner_email?.toLowerCase().includes(search.toLowerCase()) ||
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-ink-950">Restaurant Managers</h1>
        <p className="text-xs text-ink-500">Directory of all authorized restaurant managers and their assigned kitchens</p>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by manager name, email or restaurant…"
            className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-xs text-ink-900 focus:outline-none"
          />
        </div>
      </div>

      <ErrorNote message={error} />
      {loading ? (
        <Spinner />
      ) : !filtered?.length ? (
        <Empty title="No restaurant managers found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3">Manager</th>
                  <th className="px-5 py-3">Assigned Restaurant</th>
                  <th className="px-5 py-3">Contact Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Restaurant Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50/50 transition">
                    <td className="px-5 py-3.5 font-bold text-ink-950 text-sm">
                      {r.owner_name}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/restaurants/${r.id}`} className="font-bold text-brand-700 hover:underline">
                        {r.name}
                      </Link>
                      <p className="text-[11px] text-ink-400">{r.city}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">{r.owner_email}</td>
                    <td className="px-5 py-3.5 font-mono text-ink-600">{r.owner_phone}</td>
                    <td className="px-5 py-3.5">
                      <Badge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/restaurants/${r.id}`}
                        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-bold text-ink-700 hover:bg-ink-100"
                      >
                        Inspect
                      </Link>
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
