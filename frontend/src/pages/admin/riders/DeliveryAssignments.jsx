import { useState } from 'react';
import { Bike, MapPin, Clock, Package, RefreshCw, CheckCircle2 } from 'lucide-react';
import useApi from '../../../hooks/useApi';
import { Spinner, PageHeader, Badge, money, ErrorNote } from '../../../components/ui';

export default function DeliveryAssignments() {
  const { data: riders, loading: loadingRiders, error: errorRiders, execute: refetchRiders } = useApi('/admin/riders', { status: 'approved' });
  const { data: readyOrders, loading: loadingReady, error: errorReady, execute: refetchReady } = useApi('/admin/orders', { status: 'ready' });
  const { data: activeDeliveries, loading: loadingActive, error: errorActive, execute: refetchActive } = useApi('/admin/orders', { status: 'picked_up' });

  const refreshAll = () => {
    refetchRiders();
    refetchReady();
    refetchActive();
  };

  if (loadingRiders || loadingReady || loadingActive) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Assignments"
        sub="Dispatch queue monitoring: pending order handoffs, courier allocation, and live in-transit tracking"
      >
        <button
          onClick={refreshAll}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Dispatch
        </button>
      </PageHeader>

      {(errorRiders || errorReady || errorActive) && (
        <ErrorNote message={errorRiders || errorReady || errorActive} />
      )}

      {/* Grid: Awaiting Pickup & Active Deliveries */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Awaiting Rider Pickup */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <h3 className="font-extrabold text-sm text-ink-950 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-600" /> Orders Ready For Pickup ({readyOrders?.length || 0})
            </h3>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Waiting for Rider
            </span>
          </div>

          {!readyOrders?.length ? (
            <p className="text-xs text-ink-500 py-6 text-center">No orders currently waiting for rider pickup.</p>
          ) : (
            <div className="space-y-3">
              {readyOrders.map((o) => (
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
                    <span>Ready at: {new Date(o.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
              <Bike className="h-4 w-4 text-brand-600" /> Active In-Transit Deliveries ({activeDeliveries?.length || 0})
            </h3>
            <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
              Out for Delivery
            </span>
          </div>

          {!activeDeliveries?.length ? (
            <p className="text-xs text-ink-500 py-6 text-center">No couriers currently en route.</p>
          ) : (
            <div className="space-y-3">
              {activeDeliveries.map((o) => (
                <div key={o.id} className="rounded-2xl border border-brand-200 bg-brand-50/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-brand-700">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <Badge status={o.status} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-ink-900">Courier: {o.rider_name || 'Assigned Courier'}</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-3 py-2.5">Rider</th>
                  <th className="px-3 py-2.5">Phone</th>
                  <th className="px-3 py-2.5">Vehicle</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-center">Active Jobs</th>
                  <th className="px-3 py-2.5 text-center">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {riders.map((r) => (
                  <tr key={r.user_id} className="hover:bg-ink-50/60">
                    <td className="px-3 py-2 font-bold text-ink-900">{r.name}</td>
                    <td className="px-3 py-2 text-ink-600 font-mono">{r.phone}</td>
                    <td className="px-3 py-2 capitalize font-medium text-ink-700">{r.vehicle_type || 'Motorcycle'}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        r.is_online ? 'bg-emerald-100 text-emerald-800' : 'bg-ink-100 text-ink-600'
                      }`}>
                        {r.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-bold text-brand-700">{r.active_deliveries || 0}</td>
                    <td className="px-3 py-2 text-center font-bold text-ink-900">{r.deliveries || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
