import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, RefreshCw, CheckCircle2, ArrowDownLeft, AlertTriangle } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function RefundRequests() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/orders?payment=refund_pending');
      setOrders(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const triggerGatewayRefund = async (o) => {
    if (!confirm(`Issue electronic gateway refund of ${money(o.total)} for Order #${o.id.slice(0, 8).toUpperCase()}?`)) return;
    setProcessingId(o.id);
    try {
      await api.post(`/admin/orders/${o.id}/refund`);
      alert('Gateway refund issued successfully.');
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setProcessingId(null);
    }
  };

  const markManualRefund = async (o) => {
    if (!confirm(`Mark Order #${o.id.slice(0, 8).toUpperCase()} as refunded via bank transfer/manual cash settlement?`)) return;
    setProcessingId(o.id);
    try {
      await api.patch(`/admin/orders/${o.id}/refunded`);
      alert('Manual refund settlement recorded.');
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refund Requests"
        sub="Orders awaiting financial reimbursement due to cancellations, delivery failures, or mediation disputes"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Queue
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">Zero pending refund requests!</h3>
          <p className="text-xs text-ink-500">All customer refund requests have been settled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card p-5 border-l-4 border-l-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-ink-900">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <Badge status="refund_pending" />
                    <span className="font-extrabold text-sm text-rose-700">{money(o.total)}</span>
                  </div>
                  <p className="text-xs text-ink-600 mt-1">
                    Customer: <strong>{o.customer_name}</strong> • Restaurant: <strong>{o.restaurant_name}</strong>
                  </p>
                  <p className="text-[11px] text-ink-400 mt-0.5">
                    Order Ref: {o.payment_reference || 'N/A'} • Cancelled {when(o.updated_at || o.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => markManualRefund(o)}
                  disabled={processingId === o.id}
                  className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                >
                  Manual Settlement
                </button>
                <button
                  onClick={() => triggerGatewayRefund(o)}
                  disabled={processingId === o.id}
                  className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
                >
                  {processingId === o.id ? 'Processing...' : 'Gateway Refund'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
