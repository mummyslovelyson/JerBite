import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import OrderList from '../../components/OrderList';
import useShareLocation from '../../hooks/useShareLocation';
import { ErrorNote, PageHeader, Spinner, Tabs } from '../../components/ui';

export default function RiderDeliveries() {
  const [tab, setTab] = useState('active');
  const { data, loading, error, reload } = useApi('/rider/orders');
  const move = async (o, status) => {
    try { await api.patch(`/rider/orders/${o.id}/status`, { status }); toast.success(status === 'delivered' ? 'Delivery completed' : 'Marked as picked up'); reload(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const hasActive = (data || []).some((o) => ['ready', 'picked_up'].includes(o.status));
  const share = useShareLocation(hasActive);
  const list = (data || []).filter((o) => (tab === 'active' ? ['ready', 'picked_up'].includes(o.status) : o.status === 'delivered'));
  return (
    <div>
      <PageHeader title="My deliveries" />
      {hasActive && (
        <p className={`mb-3 rounded-lg p-3 text-sm ${share === 'sharing' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
          {share === 'sharing' ? 'Sharing your live location with the customer.'
            : share === 'denied' ? 'Location is blocked. Allow location in your browser so customers can follow your delivery.'
            : share === 'unsupported' ? 'This device cannot share its location.'
            : share === 'error' ? 'Could not send your location. Retrying.' : 'Starting location sharing…'}
        </p>
      )}
      <Tabs value={tab} onChange={setTab} tabs={[['active', 'Active'], ['done', 'Completed']]} />
      <ErrorNote message={error} />
      {loading && !data ? <Spinner /> : (
        <OrderList orders={list} show={{ pickup: true, customer: true, address: true, fee: true }} empty={tab === 'active' ? 'No active deliveries' : 'No completed deliveries yet'}
          actions={(o) => o.status === 'ready' ? <button className="btn-primary" onClick={() => move(o, 'picked_up')}>I have picked it up</button>
            : o.status === 'picked_up' ? <button className="btn-primary" onClick={() => move(o, 'delivered')}>Mark as delivered</button> : null} />
      )}
    </div>
  );
}
