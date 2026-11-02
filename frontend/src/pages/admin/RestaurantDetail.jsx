import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store, User, Phone, Mail, MapPin, Clock, DollarSign,
  ShieldCheck, AlertCircle, FileText, Check, X, ArrowLeft
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg, assetUrl } from '../../api/client';
import { Spinner, ErrorNote, Badge, money } from '../../components/ui';
import toast from 'react-hot-toast';

export default function RestaurantDetail() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(`/admin/restaurants/${id}`);
  const [reviewAction, setReviewAction] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { restaurant: r, products = [], recentOrders = [], documents = [], changeRequests = [] } = data || {};

  const handleReview = async () => {
    if (!reviewAction) return;
    if ((reviewAction === 'reject' || reviewAction === 'suspend') && !note.trim()) {
      toast.error('Please enter a note explaining the reason.');
      return;
    }
    setBusy(true);
    try {
      await api.patch(`/admin/restaurants/${r.id}/review`, { action: reviewAction, note });
      toast.success(`Restaurant marked as ${reviewAction}d`);
      setReviewAction('');
      setNote('');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/restaurants"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 hover:bg-ink-100 transition shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-ink-950">{r.name}</h1>
              <Badge status={r.status} />
            </div>
            <p className="text-xs text-ink-500">Joined {new Date(r.created_at).toLocaleDateString()} &bull; ID: {r.id}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {r.status !== 'approved' && (
            <button
              onClick={() => { setReviewAction('approve'); }}
              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs"
            >
              Approve Restaurant
            </button>
          )}
          {r.status !== 'rejected' && r.status === 'pending' && (
            <button
              onClick={() => { setReviewAction('reject'); }}
              className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-xs"
            >
              Reject Application
            </button>
          )}
          {r.status === 'approved' && (
            <button
              onClick={() => { setReviewAction('suspend'); }}
              className="rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-xs"
            >
              Suspend Restaurant
            </button>
          )}
          {r.status === 'suspended' && (
            <button
              onClick={() => { setReviewAction('activate'); }}
              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs"
            >
              Reactivate Restaurant
            </button>
          )}
        </div>
      </div>

      {/* Review Dialog if action selected */}
      {reviewAction && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-brand-800">
            Confirm Action: {reviewAction.toUpperCase()}
          </h4>
          <input
            type="text"
            placeholder="Reason or note to manager (required for rejection/suspension)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-ink-300 bg-white px-3 py-2 text-xs text-ink-900"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setReviewAction('')}
              className="rounded-xl border border-ink-300 bg-white px-3 py-1.5 text-xs font-bold text-ink-700"
            >
              Cancel
            </button>
            <button
              disabled={busy}
              onClick={handleReview}
              className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-500"
            >
              {busy ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* Grid: Details & Manager info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Core Info */}
        <div className="card p-5 space-y-4 lg:col-span-2">
          <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider border-b border-ink-100 pb-2">
            Restaurant Details &amp; Operational Info
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-ink-400 block font-medium">Cuisine</span>
              <span className="font-bold text-ink-900">{r.cuisine || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-ink-400 block font-medium">City &amp; Address</span>
              <span className="font-bold text-ink-900">{[r.address, r.city].filter(Boolean).join(', ')}</span>
            </div>
            <div>
              <span className="text-ink-400 block font-medium">Prep Time</span>
              <span className="font-bold text-ink-900">{r.prep_time_minutes} minutes</span>
            </div>
            <div>
              <span className="text-ink-400 block font-medium">Delivery Fee / Min Order</span>
              <span className="font-bold text-ink-900">{money(r.delivery_fee)} / {money(r.min_order)}</span>
            </div>
            <div>
              <span className="text-ink-400 block font-medium">Total Products</span>
              <span className="font-bold text-ink-900">{r.product_count} food items</span>
            </div>
            <div>
              <span className="text-ink-400 block font-medium">Gross Platform Sales</span>
              <span className="font-extrabold text-emerald-700">{money(r.gross_sales)}</span>
            </div>
          </div>

          {r.description && (
            <div className="pt-2 text-xs text-ink-600">
              <span className="font-bold text-ink-900 block mb-1">Description:</span>
              <p className="leading-relaxed bg-ink-50 p-3 rounded-xl">{r.description}</p>
            </div>
          )}
        </div>

        {/* Right Column: Owner & Manager */}
        <div className="card p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider border-b border-ink-100 pb-2">
            Manager Information
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-ink-400 block">Manager Name</span>
              <span className="font-bold text-ink-900 text-sm">{r.owner_name}</span>
            </div>
            <div>
              <span className="text-ink-400 block">Contact Email</span>
              <span className="font-semibold text-ink-800 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-ink-400" /> {r.owner_email}
              </span>
            </div>
            <div>
              <span className="text-ink-400 block">Phone Number</span>
              <span className="font-semibold text-ink-800 flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-ink-400" /> {r.owner_phone}
              </span>
            </div>
            <div>
              <span className="text-ink-400 block">Manager Account Status</span>
              <Badge status={r.owner_status} />
            </div>
          </div>
        </div>
      </div>

      {/* Documents & Verification */}
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-600" /> Verification Documents ({documents.length})
        </h3>
        {!documents.length ? (
          <p className="text-xs text-ink-500">No documents uploaded yet by this restaurant.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {documents.map((d) => (
              <div key={d.id} className="rounded-xl border border-ink-200 bg-ink-50/50 p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-ink-900">{d.document_type}</p>
                  <p className="text-[10px] text-ink-500">{new Date(d.created_at).toLocaleDateString()}</p>
                </div>
                <a
                  href={assetUrl(d.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white border border-ink-200 px-2 py-1 text-[11px] font-bold text-brand-600 hover:bg-brand-50"
                >
                  View File
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu Dishes Snapshot */}
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider">
          Menu Listings ({products.length})
        </h3>
        {!products.length ? (
          <p className="text-xs text-ink-500">No menu items created yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((p) => (
              <div key={p.id} className="rounded-xl border border-ink-200 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-xs text-ink-900 truncate">{p.name}</p>
                    <Badge status={p.status} />
                  </div>
                  <p className="text-xs font-black text-brand-700">{money(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
