import { Link } from 'react-router-dom';
import { User, Store, Bike } from 'lucide-react';

const PORTALS = [
  { id: 'customer', label: 'Customer', icon: User, loginTo: '/login', registerTo: '/register' },
  { id: 'manager', label: 'Partner', icon: Store, loginTo: '/manager/login', registerTo: '/manager/register' },
  { id: 'rider', label: 'Rider', icon: Bike, loginTo: '/rider/login', registerTo: '/rider/register' }
];

export default function AuthPortalSwitcher({ current, mode = 'login' }) {
  return (
    <div className="mt-6 pt-4 border-t border-white/15">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 text-center mb-2.5">
        Switch Account Portal
      </p>
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/[0.06] border border-white/10">
        {PORTALS.map((portal) => {
          const Icon = portal.icon;
          const isActive = current === portal.id;
          const targetUrl = mode === 'register' && portal.registerTo ? portal.registerTo : portal.loginTo;

          return (
            <Link
              key={portal.id}
              to={targetUrl}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? 'bg-white text-[#1E0738] shadow-md font-bold scale-[1.02]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-3.5 w-3.5 mb-0.5" />
              <span>{portal.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
