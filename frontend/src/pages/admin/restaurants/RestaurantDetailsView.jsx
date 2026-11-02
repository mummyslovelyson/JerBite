import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Store, MapPin, Phone, Mail, ShoppingBag, FileText, CheckCircle2, XCircle, ArrowLeft, RefreshCw, Star } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote, Tabs } from '../../../components/ui';

export default function RestaurantDetailsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const restaurantId = searchParams.get('id');

  const [restaurantsList, setRestaurantsList] = useState([]);
  const [selectedId, setSelectedId] = useState(restaurantId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('overview');
  const [err, setErr] = useState('');

  // Load all restaurants for dropdown switcher if none selected
  useEffect(() => {
    api.get('/admin/restaurants').then((res) => {
      setRestaurantsList(res.data);
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
      const res = await api.get(`/admin/restaurants/${id}`);
      setData(res.data);
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

  const restaurant = data?.restaurant;
  const products = data?.products || [];
  const recentOrders = data?.recentOrders || [];
  const documents = data?.documents || [];
  const changeRequests = data?.changeRequests || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl text-ink-900">Restaurant Details</h1>
          <p className="text-xs text-ink-500 mt-0.5">Comprehensive audit inspection of profile, catalog, credentials, and transactions</p>
        </div>

        {/* Restaurant Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-ink-500">Inspect Restaurant:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-800 shadow-2xs max-w-xs truncate"
          >
            {restaurantsList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.status})
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
      ) : !restaurant ? (
        <div className="card p-12 text-center text-ink-400">Please select a restaurant to view details.</div>
      ) : (
        <div className="space-y-6">
          {/* Top Profile Summary Card */}
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500 font-black text-white text-2xl shadow-sm">
                  {restaurant.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-extrabold text-ink-900">{restaurant.name}</h2>
                    <Badge status={restaurant.status} />
                  </div>
                  <p className="text-xs text-brand-600 font-bold mt-0.5">{restaurant.cuisine || 'Cuisine not specified'}</p>
                  <p className="text-xs text-ink-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-ink-400" />
                    {restaurant.address || 'No physical address registered'}
                  </p>
                </div>
              </div>

              {/* Stats overview pill */}
              <div className="flex items-center gap-4 rounded-xl bg-ink-50 p-3 text-center border border-ink-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Rating</p>
                  <p className="text-base font-extrabold text-amber-600 flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {restaurant.average_rating || '5.0'}
                  </p>
                </div>
                <div className="h-8 w-px bg-ink-200" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Total Sales</p>
                  <p className="text-base font-extrabold text-ink-900">{money(restaurant.gross_sales || 0)}</p>
                </div>
                <div className="h-8 w-px bg-ink-200" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Orders</p>
                  <p className="text-base font-extrabold text-ink-900">{restaurant.completed_orders || 0}</p>
                </div>
              </div>
            </div>

            {/* Quick Contact & Info Grid */}
            <div className="mt-5 pt-4 border-t border-ink-100 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="flex items-center gap-2 text-ink-700">
                <Mail className="h-4 w-4 text-ink-400" />
                <span>Owner: <strong>{restaurant.owner_name}</strong> ({restaurant.owner_email})</span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Phone className="h-4 w-4 text-ink-400" />
                <span>Phone: <strong>{restaurant.owner_phone || restaurant.phone || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-ink-700">
                <Store className="h-4 w-4 text-ink-400" />
                <span>Operational: <strong>{restaurant.is_open ? 'Open Now' : 'Closed'}</strong></span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <Tabs
            tabs={[
              ['overview', `Menu Items (${products.length})`],
              ['orders', `Recent Orders (${recentOrders.length})`],
              ['documents', `Documents & Verification (${documents.length})`],
              ['changes', `Profile Change Requests (${changeRequests.length})`]
            ]}
            value={tab}
            onChange={setTab}
          />

          {/* Tab 1: Products */}
          {tab === 'overview' && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm text-ink-900">Menu Catalog</h3>
                <span className="text-xs text-ink-400">{products.length} items registered</span>
              </div>

              {products.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-400">This restaurant has not added any menu items yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-start gap-3 rounded-xl border border-ink-100 p-3 bg-ink-50/40">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink-200 text-ink-500 font-bold">
                          🍴
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-ink-900 truncate">{p.name}</p>
                          <Badge status={p.status} />
                        </div>
                        <p className="text-xs font-extrabold text-brand-600 mt-0.5">{money(p.price)}</p>
                        <p className="text-[11px] text-ink-400 truncate">{p.description || 'No description'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Orders */}
          {tab === 'orders' && (
            <div className="card p-5">
              <h3 className="font-extrabold text-sm text-ink-900 mb-4">Recent Store Orders</h3>
              {recentOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-400">No orders placed at this restaurant yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-ink-100 bg-ink-50 text-[11px] font-bold text-ink-500">
                      <tr>
                        <th className="px-3 py-2">Order ID</th>
                        <th className="px-3 py-2">Customer</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-ink-50">
                          <td className="px-3 py-2 font-mono font-bold text-ink-900">
                            #{o.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-3 py-2 text-ink-700">{o.customer_name}</td>
                          <td className="px-3 py-2 text-ink-400">{when(o.created_at)}</td>
                          <td className="px-3 py-2"><Badge status={o.status} /></td>
                          <td className="px-3 py-2 text-right font-bold text-ink-900">{money(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Documents */}
          {tab === 'documents' && (
            <div className="card p-5">
              <h3 className="font-extrabold text-sm text-ink-900 mb-4">Official Verification Documents</h3>
              {documents.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-400">No verification documents have been uploaded for this restaurant.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/50 p-3 text-xs">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-ink-500" />
                        <div>
                          <p className="font-bold text-ink-900">{doc.document_type}</p>
                          <p className="text-[11px] text-ink-400">Uploaded {when(doc.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge status={doc.status} />
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-brand-600 hover:underline"
                          >
                            View File
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Change Requests */}
          {tab === 'changes' && (
            <div className="card p-5">
              <h3 className="font-extrabold text-sm text-ink-900 mb-4">Profile Change History</h3>
              {changeRequests.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-400">No profile change requests submitted.</p>
              ) : (
                <div className="space-y-3">
                  {changeRequests.map((cr) => (
                    <div key={cr.id} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4 text-xs">
                      <div className="flex items-center justify-between">
                        <Badge status={cr.status} />
                        <span className="text-[11px] text-ink-400">{when(cr.created_at)}</span>
                      </div>
                      <p className="mt-2 text-ink-700 font-medium">Reason: {cr.reason || 'None provided'}</p>
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-2.5 font-mono text-[11px] text-ink-800 border border-ink-200">
                        {JSON.stringify(cr.changes, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
