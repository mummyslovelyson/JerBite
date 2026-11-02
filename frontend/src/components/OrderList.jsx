import { Badge, Empty, money, when } from './ui';

// Shared order cards for customer, manager, rider and admin views.
// `actions(order)` returns buttons for the order; `show` toggles extra columns.
export default function OrderList({ orders, actions, show = {}, empty = 'No orders yet', onOpen }) {
  if (!orders?.length) return <Empty title={empty} />;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <button onClick={() => onOpen?.(o)} className={`font-bold ${onOpen ? 'hover:underline' : 'cursor-default'}`}>#{o.id.slice(0, 8).toUpperCase()}</button>
              <p className="text-xs text-ink-500">{when(o.created_at)}</p>
            </div>
            <div className="flex gap-1.5"><Badge status={o.status} />{show.payment && <Badge status={o.payment_status} />}</div>
          </div>
          <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {show.restaurant && <p><span className="text-ink-500">Restaurant: </span>{o.restaurant_name}</p>}
            {show.customer && <p><span className="text-ink-500">Customer: </span>{o.customer_name} · {o.delivery_phone}</p>}
            {show.rider && <p><span className="text-ink-500">Rider: </span>{o.rider_name || 'Not assigned yet'}</p>}
            {show.address && <p className="sm:col-span-2"><span className="text-ink-500">Deliver to: </span>{o.delivery_address}</p>}
            {show.pickup && <p className="sm:col-span-2"><span className="text-ink-500">Pick up from: </span>{o.restaurant_name}, {o.restaurant_address}</p>}
          </div>
          <ul className="mt-2 text-sm text-ink-700">
            {o.items.map((i, k) => <li key={k}>{i.quantity} × {i.name}</li>)}
          </ul>
          {o.notes && <p className="mt-1 text-sm italic text-ink-500">Note: {o.notes}</p>}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
            <p className="font-bold">{money(show.fee ? o.delivery_fee : o.total)}{show.fee && <span className="ml-1 text-xs font-normal text-ink-500">delivery fee</span>}</p>
            <div className="flex flex-wrap gap-2">{actions?.(o)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
