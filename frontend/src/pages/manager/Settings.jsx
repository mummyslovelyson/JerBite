import { Link } from 'react-router-dom';
import { Calendar, Store, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge, PageHeader } from '../../components/ui';
import RestaurantForm from './RestaurantForm';

export default function ManagerSettings() {
  const { restaurant } = useAuth();
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold sm:text-2xl">Restaurant Settings</h1>
            {restaurant?.status && <Badge status={restaurant.status} />}
          </div>
          <p className="text-xs text-ink-500">
            Manage your restaurant profile, address, GPS coordinates, and public branding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/manager/schedule" className="btn-ghost text-xs">
            <Calendar className="h-4 w-4" /> Operating Hours
          </Link>
          <Link to="/manager/finances" className="btn-ghost text-xs">
            <Wallet className="h-4 w-4" /> Payout Settings
          </Link>
        </div>
      </div>

      <RestaurantForm existing={restaurant} />
    </div>
  );
}
