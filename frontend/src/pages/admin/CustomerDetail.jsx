import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users, Mail, Phone, Calendar, ArrowLeft,
  ShoppingBag, ShieldAlert, CheckCircle2, MapPin, LifeBuoy
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, ErrorNote, Badge, money } from '../../components/ui';
import toast from 'react-hot-toast';

export default function CustomerDetail() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(`/admin/customers/${id}`);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { customer: c, orders = [], tickets = [], addresses = [] } = data || {};

  const toggleStatus = async () => {
    const nextStatus = c.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to mark this customer as ${nextStatus}?`)) return;
    try {
      await api.patch(`/admin/customers/${c.id}/status`, { status: nextStatus });
      toast.success(`Customer status updated to ${nextStatus}`);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 hover:bg-ink-100 transition shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-ink-950">{c.name}</h1>
              <Badge status={c.status} />
            </div>
            <p className="text-xs text-ink-500">Customer ID: {c.id}</p>
          </div>
        </div>

        <button
          onClick={toggleStatus}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
            c.status === 'active'
              ? 'border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'
              : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          {c.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
        </button>
      </div>

      {/* Grid: Profile & Addresses */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider border-b border-ink-100 pb-2">
            Profile &amp; Verification
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-ink-400 block">Email Address</span>
              <span className="font-semibold text-ink-900 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-ink-400" /> {c.email}
              </span>
            </div>
            <div>
              <span className="text-ink-400 block">Phone Number</span>
              <span className="font-semibold text-ink-900 flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-ink-400" /> {c.phone}
              </span>
            </div>
            <div>
              <span className="text-ink-400 block">Registration Date</span>
              <span className="font-semibold text-ink-900 flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-ink-400" /> {new Date(c.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-ink-400 block">Contact Verification</span>
              <span className={`inline-block mt-1 font-bold text-xs ${c.email_verified ? 'text-emerald-700' : 'text-amber-700'}`}>
                {c.email_verified ? '✓ Email & Phone Verified' : '⚠ Unverified'}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4 lg:col-span-2">
          <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider border-b border-ink-100 pb-2">
            Saved Delivery Addresses ({addresses.length})
          </h3>
          {!addresses.length ? (
            <p className="text-xs text-ink-500">No saved addresses on file.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => (
                <div key={a.id} className="rounded-xl border border-ink-200 bg-ink-50/50 p-3 text-xs">
                  <span className="font-bold text-ink-950 flex items-center gap-1.5 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-600" /> {a.label}
                  </span>
                  <p className="text-ink-600">{a.address}</p>
                  {a.city && <p className="text-ink-400 text-[11px]">{a.city}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Orders History */}
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-brand-600" /> Order History ({orders.length})
        </h3>
        {!orders.length ? (
          <p className="text-xs text-ink-500">This customer has not placed any orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Restaurant</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Payment</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-mono font-bold text-brand-700">
                      <Link to={`/admin/orders/${o.id}`}>#{o.id.slice(0, 8).toUpperCase()}</Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-900">{o.restaurant_name}</td>
                    <td className="px-4 py-3 text-ink-500">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Badge status={o.status} /></td>
                    <td className="px-4 py-3"><Badge status={o.payment_status} /></td>
                    <td className="px-4 py-3 text-right font-extrabold text-ink-950">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Support Issues */}
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider flex items-center gap-2">
          <LifeBuoy className="h-4 w-4 text-brand-600" /> Support Issues &amp; Complaints ({tickets.length})
        </h3>
        {!tickets.length ? (
          <p className="text-xs text-ink-500">No support tickets reported by this customer.</p>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-xl border border-ink-200 p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink-900">{t.ticket_number}</span>
                    <Badge status={t.status} />
                  </div>
                  <p className="font-bold text-xs text-ink-800 mt-1">{t.subject}</p>
                </div>
                <Link
                  to={`/admin/support/tickets/${t.id}`}
                  className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50"
                >
                  View Ticket
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
