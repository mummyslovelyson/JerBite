import { useEffect } from 'react';
import { Bike, DollarSign, PackageCheck, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Stat, Spinner, money } from '../../components/ui';

export default function RiderDashboard() {
  const { rider, refresh } = useAuth();
  const { data, loading, reload } = useApi('/rider/stats');
  useEffect(() => { reload(); }, [reload]);
  const toggle = async () => {
    try { await api.patch('/rider/availability', { isAvailable: !rider.is_available }); await refresh(); toast.success(rider.is_available ? 'You are offline' : 'You are online'); }
    catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <div>
      <PageHeader title="Rider dashboard" sub={rider.is_available ? 'You are online and will be alerted to new deliveries.' : 'You are offline.'}>
        <button className={rider.is_available ? 'btn-ghost' : 'btn-primary'} onClick={toggle}>{rider.is_available ? 'Go offline' : 'Go online'}</button>
      </PageHeader>
      {loading || !data ? <Spinner /> : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Active deliveries" value={data.active} icon={Bike} tone="orange" />
          <Stat label="Completed" value={data.completed} icon={PackageCheck} tone="green" />
          <Stat label="Earned today" value={money(data.today)} icon={Wallet} tone="amber" />
          <Stat label="Total earned" value={money(data.earnings)} icon={DollarSign} hint="Delivery fees from completed trips" tone="green" />
        </div>
      )}
    </div>
  );
}
