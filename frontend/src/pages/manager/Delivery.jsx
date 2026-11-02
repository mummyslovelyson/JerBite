import { useState } from 'react';
import { Bike, Package, MapPin, Clock, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import useApi from '../../hooks/useApi';
import { Spinner, Empty, ErrorNote, Badge, money } from '../../components/ui';

export default function ManagerDelivery() {
  const { data: readyOrders, loading: lReady, error: eReady } = useApi('/manager/orders', { status: 'ready' });
  const { data: inTransit, loading: lTransit, error: eTransit } = useApi('/manager/orders', { status: 'picked_up' });
  const { data: riders, loading: lRiders } = useApi('/manager/delivery/riders');

  if (lReady || lTransit || lRiders) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-ink-950">Delivery &amp; Courier Dispatch</h1>
        <p className="text-xs text-ink-500">Monitor order pickups, out-for-delivery tracking, and available courier capacity</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ready for Pickup */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <h3 className="font-extrabold text-sm text-ink-950 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-600" /> Ready for Pickup ({readyOrders?.length || 0})
            </h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
              Dispatched &bull; Awaiting Rider
            </span>
          </div>

          {!readyOrders?.length ? (
            <p className="text-xs text-ink-500">No packaged orders currently waiting for pickup.</p>
          ) : (
            <div className="space-y-3">
              {readyOrders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-ink-200 bg-ink-50/50 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-brand-700">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="font-extrabold text-ink-950">{money(o.total)}</span>
                  </div>
                  <p className="font-bold text-ink-900">{o.customer_name} &bull; {o.customer_phone}</p>
                  <p className="text-ink-500 flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" /> {o.delivery_address}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* In-Transit Deliveries */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <h3 className="font-extrabold text-sm text-ink-950 flex items-center gap-2">
              <Bike className="h-4 w-4 text-brand-600" /> Out For Delivery ({inTransit?.length || 0})
            </h3>
            <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
              Live Deliveries
            </span>
          </div>

          {!inTransit?.length ? (
            <p className="text-xs text-ink-500">No active deliveries on the road right now.</p>
          ) : (
            <div className="space-y-3">
              {inTransit.map((o) => (
                <div key={o.id} className="rounded-2xl border border-brand-200 bg-brand-50/20 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-brand-700">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <Badge status={o.status} />
                  </div>
                  <p className="font-bold text-ink-900">Rider: {o.rider_name || 'Assigned Courier'}</p>
                  <p className="text-ink-500 flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" /> {o.delivery_address}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Fleet in Area */}
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider flex items-center gap-2">
          <Bike className="h-4 w-4 text-brand-600" /> Available Courier Network Nearby ({riders?.length || 0})
        </h3>
        {!riders?.length ? (
          <p className="text-xs text-ink-500">No active couriers currently registered or available.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {riders.map((r) => (
              <div key={r.id} className="rounded-xl border border-ink-200 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink-900">{r.name}</p>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-ink-500">{r.vehicle_type} ({r.plate_number})</p>
                <div className="pt-2 flex items-center justify-between font-bold text-[11px] text-ink-600">
                  <span>Capacity Status</span>
                  <span className="text-emerald-700">Ready for dispatch</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
