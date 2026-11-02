import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Bell, BellOff, CheckCircle2, ChefHat, Clock, ExternalLink, Filter,
  Kanban, ListFilter, MapPin, Phone, Printer, RefreshCw, Search,
  ShoppingBag, Truck, User, X, XCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import { Badge, Empty, ErrorNote, Modal, PageHeader, Spinner, Tabs, money, when } from '../../components/ui';

// Audio chime using Web Audio API (works offline, zero asset dependency)
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Ding-dong chord
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.15); // A5
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.85);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

const NEXT = {
  placed: [['accepted', 'Accept Order', 'btn-primary'], ['cancelled', 'Decline', 'btn-ghost text-red-600']],
  accepted: [['preparing', 'Start Preparing', 'btn-primary']],
  preparing: [['ready', 'Mark Ready for Pickup', 'btn-primary']]
};

export default function ManagerOrders() {
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kds'
  const [search, setSearch] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const prevPlacedCountRef = useRef(0);

  const { data: orders, loading, error, reload } = useApi('/manager/orders', { status: viewMode === 'kds' ? '' : status });

  // Sound alert on new incoming 'placed' orders
  useEffect(() => {
    if (!orders) return;
    const placedCount = orders.filter((o) => o.status === 'placed').length;
    if (soundEnabled && placedCount > prevPlacedCountRef.current && prevPlacedCountRef.current !== 0) {
      playOrderChime();
      toast('🔔 New order received!', { icon: '🍲' });
    }
    prevPlacedCountRef.current = placedCount;
  }, [orders, soundEnabled]);

  // Periodic polling every 15s
  useEffect(() => {
    const t = setInterval(reload, 15000);
    return () => clearInterval(t);
  }, [reload]);

  const move = async (o, to, reason = '') => {
    setActionBusy(true);
    try {
      await api.patch(`/manager/orders/${o.id}/status`, { status: to, reason });
      toast.success(to === 'cancelled' ? 'Order declined' : 'Order status updated');
      if (selectedOrder?.id === o.id) setSelectedOrder(null);
      setDeclineTarget(null);
      setDeclineReason('');
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeclineSubmit = (e) => {
    e.preventDefault();
    if (!declineTarget) return;
    move(declineTarget, 'cancelled', declineReason.trim());
  };

  // Filtered orders
  const filtered = useMemo(() => {
    if (!orders) return [];
    let list = orders;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.delivery_phone?.toLowerCase().includes(q) ||
          o.delivery_address?.toLowerCase().includes(q) ||
          o.items?.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, search]);

  const counts = useMemo(() => {
    if (!orders) return {};
    return orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const placedOrders = useMemo(() => (orders || []).filter((o) => o.status === 'placed'), [orders]);
  const acceptedOrders = useMemo(() => (orders || []).filter((o) => o.status === 'accepted'), [orders]);
  const preparingOrders = useMemo(() => (orders || []).filter((o) => o.status === 'preparing'), [orders]);
  const readyOrders = useMemo(() => (orders || []).filter((o) => o.status === 'ready' || o.status === 'picked_up'), [orders]);

  const printTicket = (o) => {
    const printWin = window.open('', '_blank', 'width=400,height=600');
    if (!printWin) {
      toast.error('Pop-up was blocked. Please allow pop-ups to print tickets.');
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order #${o.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: monospace; font-size: 13px; line-height: 1.4; padding: 16px; margin: 0; color: #000; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; }
            .items { margin: 12px 0; }
            .item-line { display: flex; justify-content: space-between; margin-bottom: 4px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">${o.restaurant_name || 'KITCHEN ORDER TICKET'}</div>
          <div class="center">Order #${o.id.slice(0, 8).toUpperCase()}</div>
          <div class="center">${new Date(o.created_at).toLocaleString()}</div>
          <div class="divider"></div>
          <div><strong>Customer:</strong> ${o.customer_name}</div>
          <div><strong>Phone:</strong> ${o.delivery_phone}</div>
          <div><strong>Deliver to:</strong> ${o.delivery_address}</div>
          ${o.notes ? `<div><strong>Notes:</strong> ${o.notes}</div>` : ''}
          <div class="divider"></div>
          <div class="items">
            ${o.items.map((i) => `<div class="item-line"><span>${i.quantity} × ${i.name}</span><span>${(i.price * i.quantity).toFixed(2)}</span></div>`).join('')}
          </div>
          <div class="divider"></div>
          <div class="row"><span>Subtotal:</span><span>${Number(o.subtotal).toFixed(2)}</span></div>
          <div class="row"><span>Delivery Fee:</span><span>${Number(o.delivery_fee).toFixed(2)}</span></div>
          <div class="row bold" style="font-size: 15px; margin-top: 4px;"><span>Total:</span><span>${Number(o.total).toFixed(2)}</span></div>
          <div class="divider"></div>
          <div class="center" style="font-size: 11px;">Thank you for your order!</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div className="space-y-5">
      {/* Page Header with Realtime status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold sm:text-2xl">Order Management & KDS</h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full animate-ping bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="text-xs text-ink-500">Auto-refreshes every 15s</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`btn-ghost text-xs ${soundEnabled ? 'text-brand-600' : 'text-ink-500'}`}
            title={soundEnabled ? 'Order sound alerts enabled' : 'Order sound alerts muted'}
          >
            {soundEnabled ? <Bell className="h-4 w-4 text-brand-600" /> : <BellOff className="h-4 w-4" />}
            {soundEnabled ? 'Chime On' : 'Muted'}
          </button>

          {/* View Switcher: List vs Kanban KDS */}
          <div className="flex rounded-lg border border-ink-200 bg-white p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('kds')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                viewMode === 'kds' ? 'bg-brand-500 text-white' : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" /> Kitchen Display
            </button>
          </div>

          <button onClick={() => reload()} className="btn-ghost p-2" title="Manual refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <ErrorNote message={error} />

      {/* New Orders Banner if any pending placed orders need acceptance */}
      {placedOrders.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-brand-300 bg-brand-50 p-3.5 text-brand-950">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white font-bold text-sm animate-bounce">
              {placedOrders.length}
            </span>
            <div>
              <p className="font-bold text-sm">
                {placedOrders.length} new order{placedOrders.length > 1 ? 's' : ''} waiting for acceptance!
              </p>
              <p className="text-xs text-brand-800">Review and accept to notify the kitchen and customer.</p>
            </div>
          </div>
          {viewMode !== 'kds' && (
            <button onClick={() => setStatus('placed')} className="btn-primary text-xs">
              Show new orders
            </button>
          )}
        </div>
      )}

      {/* Search & Tabs (Visible in list view) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-500" />
          <input
            type="text"
            className="input pl-9 text-sm"
            placeholder="Search by Order #, customer, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-ink-500 hover:text-ink-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {viewMode === 'list' && (
          <Tabs
            value={status}
            onChange={setStatus}
            tabs={[
              ['', `All (${orders?.length || 0})`],
              ['placed', `New (${counts.placed || 0})`],
              ['accepted', `Accepted (${counts.accepted || 0})`],
              ['preparing', `Preparing (${counts.preparing || 0})`],
              ['ready', `Ready (${counts.ready || 0})`],
              ['picked_up', `On Way (${counts.picked_up || 0})`],
              ['delivered', `Delivered (${counts.delivered || 0})`],
              ['cancelled', `Cancelled (${counts.cancelled || 0})`]
            ]}
          />
        )}
      </div>

      {loading && !orders ? (
        <Spinner />
      ) : viewMode === 'kds' ? (
        /* KITCHEN DISPLAY SYSTEM (KANBAN) VIEW */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Column 1: New / Placed */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-3">
            <div className="mb-3 flex items-center justify-between border-b border-amber-200 pb-2">
              <h2 className="flex items-center gap-1.5 font-bold text-sm text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                1. New Orders ({placedOrders.length})
              </h2>
            </div>
            <div className="space-y-3">
              {!placedOrders.length ? (
                <p className="py-6 text-center text-xs text-ink-500">No new incoming orders</p>
              ) : (
                placedOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onOpen={() => setSelectedOrder(o)}
                    onPrint={() => printTicket(o)}
                    actions={
                      <div className="flex w-full gap-2 pt-2 border-t border-ink-100">
                        <button
                          disabled={actionBusy}
                          onClick={() => setDeclineTarget(o)}
                          className="btn-ghost flex-1 text-xs text-rose-600 py-1.5"
                        >
                          Decline
                        </button>
                        <button
                          disabled={actionBusy}
                          onClick={() => move(o, 'accepted')}
                          className="btn-primary flex-1 text-xs py-1.5"
                        >
                          Accept
                        </button>
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 2: Accepted / Queued */}
          <div className="rounded-xl border border-sky-300 bg-sky-50/40 p-3">
            <div className="mb-3 flex items-center justify-between border-b border-sky-200 pb-2">
              <h2 className="flex items-center gap-1.5 font-bold text-sm text-sky-900">
                <ChefHat className="h-4 w-4 text-sky-600" />
                2. Accepted ({acceptedOrders.length})
              </h2>
            </div>
            <div className="space-y-3">
              {!acceptedOrders.length ? (
                <p className="py-6 text-center text-xs text-ink-500">No accepted orders</p>
              ) : (
                acceptedOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onOpen={() => setSelectedOrder(o)}
                    onPrint={() => printTicket(o)}
                    actions={
                      <button
                        disabled={actionBusy}
                        onClick={() => move(o, 'preparing')}
                        className="btn-primary w-full text-xs py-1.5"
                      >
                        Start Preparing
                      </button>
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 3: In Preparation */}
          <div className="rounded-xl border border-indigo-300 bg-indigo-50/40 p-3">
            <div className="mb-3 flex items-center justify-between border-b border-indigo-200 pb-2">
              <h2 className="flex items-center gap-1.5 font-bold text-sm text-indigo-900">
                <ChefHat className="h-4 w-4 text-indigo-600 animate-pulse" />
                3. Preparing ({preparingOrders.length})
              </h2>
            </div>
            <div className="space-y-3">
              {!preparingOrders.length ? (
                <p className="py-6 text-center text-xs text-ink-500">No orders cooking</p>
              ) : (
                preparingOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onOpen={() => setSelectedOrder(o)}
                    onPrint={() => printTicket(o)}
                    actions={
                      <button
                        disabled={actionBusy}
                        onClick={() => move(o, 'ready')}
                        className="btn-primary w-full text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700"
                      >
                        Mark Ready for Rider
                      </button>
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 4: Ready & In Delivery */}
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-3">
            <div className="mb-3 flex items-center justify-between border-b border-emerald-200 pb-2">
              <h2 className="flex items-center gap-1.5 font-bold text-sm text-emerald-900">
                <Truck className="h-4 w-4 text-emerald-600" />
                4. Ready / Out ({readyOrders.length})
              </h2>
            </div>
            <div className="space-y-3">
              {!readyOrders.length ? (
                <p className="py-6 text-center text-xs text-ink-500">No ready or out deliveries</p>
              ) : (
                readyOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onOpen={() => setSelectedOrder(o)}
                    onPrint={() => printTicket(o)}
                    actions={
                      <div className="text-xs text-ink-500 font-medium text-center py-1">
                        {o.status === 'ready'
                          ? o.rider_name
                            ? `Assigned to ${o.rider_name}`
                            : 'Waiting for rider to accept'
                          : `With rider (${o.rider_name || 'Rider'})`}
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD DETAILED LIST VIEW */
        <div className="space-y-3">
          {!filtered.length ? (
            <Empty title="No orders found" hint="Orders will appear here as customers place them." />
          ) : (
            filtered.map((o) => (
              <div
                key={o.id}
                className="card p-4 transition-all hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="font-bold text-base text-ink-900 hover:text-brand-600 hover:underline"
                      >
                        #{o.id.slice(0, 8).toUpperCase()}
                      </button>
                      <Badge status={o.status} />
                      <Badge status={o.payment_status} />
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">
                      Ordered {when(o.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => printTicket(o)}
                      className="btn-ghost p-1.5 text-ink-600"
                      title="Print kitchen ticket"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="btn-ghost text-xs font-semibold"
                    >
                      View details
                    </button>
                  </div>
                </div>

                {/* Customer & Delivery row */}
                <div className="mt-3 grid gap-2 text-xs text-ink-700 sm:grid-cols-2 md:grid-cols-3">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-ink-500" />
                    <span>
                      <strong className="text-ink-900">{o.customer_name}</strong> ·{' '}
                      <a href={`tel:${o.delivery_phone}`} className="text-brand-600 hover:underline">
                        {o.delivery_phone}
                      </a>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-ink-500 shrink-0" />
                    <span className="truncate" title={o.delivery_address}>
                      {o.delivery_address}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-ink-500" />
                    <span>
                      {o.rider_name ? (
                        <>Rider: <strong className="text-ink-900">{o.rider_name}</strong> ({o.rider_phone})</>
                      ) : (
                        <span className="text-ink-500 italic">No rider assigned</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="mt-3 rounded-lg bg-ink-50/70 p-2.5 text-xs">
                  <div className="font-semibold text-ink-700 mb-1">Items ({o.items?.length || 0}):</div>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {o.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.quantity}× {item.name}</span>
                        <span className="text-ink-500">{money(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  {o.notes && (
                    <div className="mt-2 border-t border-ink-200/60 pt-1 text-[11px] italic text-amber-800">
                      <strong>Customer note:</strong> {o.notes}
                    </div>
                  )}
                </div>

                {/* Financials & Status actions */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-ink-900">{money(o.total)}</span>
                    <span className="text-xs text-ink-500">
                      (Net payout: <strong className="text-emerald-700">{money(o.restaurant_payout)}</strong>)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {o.status === 'placed' && (
                      <button
                        disabled={actionBusy}
                        onClick={() => setDeclineTarget(o)}
                        className="btn-ghost text-xs text-rose-600 hover:bg-rose-50"
                      >
                        Decline
                      </button>
                    )}
                    {(NEXT[o.status] || []).filter(([to]) => to !== 'cancelled').map(([to, label, cls]) => (
                      <button
                        key={to}
                        disabled={actionBusy}
                        onClick={() => move(o, to)}
                        className={`text-xs ${cls}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DETAILED ORDER MODAL */}
      {selectedOrder && (
        <Modal title={`Order #${selectedOrder.id.slice(0, 8).toUpperCase()}`} onClose={() => setSelectedOrder(null)}>
          <div className="space-y-4">
            {/* Status & Timestamps */}
            <div className="flex items-center justify-between rounded-lg bg-ink-50 p-3">
              <div>
                <span className="text-xs text-ink-500">Status</span>
                <div className="mt-0.5 flex gap-1.5">
                  <Badge status={selectedOrder.status} />
                  <Badge status={selectedOrder.payment_status} />
                </div>
              </div>
              <div className="text-right text-xs text-ink-500">
                <p>Placed at: {when(selectedOrder.created_at)}</p>
                <p>Last updated: {when(selectedOrder.updated_at)}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="rounded-lg border border-ink-200 p-3 text-sm">
              <h3 className="font-bold text-ink-900 mb-1.5 flex items-center gap-1.5">
                <User className="h-4 w-4 text-ink-500" /> Customer Information
              </h3>
              <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
              <p>
                <strong>Phone:</strong>{' '}
                <a href={`tel:${selectedOrder.delivery_phone}`} className="text-brand-600 hover:underline">
                  {selectedOrder.delivery_phone}
                </a>
              </p>
              <p className="mt-1 flex items-start gap-1">
                <strong className="shrink-0">Address:</strong>
                <span>{selectedOrder.delivery_address}</span>
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedOrder.delivery_address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> View in Google Maps
              </a>
            </div>

            {/* Rider Information */}
            <div className="rounded-lg border border-ink-200 p-3 text-sm">
              <h3 className="font-bold text-ink-900 mb-1.5 flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-ink-500" /> Delivery Rider
              </h3>
              {selectedOrder.rider_name ? (
                <div className="space-y-0.5">
                  <p><strong>Rider:</strong> {selectedOrder.rider_name}</p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${selectedOrder.rider_phone}`} className="text-brand-600 hover:underline">
                      {selectedOrder.rider_phone}
                    </a>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-ink-500 italic">No rider has claimed this order yet.</p>
              )}
            </div>

            {/* Itemized Order Breakdown */}
            <div className="rounded-lg border border-ink-200 p-3 text-sm">
              <h3 className="font-bold text-ink-900 mb-2 flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-ink-500" /> Ordered Dishes
              </h3>
              <div className="divide-y divide-ink-100">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1.5">
                    <div>
                      <span className="font-semibold">{item.quantity}×</span> {item.name}
                    </div>
                    <span className="font-medium text-ink-900">{money(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {selectedOrder.notes && (
                <div className="mt-3 rounded bg-amber-50 p-2 text-xs text-amber-900">
                  <strong>Special Kitchen Instructions:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Bill & Payout Breakdown */}
            <div className="rounded-lg bg-ink-50 p-3 text-sm space-y-1">
              <div className="flex justify-between text-ink-600">
                <span>Food Subtotal:</span>
                <span>{money(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>Delivery Fee (to rider):</span>
                <span>{money(selectedOrder.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>Platform Commission:</span>
                <span className="text-rose-600">-{money(selectedOrder.commission_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-1.5 font-bold text-base text-ink-900">
                <span>Customer Total:</span>
                <span>{money(selectedOrder.total)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-ink-200 pt-1.5 font-bold text-emerald-700">
                <span>Your Net Payout:</span>
                <span>{money(selectedOrder.restaurant_payout)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => printTicket(selectedOrder)}
                className="btn-ghost text-xs inline-flex items-center gap-1"
              >
                <Printer className="h-4 w-4" /> Print Kitchen Ticket
              </button>

              <div className="flex gap-2">
                {selectedOrder.status === 'placed' && (
                  <button
                    disabled={actionBusy}
                    onClick={() => {
                      setDeclineTarget(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="btn-ghost text-xs text-rose-600"
                  >
                    Decline
                  </button>
                )}
                {(NEXT[selectedOrder.status] || []).filter(([to]) => to !== 'cancelled').map(([to, label, cls]) => (
                  <button
                    key={to}
                    disabled={actionBusy}
                    onClick={() => move(selectedOrder, to)}
                    className={`text-xs ${cls}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* DECLINE ORDER CONFIRMATION MODAL */}
      {declineTarget && (
        <Modal title={`Decline Order #${declineTarget.id.slice(0, 8).toUpperCase()}`} onClose={() => setDeclineTarget(null)}>
          <form onSubmit={handleDeclineSubmit} className="space-y-4">
            <p className="text-sm text-ink-700">
              Are you sure you want to decline this order? The customer's payment will be automatically queued for refund.
            </p>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1">
                Reason for declining (sent to customer)
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Item out of stock, Kitchen closing early..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setDeclineTarget(null)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionBusy}
                className="btn-primary bg-rose-600 hover:bg-rose-700 text-white"
              >
                {actionBusy ? 'Declining...' : 'Confirm Decline & Refund'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Compact Kitchen Order Card for KDS
function OrderCard({ order, actions, onOpen, onPrint }) {
  const elapsedMinutes = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3 shadow-xs hover:border-brand-400 transition-all">
      <div className="flex items-start justify-between gap-1">
        <div>
          <button
            onClick={onOpen}
            className="font-bold text-sm text-ink-900 hover:text-brand-600 hover:underline"
          >
            #{order.id.slice(0, 8).toUpperCase()}
          </button>
          <p className="text-xs text-ink-500">{order.customer_name}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold ${
            elapsedMinutes > 30 ? 'bg-rose-100 text-rose-800' : 'bg-ink-100 text-ink-700'
          }`}>
            <Clock className="h-3 w-3" /> {elapsedMinutes}m ago
          </span>
          <button onClick={onPrint} className="block mt-1 text-ink-400 hover:text-ink-700 ml-auto" title="Print ticket">
            <Printer className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs space-y-1 border-t border-ink-100 pt-2">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between font-medium text-ink-800">
            <span>{item.quantity}× {item.name}</span>
          </div>
        ))}
      </div>

      {order.notes && (
        <p className="mt-2 rounded bg-amber-50 p-1.5 text-[11px] italic text-amber-900">
          "{order.notes}"
        </p>
      )}

      <div className="mt-2.5 pt-2 border-t border-ink-100 flex items-center justify-between">
        <span className="font-bold text-xs text-ink-900">{money(order.total)}</span>
        <span className="text-[11px] text-ink-500 truncate max-w-[120px]">{order.delivery_address}</span>
      </div>

      {actions && <div className="mt-2">{actions}</div>}
    </div>
  );
}
