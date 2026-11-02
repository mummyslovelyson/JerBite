import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Edit2, Layers, Plus, Search, Trash2, Utensils, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import { Empty, ErrorNote, PageHeader, Spinner } from '../../components/ui';

export default function ManagerCategories() {
  const { data, loading, error, reload } = useApi('/manager/categories');
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api.post('/manager/categories', { name: name.trim() });
      toast.success('Category added');
      setName('');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.name);
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    setBusy(true);
    try {
      await api.put(`/manager/categories/${id}`, { name: editName.trim() });
      toast.success('Category updated');
      setEditingId(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    const hint = c.product_count > 0 ? ` It has ${c.product_count} dish(es) assigned.` : '';
    if (!window.confirm(`Delete category "${c.name}"?${hint}`)) return;
    try {
      await api.delete(`/manager/categories/${c.id}`);
      toast.success('Category deleted');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase().trim();
    return data.filter((c) => c.name.toLowerCase().includes(q));
  }, [data, search]);

  const totalDishes = useMemo(() => {
    if (!data) return 0;
    return data.reduce((acc, c) => acc + (c.product_count || 0), 0);
  }, [data]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Menu Categories</h1>
          <p className="text-xs text-ink-500">
            Organize dishes into sections so customers can browse and filter your menu quickly.
          </p>
        </div>
        <div className="text-xs font-semibold text-ink-600">
          {data?.length || 0} Categories · {totalDishes} Dishes Categorized
        </div>
      </div>

      <ErrorNote message={error} />

      {/* Add Category Card */}
      <div className="card p-4">
        <h2 className="text-sm font-bold text-ink-900 mb-2 flex items-center gap-1.5">
          <Plus className="h-4 w-4 text-brand-600" /> Create New Category
        </h2>
        <form onSubmit={add} className="flex gap-2">
          <input
            className="input flex-1 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Appetizers, Main Courses, Desserts, Drinks..."
            aria-label="Category name"
          />
          <button className="btn-primary" disabled={busy || !name.trim()}>
            {busy ? 'Adding…' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Search Input if multiple categories exist */}
      {data && data.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <input
            type="text"
            className="input pl-9 text-sm"
            placeholder="Filter categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-ink-400 hover:text-ink-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Category List */}
      {loading ? (
        <Spinner />
      ) : !filtered.length ? (
        <Empty
          title={data?.length === 0 ? 'No categories yet' : 'No categories match your search'}
          hint={data?.length === 0 ? 'Add your first menu category above.' : 'Try a different search term.'}
        />
      ) : (
        <div className="card divide-y divide-ink-100 overflow-hidden">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3.5 hover:bg-ink-50/50 transition">
              {editingId === c.id ? (
                <div className="flex flex-1 items-center gap-2 mr-2">
                  <input
                    type="text"
                    className="input py-1 text-sm flex-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(c.id)}
                    className="btn-primary py-1 px-2.5 text-xs"
                    disabled={busy || !editName.trim()}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn-ghost py-1 px-2 text-xs"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-ink-900">{c.name}</p>
                    <span className="text-xs text-ink-500 font-medium">
                      {c.product_count || 0} {c.product_count === 1 ? 'dish' : 'dishes'}
                    </span>
                  </div>
                </div>
              )}

              {editingId !== c.id && (
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/manager/products`}
                    className="btn-ghost text-xs text-ink-600 hover:text-brand-600"
                    title="View dishes in this category"
                  >
                    <Utensils className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => startEdit(c)}
                    className="btn-ghost p-1.5 text-ink-600 hover:text-ink-900"
                    title="Edit category name"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="btn-ghost p-1.5 text-rose-600 hover:bg-rose-50"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
