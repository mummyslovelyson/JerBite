import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Minus, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Empty, ErrorNote, Field, money } from '../../components/ui';

export default function Cart() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { restaurant, items, setQty, clear, subtotal } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [f, setF] = useState({ address: '', phone: '', notes: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [coords, setCoords] = useState(null);
  const [cfg, setCfg] = useState(null);
  useEffect(() => { api.get('/settings/public').then((r) => setCfg(r.data)).catch(() => {}); }, []);
  const locate = () => {
    if (!navigator.geolocation) return toast.error('Your browser cannot share its location');
    navigator.geolocation.getCurrentPosition(
      (p) => { setCoords({ latitude: p.coords.latitude, longitude: p.coords.longitude }); toast.success('Location added'); },
      () => toast.error('Location permission was denied')
    );
  };

  useEffect(() => {
    if (user?.role !== 'customer') return;
    setF((x) => ({ ...x, phone: user.phone || '' }));
    api.get('/me/addresses').then((r) => setAddresses(r.data)).catch(() => {});
  }, [user]);

  if (!items.length) return <Empty title="Your cart is empty" hint="Pick a restaurant and add something tasty."><Link to="/" className="btn-primary mt-2">Browse restaurants</Link></Empty>;
  const fee = Number(restaurant.delivery_fee);
  const belowMin = subtotal < Number(restaurant.min_order);

  const checkout = async (e) => {
    e.preventDefault();
    if (!user) return nav('/login', { state: { from: '/cart' } });
    if (user.role !== 'customer') return setError('Log in with a customer account to place orders');
    setBusy(true); setError('');
    try {
      const { data } = await api.post('/orders', {
        restaurantId: restaurant.id, items: items.map((i) => ({ productId: i.id, quantity: i.quantity })), ...f, ...(coords || {})
      });
      clear();
      window.location.href = data.paymentUrl; // Paystack checkout
    } catch (err) { setError(errMsg(err)); toast.error(errMsg(err)); setBusy(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="mb-1 text-xl font-bold">Your cart</h1>
        <p className="mb-4 text-sm text-ink-500">From {restaurant.name}</p>
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.id} className="card flex items-center justify-between gap-3 p-3">
              <div className="min-w-0"><p className="truncate font-semibold">{i.name}</p><p className="text-sm text-ink-500">{money(i.price)}</p></div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost p-1.5" onClick={() => setQty(i.id, i.quantity - 1)} aria-label="Remove one">{i.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}</button>
                <span className="w-6 text-center font-semibold">{i.quantity}</span>
                <button className="btn-ghost p-1.5" onClick={() => setQty(i.id, Math.min(i.quantity + 1, 50))} aria-label="Add one"><Plus className="h-4 w-4" /></button>
              </div>
              <p className="w-20 text-right font-bold">{money(i.price * i.quantity)}</p>
            </div>
          ))}
        </div>
        <button onClick={clear} className="mt-3 text-sm font-semibold text-red-600">Empty cart</button>
      </div>

      <form onSubmit={checkout} className="card h-fit space-y-4 p-5">
        <h2 className="font-bold">Delivery details</h2>
        {addresses.length > 0 && (
          <Field label="Saved addresses">
            <select className="input" value="" onChange={(e) => { const a = addresses.find((x) => x.id === e.target.value); if (a) setF({ ...f, address: `${a.address}${a.city ? ', ' + a.city : ''}` }); }}>
              <option value="">Choose a saved address</option>
              {addresses.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </Field>
        )}
        <Field label="Delivery address"><textarea className="input min-h-20" required value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Street, landmark, area" /></Field>
        <Field label="Phone for the rider" type="tel" required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Enter a reachable phone number" />
        <div>
          <button type="button" className="btn-ghost w-full" onClick={locate}><MapPin className="h-4 w-4" />{coords ? 'Location added. Update it' : 'Use my current location'}</button>
          <p className="mt-1 text-xs text-ink-500">Some restaurants only deliver within {cfg?.deliveryRadiusKm ?? '…'} km, so we may need your location.</p>
        </div>
        {cfg?.platformOpen === false && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Ordering is paused right now. Please try again later.</p>}
        <Field label="Note for the restaurant (optional)"><textarea className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Allergies, spice level, gate instructions" /></Field>
        <dl className="space-y-1 border-t border-ink-100 pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{money(fee)}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{money(subtotal + fee)}</dd></div>
        </dl>
        {belowMin && <p className="text-sm text-amber-700">Minimum order is {money(restaurant.min_order)}.</p>}
        <ErrorNote message={error} />
        <button className="btn-primary w-full" disabled={busy || belowMin || cfg?.platformOpen === false}>{busy ? 'Redirecting to payment…' : user ? 'Place order and pay' : 'Log in to order'}</button>
      </form>
    </div>
  );
}
