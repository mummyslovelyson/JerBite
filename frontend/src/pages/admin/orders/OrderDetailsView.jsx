import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ClipboardList, Store, User, Bike, MapPin, DollarSign, Clock, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote, Tabs } from '../../../components/ui';

export default function OrderDetailsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderId = searchParams.get('id');

  const [ordersList, setOrdersList] = useState([]);
  const [selectedId, setSelectedId] = useState(orderId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Status override modal
  const [statusModal, setStatusModal] = useState({ open: false, nextStatus: 'delivered', note: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/admin/orders').then((res) => {
      setOrdersList(res.data);
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
      const res = await api.get(`/admin/orders/${id}`);
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

  const handleStatusOverride = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/admin/orders/${selectedId}/status`, {
        status: statusModal.nextStatus,
        note: statusModal.note.trim()
      });
      setStatusModal({ open: false, nextStatus: 'delivered', note: '' });
      loadDetails(selectedId);
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const order = data?.order;
  const history = data?.history || [];
  const payments = data?.payments || [];
  const tickets = data?.tickets || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl text-ink-900">Order Details</h1>
          <p className="text-xs text-ink-500 mt-0.5">Audit order items, status logs, courier assignment, and payment history</p>
        </div>

        {/* Order Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-ink-500">Select Order:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-mono font-bold text-ink-800 shadow-2xs max-w-xs truncate"
          >
            {ordersList.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.id.slice(0, 8).toUpperCase()} - {o.restaurant_name} ({o.status})
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
      ) : !order ? (
        <div className="card p-12 text-center text-ink-400">Please choose an order to inspect.</div>
      ) : (
        <div className="space-y-6">
          {/* Top Banner Card */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black font-mono text-ink-900">#{order.id.slice(0, 8).toUpperCase()}</h2>
                  <Badge status={order.status} />
                  <Badge status={order.payment_status} />
                </div>
                <p className="text-xs text-ink-500 mt-1">Placed on {when(order.created_at)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusModal({ open: true, nextStatus: order.status, note: '' })}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
                >
                  Override Status
                </button>
              </div>
            </div>

            {/* 3 Pillars: Restaurant, Customer, Rider */}
            <div className="mt-6 pt-5 border-t border-ink-100 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-xl bg-ink-50/70 p-3 border border-ink-100">
                <p className="font-bold uppercase text-[10px] text-ink-400 flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-brand-600" /> Restaurant
                </p>
                <p className="font-extrabold text-sm text-ink-900 mt-1">{order.restaurant_name}</p>
                <p className="text-ink-500 mt-0.5">{order.restaurant_address || 'No address'}</p>
              </div>

              <div className="rounded-xl bg-ink-50/70 p-3 border border-ink-100">
                <p className="font-bold uppercase text-[10px] text-ink-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-600" /> Customer
                </p>
                <p className="font-extrabold text-sm text-ink-900 mt-1">{order.customer_name}</p>
                <p className="text-ink-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" /> {order.delivery_address || 'Pickup'}
                </p>
              </div>

              <div className="rounded-xl bg-ink-50/70 p-3 border border-ink-100">
                <p className="font-bold uppercase text-[10px] text-ink-400 flex items-center gap-1.5">
                  <Bike className="h-3.5 w-3.5 text-sky-600" /> Assigned Courier
                </p>
                <p className="font-extrabold text-sm text-ink-900 mt-1">{order.rider_name || 'No Courier Assigned'}</p>
                <p className="text-ink-500 mt-0.5">Contact: {order.rider_phone || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          {/* Items & Payment Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 card p-5 space-y-4">
              <h3 className="font-extrabold text-sm text-ink-900">Order Items ({order.items?.length || 0})</h3>
              <div className="divide-y divide-ink-100">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-100 font-bold text-ink-700">
                        {item.quantity || 1}x
                      </span>
                      <div>
                        <p className="font-bold text-ink-900">{item.name}</p>
                        {item.instructions && <p className="text-[11px] text-ink-500">Note: {item.instructions}</p>}
                      </div>
                    </div>
                    <span className="font-extrabold text-ink-900">{money(item.price * (item.quantity || 1))}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-ink-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal</span>
                  <span>{money(order.subtotal || (order.total - (order.delivery_fee || 0)))}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Delivery Fee</span>
                  <span>{money(order.delivery_fee || 0)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-ink-900 pt-2 border-t border-ink-100">
                  <span>Total Amount</span>
                  <span>{money(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Status History */}
            <div className="card p-5 space-y-4">
              <h3 className="font-extrabold text-sm text-ink-900">Fulfillment Timeline</h3>
              {history.length === 0 ? (
                <p className="text-xs text-ink-400">Current status: {order.status}</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <div className="mt-1 h-2 w-2 rounded-full bg-brand-600 shrink-0" />
                      <div>
                        <p className="font-bold text-ink-900 capitalize">{h.status}</p>
                        <p className="text-[10px] text-ink-400">{when(h.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Override Dialog */}
      {statusModal.open && (
        <Modal
          title={`Override Status for #${order?.id.slice(0, 8).toUpperCase()}`}
          onClose={() => setStatusModal({ ...statusModal, open: false })}
        >
          <form onSubmit={handleStatusOverride} className="space-y-4">
            <Field label="Target Status">
              <select
                value={statusModal.nextStatus}
                onChange={(e) => setStatusModal({ ...statusModal, nextStatus: e.target.value })}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs bg-white focus:border-brand-500 focus:outline-hidden"
              >
                <option value="placed">Placed</option>
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="picked_up">Picked Up</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>

            <Field label="Administrative Reason">
              <textarea
                rows={3}
                value={statusModal.note}
                onChange={(e) => setStatusModal({ ...statusModal, note: e.target.value })}
                placeholder="Reason for manual status change..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModal({ ...statusModal, open: false })}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
              >
                {submitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
