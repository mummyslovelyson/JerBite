import { useState } from 'react';
import { Bike, MapPin, Clock, ArrowRight, User, Package, CheckCircle2 } from 'lucide-react';
import useApi from '../../hooks/useApi';
import { Spinner, Empty, ErrorNote, Badge, money } from '../../components/ui';

export default function DeliveryAssignments() {
  const { data: riders, loading: loadingRiders, error: errorRiders } = useApi('/admin/riders', { status: 'approved' });
  const { data: orders, loading: loadingOrders, error: errorOrders } = useApi('/admin/orders', { status: 'ready' });
  const { data: activeDeliveries, loading: loadingActive } = useApi('/admin/orders', { status: 'picked_up' });

  if (loadingRiders || loadingOrders || loadingActive) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-ink-950">Delivery Assignments &amp; Monitoring</h1>
        <p className="text-xs text-ink-500">Live view of dispatched deliveries, rider fleet capacity, and awaiting orders</p>
      </div>

      {/* Grid: Awaiting Pickup & Active Deliveries */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Awaiting Rider Pickup */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <h3 className="font-extrabold text-sm text-ink-950 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-600" /> Orders Ready For Pickup ({orders?.length || 0})
            </h3>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Waiting for Rider
            </span>
          </div>

          {!orders?.length ? (
            <p className="text-xs text-ink-500">No orders currently waiting for rider pickup.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-ink-200 bg-ink-50/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-brand-700">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="font-extrabold text-xs text-ink-900">{money(o.total)}</span>
                  </div>
                  <p className="font-bold text-xs text-ink-900">{o.restaurant_name}</p>
                  <p className="text-xs text-ink-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                    <span className="truncate">{o.delivery_address}</span>
                  </p>
                  <div className="pt-2 border-t border-ink-200/60 flex items-center justify-between text-[11px] text-ink-600">
                    <span>Prep: {new Date(o.updated_at).toLocaleTimeString()}</span>
                    <span className="font-bold text-emerald-700">Delivery Fee: {money(o.delivery_fee)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* In-Transit Deliveries */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <h3 className="font-extrabold text-sm text-ink-950 flex items-center gap-2">
              <Bike className="h-4 w-4 text-brand-600" /> Active Dispatches ({activeDeliveries?.length || 0})
            </h3>
            <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
              Out for Delivery
            </span>
          </div>

          {!activeDeliveries?.length ? (
            <p className="text-xs text-ink-500">No orders currently en route.</p>
          ) : (
            <div className="space-y-3">
              {activeDeliveries.map((o) => (
                <div key={o.id} className="rounded-2xl border border-brand-200 bg-brand-50/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-brand-700">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <Badge status={o.status} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-ink-900">Rider: {o.rider_name || 'Assigned Courier'}</p>
                    <p className="text-ink-500">From {o.restaurant_name} &rarr; {o.customer_name}</p>
                  </div>
                  <p className="text-xs text-ink-600 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                    <span className="truncate">{o.delivery_address}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Fleet Table */}
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider flex items-center gap-2">
          <Bike className="h-4 w-4 text-brand-600" /> Active Approved Courier Fleet ({riders?.length || 0})
        </h3>
        {!riders?.length ? (
          <p className="text-xs text-ink-500">No approved riders available.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {riders.map((r) => (
              <div key={r.user_id} className="rounded-xl border border-ink-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-xs text-ink-900">{r.name}</p>
                  <span className={`inline-block h-2 w-2 rounded-full ${r.is_available ? 'bg-emerald-500' : 'bg-ink-300'}`} />
                </div>
                <p className="text-[11px] text-ink-500">{r.phone} &bull; {r.vehicle_type} ({r.plate_number})</p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-ink-700">
                  <span>{r.deliveries || 0} completed deliveries</span>
                  <span className="text-brand-700">{r.active_deliveries || 0} active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
