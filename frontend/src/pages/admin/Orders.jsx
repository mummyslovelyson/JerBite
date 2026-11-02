import { useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, RotateCcw } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import OrderList from '../../components/OrderList';
import { ErrorNote, Spinner, Tabs } from '../../components/ui';

export default function AdminOrders() {
  const [tab, setTab] = useState('');
  const params = tab === 'refund_pending' ? { payment: 'refund_pending' } : { status: tab };
  const { data, loading, error, reload } = useApi('/admin/orders', params);

  const refundNow = async (o) => {
    if (!window.confirm(`Refund ${o.total ? `GH₵${o.total}` : 'the full amount'} to the customer through Paystack?`)) return;
    try {
      await api.post(`/admin/orders/${o.id}/refund`);
      toast.success('Refund processed successfully');
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const refundedElsewhere = async (o) => {
    if (!window.confirm('Only do this if you already refunded the customer outside this app. Continue?')) return;
    try {
      await api.patch(`/admin/orders/${o.id}/refunded`);
      toast.success('Marked as refunded');
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div className="w-full space-y-4 pb-16">
      {/* Top Tabs and Action Bar (No redundant heading) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            ['', 'All Orders'],
            ['placed', 'New'],
            ['preparing', 'Preparing'],
            ['ready', 'Ready'],
            ['picked_up', 'On Way'],
            ['delivered', 'Delivered'],
            ['cancelled', 'Cancelled'],
            ['refund_pending', 'Refunds Due']
          ]}
        />

        <button
          onClick={reload}
          className="btn-ghost text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <ErrorNote message={error} />

      {loading ? (
        <Spinner />
      ) : (
        <OrderList
          orders={data}
          show={{ restaurant: true, customer: true, rider: true, payment: true, address: true }}
          empty="No orders found in this view."
          actions={(o) =>
            o.payment_status === 'refund_pending' && (
              <>
                <button
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                  onClick={() => refundNow(o)}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Refund via Paystack
                </button>
                <button
                  className="btn-ghost text-xs py-1.5 px-3 cursor-pointer"
                  onClick={() => refundedElsewhere(o)}
                >
                  Already Refunded
                </button>
              </>
            )
          }
        />
      )}
    </div>
  );
}
