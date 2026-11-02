import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { UtensilsCrossed, Store, Tag, DollarSign, CheckCircle2, XCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function FoodDetailsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const foodId = searchParams.get('id');

  const [foodsList, setFoodsList] = useState([]);
  const [selectedId, setSelectedId] = useState(foodId || '');
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Dropdown options
  useEffect(() => {
    api.get('/admin/products').then((res) => {
      setFoodsList(res.data);
      if (!selectedId && res.data.length > 0) {
        setSelectedId(res.data[0].id);
        setSearchParams({ id: res.data[0].id });
      }
    }).catch(() => {});
  }, []);

  const loadDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/products/${id}`);
      setFood(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      loadDetails(selectedId);
      setSearchParams({ id: selectedId });
    }
  }, [selectedId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl text-ink-900">Food Details</h1>
          <p className="text-xs text-ink-500 mt-0.5">Item specifications, pricing structure, restaurant source, and sales analytics</p>
        </div>

        {/* Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-ink-500">Select Dish:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-800 shadow-2xs max-w-xs truncate"
          >
            {foodsList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.restaurant_name})
              </option>
            ))}
          </select>
          <button
            onClick={() => loadDetails(selectedId)}
            className="rounded-xl border border-ink-200 bg-white p-2 text-ink-600 hover:bg-ink-50 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : !food ? (
        <div className="card p-12 text-center text-ink-400">Please choose a dish to inspect.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex flex-wrap items-start gap-5">
                {food.image_url ? (
                  <img src={food.image_url} alt={food.name} className="h-32 w-32 rounded-2xl object-cover shadow-sm border border-ink-100" />
                ) : (
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-ink-100 text-5xl">
                    🍲
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl font-black text-ink-900">{food.name}</h2>
                    <Badge status={food.status} />
                  </div>
                  <p className="text-sm font-extrabold text-brand-600 mt-1">{money(food.price)}</p>
                  <p className="text-xs text-ink-600 mt-2">{food.description || 'No description provided.'}</p>
                </div>
              </div>

              {/* Attributes */}
              <div className="mt-6 pt-5 border-t border-ink-100 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <span className="font-bold text-ink-400 uppercase text-[10px]">Restaurant</span>
                  <p className="font-extrabold text-ink-900 mt-0.5">{food.restaurant_name}</p>
                </div>
                <div>
                  <span className="font-bold text-ink-400 uppercase text-[10px]">Category</span>
                  <p className="font-extrabold text-ink-900 mt-0.5">{food.category_name || 'General'}</p>
                </div>
                <div>
                  <span className="font-bold text-ink-400 uppercase text-[10px]">Availability</span>
                  <p className="font-extrabold text-ink-900 mt-0.5">{food.is_available ? 'Available' : 'Sold Out'}</p>
                </div>
                <div>
                  <span className="font-bold text-ink-400 uppercase text-[10px]">Times Ordered</span>
                  <p className="font-extrabold text-ink-900 mt-0.5">{food.times_ordered || 0} times</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info & Moderation History */}
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="font-black text-sm text-ink-900">Moderation Status</h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Current Status:</span>
                  <Badge status={food.status} />
                </div>
                {food.review_note && (
                  <div className="rounded-lg bg-ink-50 p-3 mt-2">
                    <span className="font-bold text-ink-700">Auditor Feedback:</span>
                    <p className="text-ink-600 mt-0.5">{food.review_note}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-ink-100">
                <Link
                  to={`/admin/restaurants/details?id=${food.restaurant_id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 bg-white p-2.5 text-xs font-bold text-ink-700 hover:bg-ink-50 shadow-2xs w-full"
                >
                  <Store className="h-4 w-4" /> View Restaurant Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
