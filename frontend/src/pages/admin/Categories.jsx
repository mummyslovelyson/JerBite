import { useState } from 'react';
import { Tags, Store, Utensils, Search, Plus } from 'lucide-react';
import useApi from '../../hooks/useApi';
import { Spinner, Empty, ErrorNote } from '../../components/ui';

export default function AdminCategories() {
  const [search, setSearch] = useState('');
  const { data: categories, loading, error } = useApi('/admin/categories');

  const filtered = categories?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.restaurant_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Food Categories</h1>
          <p className="text-xs text-ink-500">Overview of all active menu categories across platform restaurants</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or restaurants…"
            className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-xs text-ink-900 focus:outline-none"
          />
        </div>
      </div>

      <ErrorNote message={error} />
      {loading ? (
        <Spinner />
      ) : !filtered?.length ? (
        <Empty title="No categories found" hint="Restaurant managers create categories when organizing dishes." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="card p-5 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-ink-950 flex items-center gap-2">
                    <Tags className="h-4 w-4 text-brand-600" /> {c.name}
                  </h3>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                    {c.product_count || 0} dishes
                  </span>
                </div>
                <p className="text-xs text-ink-500 mt-1 flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-ink-400" /> {c.restaurant_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
