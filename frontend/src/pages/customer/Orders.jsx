import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import OrderList from '../../components/OrderList';
import { Spinner, ErrorNote, PageHeader } from '../../components/ui';

export default function CustomerOrders() {
  const nav = useNavigate();
  const { data, loading, error } = useApi('/orders');
  return (
    <div>
      <PageHeader title="My orders" />
      <ErrorNote message={error} />
      {loading ? <Spinner /> : <OrderList orders={data} show={{ restaurant: true, rider: true }} onOpen={(o) => nav(`/account/orders/${o.id}`)}
        empty="You have not placed any orders yet" actions={(o) => <button className="btn-ghost" onClick={() => nav(`/account/orders/${o.id}`)}>View details</button>} />}
    </div>
  );
}
