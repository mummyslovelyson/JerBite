import { Outlet, Link } from 'react-router-dom';
import { AlertCircle, Clock, XCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Gate provides notification banners if the restaurant is pending review or rejected,
// while letting the manager navigate and view all pages without getting blocked.
export default function ManagerGate() {
  const { restaurant, refresh } = useAuth();

  return (
    <div className="w-full space-y-4">
      {/* If no restaurant configured yet */}
      {!restaurant && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Restaurant profile setup incomplete</p>
              <p className="text-xs text-amber-800">
                Please complete your business details and location so customers can order.
              </p>
            </div>
          </div>
          <Link to="/manager/settings" className="btn-primary text-xs shrink-0">
            Set Up Restaurant
          </Link>
        </div>
      )}

      {/* If restaurant is pending approval */}
      {restaurant && restaurant.status === 'pending' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-950">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Restaurant awaiting administrator approval</p>
              <p className="text-xs text-blue-800">
                Your restaurant details are currently being reviewed. You can explore your dashboard and manage your menu in the meantime.
              </p>
            </div>
          </div>
          <button onClick={refresh} className="btn-ghost text-xs shrink-0">
            Check Status
          </button>
        </div>
      )}

      {/* If restaurant was rejected */}
      {restaurant && restaurant.status === 'rejected' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-950">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Restaurant profile needs revision</p>
              <p className="text-xs text-rose-800">
                {restaurant.review_note ? `Admin feedback: "${restaurant.review_note}"` : 'Please update your details in Settings to resubmit for review.'}
              </p>
            </div>
          </div>
          <Link to="/manager/settings" className="btn-primary bg-rose-600 hover:bg-rose-700 text-xs shrink-0">
            Update Settings
          </Link>
        </div>
      )}

      {/* Always render child route so all pages on sidebar work cleanly! */}
      <Outlet />
    </div>
  );
}
