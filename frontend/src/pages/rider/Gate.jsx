import { Outlet } from 'react-router-dom';
import { Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RiderGate() {
  const { rider, refresh } = useAuth();
  if (rider?.status === 'approved') return <Outlet />;
  const rejected = rider?.status === 'rejected';
  return (
    <div className="card mx-auto flex max-w-xl gap-4 p-5">
      {rejected ? <XCircle className="h-6 w-6 shrink-0 text-red-600" /> : <Clock className="h-6 w-6 shrink-0 text-amber-600" />}
      <div>
        <h1 className="text-lg font-bold">{rejected ? 'Application not approved' : 'Waiting for admin approval'}</h1>
        <p className="mt-1 text-sm text-ink-700">{rejected ? 'An admin reviewed your rider application and did not approve it.' : 'We will email and text you once an admin approves your rider account.'}</p>
        {rider?.review_note && <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">Reason: {rider.review_note}</p>}
        <button onClick={refresh} className="btn-ghost mt-3">Check status</button>
      </div>
    </div>
  );
}
