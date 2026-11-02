import { useState, useMemo } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronRight, Eye, Filter,
  Image as ImageIcon, LayoutGrid, List, Pencil, Plus, Search, Trash2, X, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { assetUrl, errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import {
  Badge, Empty, ErrorNote, Field, Modal, PageHeader, Spinner, Tabs, money
} from '../../components/ui';

const blank = { name: '', description: '', price: '', categoryId: '' };

export default function ManagerProducts() {
  const products = useApi('/manager/products');
  const cats = useApi('/manager/categories');

  const [tab, setTab] = useState('all'); // 'all' | 'approved' | 'pending' | 'rejected'
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState(''); // '' | 'in' | 'out'
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [edit, setEdit] = useState(null); // null | 'new' | product
  const [f, setF] = useState(blank);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const open = (p) => {
    setEdit(p || 'new');
    setImage(null);
    setImagePreview(p?.image_url ? assetUrl(p.image_url) : null);
    setError('');
    setF(
      p
        ? {
            name: p.name,
            description: p.description || '',
            price: p.price,
            categoryId: p.category_id || ''
          }
        : blank
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    try {
      await (edit === 'new'
        ? api.post('/manager/products', fd)
        : api.put(`/manager/products/${edit.id}`, fd));
      toast.success(
        edit === 'new'
          ? 'Dish submitted for admin approval'
          : 'Changes submitted for admin approval'
      );
      setEdit(null);
      products.reload();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleStock = async (p) => {
    try {
      await api.patch(`/manager/products/${p.id}/availability`, { isAvailable: !p.is_available });
      toast.success(p.is_available ? `"${p.name}" marked Out of Stock` : `"${p.name}" marked In Stock`);
      products.reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}" permanently from your menu?`)) return;
    try {
      await api.delete(`/manager/products/${p.id}`);
      toast.success('Product deleted');
      products.reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const all = products.data || [];
    return {
      total: all.length,
      approved: all.filter((p) => p.status === 'approved').length,
      pending: all.filter((p) => p.status === 'pending').length,
      rejected: all.filter((p) => p.status === 'rejected').length,
      outOfStock: all.filter((p) => !p.is_available).length
    };
  }, [products.data]);

  // Filter list
  const list = useMemo(() => {
    let res = products.data || [];
    if (tab !== 'all') res = res.filter((p) => p.status === tab);
    if (categoryFilter) res = res.filter((p) => p.category_id === categoryFilter);
    if (stockFilter === 'in') res = res.filter((p) => p.is_available);
    if (stockFilter === 'out') res = res.filter((p) => !p.is_available);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q)
      );
    }
    return res;
  }, [products.data, tab, categoryFilter, stockFilter, search]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Menu & Dishes</h1>
          <p className="text-xs text-ink-500">
            Create and organize dishes. New and updated items go live after admin approval.
          </p>
        </div>
        <button className="btn-primary" onClick={() => open()}>
          <Plus className="h-4 w-4" /> Add Menu Item
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-3">
          <span className="text-xs text-ink-500 font-medium">Total Items</span>
          <p className="text-xl font-bold text-ink-900 mt-0.5">{stats.total}</p>
        </div>
        <div className="card p-3">
          <span className="text-xs text-emerald-700 font-medium">Live on Menu</span>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">{stats.approved}</p>
        </div>
        <div className="card p-3">
          <span className="text-xs text-amber-700 font-medium">Pending Review</span>
          <p className="text-xl font-bold text-amber-700 mt-0.5">{stats.pending}</p>
        </div>
        <div className="card p-3">
          <span className="text-xs text-ink-500 font-medium">Out of Stock</span>
          <p className="text-xl font-bold text-ink-700 mt-0.5">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="card p-3.5 space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="text"
              className="input pl-9 text-sm"
              placeholder="Search dishes by name or ingredient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-ink-400 hover:text-ink-700">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-ink-200 bg-white p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-ink-100 text-ink-900' : 'text-ink-400 hover:text-ink-700'}`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-ink-100 text-ink-900' : 'text-ink-400 hover:text-ink-700'}`}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Selects & Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-100">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              ['all', `All (${stats.total})`],
              ['approved', `Live (${stats.approved})`],
              ['pending', `In Review (${stats.pending})`],
              ['rejected', `Rejected (${stats.rejected})`]
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              className="input w-auto text-xs py-1"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {cats.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.product_count || 0})
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              className="input w-auto text-xs py-1"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              aria-label="Filter by stock"
            >
              <option value="">All Stock</option>
              <option value="in">In Stock Only</option>
              <option value="out">Out of Stock Only</option>
            </select>
          </div>
        </div>
      </div>

      <ErrorNote message={products.error} />

      {products.loading ? (
        <Spinner />
      ) : !list.length ? (
        <Empty
          title="No menu items match your filter"
          hint={
            products.data?.length === 0
              ? 'Add your first dish to start serving delicious food.'
              : 'Try clearing your search or category filters.'
          }
        >
          {products.data?.length === 0 && (
            <button className="btn-primary mt-3" onClick={() => open()}>
              <Plus className="h-4 w-4" /> Add Item
            </button>
          )}
        </Empty>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <div
              key={p.id}
              className={`card flex flex-col justify-between overflow-hidden border transition-all hover:shadow-md ${
                !p.is_available ? 'opacity-85 bg-ink-50/50' : ''
              }`}
            >
              <div>
                {/* Image */}
                <div className="relative h-44 w-full bg-ink-100 overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={assetUrl(p.image_url)}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-300">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge status={p.status} />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold shadow-xs ${
                        p.is_available
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {p.is_available ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-bold text-base text-ink-900 truncate" title={p.name}>
                      {p.name}
                    </h3>
                    <span className="font-black text-brand-600 shrink-0 text-base">
                      {money(p.price)}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    {p.category_name || 'Uncategorized'}
                  </p>

                  {p.description && (
                    <p className="text-xs text-ink-600 line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  {/* Rejection Review Note */}
                  {p.status === 'rejected' && p.review_note && (
                    <div className="rounded-lg bg-rose-50 p-2 text-xs text-rose-800 border border-rose-200">
                      <strong>Admin note:</strong> {p.review_note}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 bg-white">
                <label className="flex items-center gap-2 text-xs font-bold text-ink-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.is_available}
                    onChange={() => toggleStock(p)}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Available</span>
                </label>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => open(p)}
                    className="btn-ghost p-1.5 text-ink-600 hover:text-ink-900"
                    title="Edit item"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="btn-ghost p-1.5 text-rose-600 hover:bg-rose-50"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-200 bg-ink-50/70 text-xs font-bold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Dish</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">In Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-ink-100 overflow-hidden">
                        {p.image_url ? (
                          <img src={assetUrl(p.image_url)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ink-300">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-ink-900">{p.name}</p>
                        {p.description && <p className="text-xs text-ink-500 truncate max-w-xs">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600 font-medium">
                    {p.category_name || '—'}
                  </td>
                  <td className="px-4 py-3 font-bold text-ink-900">
                    {money(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.is_available}
                        onChange={() => toggleStock(p)}
                        className="h-4 w-4 rounded border-ink-300 text-brand-600"
                      />
                      <span>{p.is_available ? 'In Stock' : 'Out'}</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => open(p)} className="btn-ghost p-1.5" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(p)} className="btn-ghost p-1.5 text-rose-600 hover:bg-rose-50" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT DISH MODAL */}
      {edit && (
        <Modal
          title={edit === 'new' ? 'Add Menu Item' : `Edit "${edit.name}"`}
          onClose={() => setEdit(null)}
        >
          <form onSubmit={save} className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
              💡 <strong>Note:</strong> All new or edited dishes are reviewed by an administrator before appearing on the public menu.
            </div>

            <Field
              label="Dish Name"
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
              required
              placeholder="e.g. Jollof Rice with Grilled Chicken"
            />

            <Field label="Description & Ingredients">
              <textarea
                className="input min-h-20 text-sm"
                value={f.description}
                onChange={(e) => setF({ ...f, description: e.target.value })}
                placeholder="Delicious spiced jollof rice served with seasoned quarter chicken and fried plantains."
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Price"
                type="number"
                min="0"
                step="0.01"
                value={f.price}
                onChange={(e) => setF({ ...f, price: e.target.value })}
                required
                placeholder="0.00"
              />

              <Field label="Category">
                <select
                  className="input text-sm"
                  value={f.categoryId}
                  onChange={(e) => setF({ ...f, categoryId: e.target.value })}
                >
                  <option value="">No category</option>
                  {cats.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Photo Upload with preview */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Dish Photo
              </label>
              {imagePreview && (
                <div className="mb-2 relative h-36 w-full rounded-lg overflow-hidden border border-ink-200">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="input text-sm"
                onChange={handleImageChange}
              />
              <span className="text-xs text-ink-500 mt-1 block">
                Recommended: 800×600 PNG, JPG or WEBP up to 3 MB.
              </span>
            </div>

            <ErrorNote message={error} />

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEdit(null)}
              >
                Cancel
              </button>
              <button className="btn-primary" disabled={busy}>
                {busy ? 'Submitting…' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
