import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Users, Mail, Phone, MapPin, ShoppingBag, LifeBuoy, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, ErrorNote, Tabs } from '../../../components/ui';

export default function CustomerDetailsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customerId = searchParams.get('id');

  const [customerList, setCustomerList] = useState([]);
  const [selectedId, setSelectedId] = useState(customerId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('orders');
  const [err, setErr] = useState('');

  // Dropdown list
  useEffect(() => {
    api.get('/admin/customers').then((res) => {
      setCustomerList(res.data);
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
      const res = await api.get(`/admin/customers/${id}`);
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

  const customer = data?.customer;
  const orders = data?.orders || [];
  const tickets = data?.tickets || [];
  const addresses = data?.addresses || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl text-ink-900">Customer Details</h1>
          <p className="text-xs text-ink-500 mt-0.5">Diner account summary, addresses, lifetime orders, and support history</p>
        </div>

        {/* Customer Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-ink-500">Select Diner:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-800 shadow-2xs max-w-xs truncate"
          >
            {customerList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
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
      ) : !customer ? (
        <div className="card p-12 text-center text-ink-400">Please choose a customer to view details.</div>
      ) : (
        <div className="space-y-6">
          {/* Top Profile Card */}
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 font-black text-white text-2xl shadow-sm">
                  {customer.name ? customer.name[0] : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-extrabold text-ink-900">{customer.name}</h2>
                    <Badge status={customer.status} />
                  </div>
                  <p className="text-xs text-ink-500 mt-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-ink-400" /> {customer.email}
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-ink-400" /> {customer.phone || 'No phone registered'}
                  </p>
                </div>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-ink-50 p-3 text-center border border-ink-100">
                  <p className="text-[10px] font-bold uppercase text-ink-400">Total Orders</p>
                  <p className="text-lg font-black text-ink-900">{orders.length}</p>
                </div>
                <div className="rounded-xl bg-ink-50 p-3 text-center border border-ink-100">
                  <p className="text-[10px] font-bold uppercase text-ink-400">Email Verification</p>
                  <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    customer.email_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {customer.email_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtabs */}
          <Tabs
            tabs={[
              ['orders', `Orders History (${orders.length})`],
              ['addresses', `Delivery Addresses (${addresses.length})`],
              ['tickets', `Support Inquiries (${tickets.length})`]
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === 'orders' && (
            <div className="card p-5">
              <h3 className="font-extrabold text-sm text-ink-900 mb-4">Past Orders</h3>
              {orders.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-400">This customer has not placed any orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-ink-100 bg-ink-50 text-[11px] font-bold text-ink-500">
                      <tr>
                        <th className="px-3 py-2">Order ID</th>
                        <th className="px-3 py-2">Restaurant</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Payment</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-ink-50">
                          <td className="px-3 py-2 font-mono font-bold text-ink-900">
                            <Link to={`/admin/orders/details?id=${o.id}`} className="hover:underline text-brand-600">
                              #{o.id.slice(0, 8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-3 py-2 text-ink-700 font-semibold">{o.restaurant_name}</td>
                          <td className="px-3 py-2 text-ink-400">{when(o.created_at)}</td>
                          <td className="px-3 py-2"><Badge status={o.status} /></td>
                          <td className="px-3 py-2"><Badge status={o.payment_status} /></td>
                          <td className="px-3 py-2 text-right font-bold text-ink-900">{money(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'addresses' && (
            <div className="card p-5">
              <h3 className="font-extrabold text-sm text-ink-900 mb-4">Saved Delivery Locations</h3>
              {addresses.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-400">No saved addresses on file.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <div key={a.id} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4 text-xs">
                      <div className="flex items-center gap-2 font-bold text-ink-900">
                        <MapPin className="h-4 w-4 text-brand-600" />
                        <span>{a.label || 'Home / Delivery'}</span>
                      </div>
                      <p className="mt-1 text-ink-600">{a.address_line}</p>
                      {a.instructions && (
                        <p className="mt-1 text-[11px] text-ink-400">Notes: {a.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'tickets' && (
            <div className="card p-5">
              <h3 className="font-extrabold text-sm text-ink-900 mb-4">Support Inquiries</h3>
              {tickets.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-400">No support tickets reported by this user.</p>
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4 text-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-ink-900">#{t.ticket_number}</span>
                          <Badge status={t.status} />
                        </div>
                        <p className="font-semibold text-ink-800 mt-1">{t.subject}</p>
                        <p className="text-[11px] text-ink-400 mt-0.5">{when(t.created_at)}</p>
                      </div>
                      <Link
                        to={`/admin/support/customer?id=${t.id}`}
                        className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 font-bold text-ink-700 hover:bg-ink-100 text-xs shadow-2xs"
                      >
                        Inspect Ticket
                      </Link>
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
