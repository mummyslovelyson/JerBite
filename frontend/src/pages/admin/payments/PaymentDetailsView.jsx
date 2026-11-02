import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CreditCard, DollarSign, RefreshCw, Eye, Store, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function PaymentDetailsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentId = searchParams.get('id');

  const [paymentsList, setPaymentsList] = useState([]);
  const [selectedId, setSelectedId] = useState(paymentId || '');
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/admin/payments').then((res) => {
      const rows = res.data.rows || [];
      setPaymentsList(rows);
      if (!selectedId && rows.length > 0) {
        setSelectedId(rows[0].id);
        setSearchParams({ id: rows[0].id });
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedId && paymentsList.length > 0) {
      const match = paymentsList.find(p => p.id === selectedId);
      setPayment(match || null);
      setSearchParams({ id: selectedId });
    }
  }, [selectedId, paymentsList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl text-ink-900">Payment Details</h1>
          <p className="text-xs text-ink-500 mt-0.5">Gateway verification payload, settlement reference, and order links</p>
        </div>

        {/* Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-ink-500">Select Transaction:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-mono font-bold text-ink-800 shadow-2xs max-w-xs truncate"
          >
            {paymentsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.reference} - {p.kind} ({money(p.amount)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {err && <ErrorNote message={err} />}

      {!payment ? (
        <div className="card p-12 text-center text-ink-400">Please select a payment transaction to inspect.</div>
      ) : (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-black text-2xl ${
                  payment.kind === 'refund' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {payment.kind === 'refund' ? <ArrowDownLeft className="h-7 w-7" /> : <ArrowUpRight className="h-7 w-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-black font-mono text-ink-900">{payment.reference}</h2>
                    <Badge status={payment.status} />
                  </div>
                  <p className="text-sm font-extrabold text-brand-600 mt-0.5">{money(payment.amount)} {payment.currency || 'GHS'}</p>
                  <p className="text-xs text-ink-500 mt-1">Processed on {when(payment.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {payment.order_id && (
                  <Link
                    to={`/admin/orders/details?id=${payment.order_id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
                  >
                    View Linked Order
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-ink-100 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-xl bg-ink-50/70 p-3">
                <span className="font-bold text-ink-400 uppercase text-[10px]">Customer</span>
                <p className="font-extrabold text-ink-900 mt-0.5">{payment.customer_name || 'Anonymous'}</p>
              </div>
              <div className="rounded-xl bg-ink-50/70 p-3">
                <span className="font-bold text-ink-400 uppercase text-[10px]">Restaurant Beneficiary</span>
                <p className="font-extrabold text-ink-900 mt-0.5">{payment.restaurant_name || 'N/A'}</p>
              </div>
              <div className="rounded-xl bg-ink-50/70 p-3">
                <span className="font-bold text-ink-400 uppercase text-[10px]">Transaction Type</span>
                <p className="font-extrabold text-ink-900 mt-0.5 capitalize">{payment.kind}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
