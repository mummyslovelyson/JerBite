import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import { Badge, ErrorNote, Spinner, money, when } from '../../components/ui';

const STEPS = ['placed', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const { data: o, loading, error, reload } = useApi(`/orders/${id}`);
  const [busy, setBusy] = useState(false);
  const verified = useRef(false);

  // Paystack sends the customer back with ?reference=...
  useEffect(() => {
    const ref = params.get('reference') || params.get('trxref');
    if (!ref || verified.current) return;
    verified.current = true;
    api.post('/payments/verify', { reference: ref })
      .then((r) => (r.data.paid ? toast.success('Payment confirmed') : toast.error('We could not confirm your payment yet')))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => { setParams({}, { replace: true }); reload(); });
  }, [params, setParams, reload]);

  // light polling so status changes show up without a refresh
  useEffect(() => {
    if (!o || ['delivered', 'cancelled'].includes(o.status)) return;
    const t = setInterval(reload, 20000);
    return () => clearInterval(t);
  }, [o, reload]);

  const pay = async () => {
    setBusy(true);
    try { const { data } = await api.post(`/orders/${id}/pay`); window.location.href = data.paymentUrl; }
    catch (e) { toast.error(errMsg(e)); setBusy(false); }
  };
  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try { await api.post(`/orders/${id}/cancel`); toast.success('Order cancelled'); reload(); } catch (e) { toast.error(errMsg(e)); }
  };

  if (loading && !o) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  const at = STEPS.indexOf(o.status);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <button onClick={() => nav('/account/orders')} className="text-sm font-semibold text-brand-700">Back to orders</button>
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h1 className="text-xl font-bold">Order #{o.id.slice(0, 8).toUpperCase()}</h1><p className="text-sm text-ink-500">{o.restaurant_name} · {when(o.created_at)}</p></div>
          <div className="flex gap-1.5"><Badge status={o.status} /><Badge status={o.payment_status} /></div>
        </div>
        {o.status !== 'cancelled' && o.status !== 'pending_payment' && (
          <ol className="mt-5 grid grid-cols-6 gap-1 text-center text-[11px] font-semibold">
            {STEPS.map((s, i) => (
              <li key={s}><div className={`mb-1 h-1.5 rounded-full ${i <= at ? 'bg-brand-600' : 'bg-ink-200'}`} /><span className={i <= at ? 'text-ink-900' : 'text-ink-500'}>{s.replace('_', ' ')}</span></li>
            ))}
          </ol>
        )}
        {o.rider_name && <p className="mt-4 text-sm">Your rider is <b>{o.rider_name}</b> ({o.rider_phone}).</p>}
      </div>

      {o.rider_lat && o.rider_lng && (() => {
        const lat = Number(o.rider_lat), lng = Number(o.rider_lng), d = 0.012;
        const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`;
        return (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 pb-2"><h2 className="font-bold">Rider location</h2><p className="text-xs text-ink-500">Updated {when(o.rider_seen_at)}</p></div>
            <iframe title="Rider location" src={src} className="h-64 w-full border-0" loading="lazy" />
            <a className="block p-3 text-sm font-semibold text-brand-700" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}>Open larger map</a>
          </div>
        );
      })()}

      <div className="card p-5">
        <h2 className="mb-2 font-bold">Items</h2>
        <ul className="divide-y divide-ink-100 text-sm">{o.items.map((i, k) => <li key={k} className="flex justify-between py-2"><span>{i.quantity} × {i.name}</span><span>{money(i.price * i.quantity)}</span></li>)}</ul>
        <dl className="mt-3 space-y-1 border-t border-ink-100 pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{money(o.delivery_fee)}</dd></div>
          <div className="flex justify-between font-bold"><dt>Total</dt><dd>{money(o.total)}</dd></div>
        </dl>
        <p className="mt-3 text-sm text-ink-700"><span className="text-ink-500">Delivering to: </span>{o.delivery_address}</p>
      </div>

      <div className="flex gap-2">
        {o.status === 'pending_payment' && <button className="btn-primary" disabled={busy} onClick={pay}>Pay now</button>}
        {['pending_payment', 'placed'].includes(o.status) && <button className="btn-ghost" onClick={cancel}>Cancel order</button>}
      </div>
    </div>
  );
}
