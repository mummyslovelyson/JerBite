import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import OrderList from '../../components/OrderList';
import { ErrorNote, PageHeader, Spinner } from '../../components/ui';

export default function RiderAvailable() {
  const nav = useNavigate();
  const { data, loading, error, reload } = useApi('/rider/available');
  useEffect(() => { const t = setInterval(reload, 15000); return () => clearInterval(t); }, [reload]);
  const accept = async (o) => {
    try { await api.post(`/rider/orders/${o.id}/accept`); toast.success('Delivery accepted'); nav('/rider/deliveries'); }
    catch (e) { toast.error(errMsg(e)); reload(); }
  };
  return (
    <div>
      <PageHeader title="Available deliveries" sub="Orders ready for pickup. Refreshes every 15 seconds." />
      <ErrorNote message={error} />
      {loading && !data ? <Spinner /> : (
        <OrderList orders={data} show={{ pickup: true, address: true, fee: true }} empty="No deliveries waiting right now"
          actions={(o) => <button className="btn-primary" onClick={() => accept(o)}>Accept delivery</button>} />
      )}
    </div>
  );
}
