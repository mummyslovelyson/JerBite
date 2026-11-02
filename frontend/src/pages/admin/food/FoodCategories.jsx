import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, RefreshCw, Store } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Modal, Field, ErrorNote } from '../../../components/ui';

export default function FoodCategories() {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const [catRes, restRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/restaurants')
      ]);
      setCategories(catRes.data);
      setRestaurants(restRes.data);
      if (restRes.data.length > 0 && !restaurantId) {
        setRestaurantId(restRes.data[0].id);
      }
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    if (restaurants.length > 0) setRestaurantId(restaurants[0].id);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingCategory(c);
    setName(c.name);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, { name: name.trim() });
      } else {
        await api.post('/admin/categories', { name: name.trim(), restaurantId });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete category "${c.name}"? Products attached to it will lose their category link.`)) return;
    try {
      await api.delete(`/admin/categories/${c.id}`);
      load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Food Categories"
        sub="Organize menu taxonomy, dish groupings, and catalog classification across restaurants"
      >
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add New Category
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <Tag className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No categories found</h3>
          <p className="text-xs text-ink-500">Click &quot;Add New Category&quot; to establish your first food grouping.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card p-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Tag className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-ink-900 truncate">{c.name}</h4>
                </div>
                <p className="text-xs text-ink-500 mt-1 flex items-center gap-1">
                  <Store className="h-3 w-3 text-ink-400" /> {c.restaurant_name}
                </p>
                <p className="text-[11px] font-bold text-brand-600 mt-1">
                  {c.product_count} items in category
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(c)}
                  className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                  title="Edit Category Name"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                  title="Delete Category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <Modal
          title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Food Category'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Category Name" required>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Burgers, Traditional Soups, Beverages"
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            {!editingCategory && (
              <Field label="Assign to Restaurant">
                <select
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 p-2.5 text-xs bg-white focus:border-brand-500 focus:outline-hidden"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
              >
                {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
