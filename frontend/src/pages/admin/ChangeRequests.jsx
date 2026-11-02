import { useState } from 'react';
import { Store, Check, X, Clock, FileText, AlertCircle } from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

export default function ChangeRequests() {
  const [filter, setFilter] = useState('pending');
  const { data, loading, error, reload } = useApi('/admin/restaurant-change-requests', { status: filter });
  const [busyId, setBusyId] = useState(null);
  const [note, setNote] = useState('');

  const handleReview = async (id, action) => {
    setBusyId(id);
    try {
      await api.patch(`/admin/restaurant-change-requests/${id}/review`, { action, note });
      toast.success(`Change request ${action === 'approve' ? 'approved' : 'rejected'}`);
      setNote('');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Restaurant Profile Change Requests</h1>
          <p className="text-xs text-ink-500">Review manager-submitted changes to menus, hours, and store info</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', ''].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filter === s ? 'bg-brand-600 text-white shadow-xs' : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Requests'}
            </button>
          ))}
        </div>
      </div>

      <ErrorNote message={error} />
      {loading ? (
        <Spinner />
      ) : !data?.length ? (
        <Empty title="No change requests found" hint="Requests submitted by restaurant managers will appear here." />
      ) : (
        <div className="grid gap-4">
          {data.map((cr) => (
            <div key={cr.id} className="card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2">
                    <Store className="h-4 w-4 text-brand-600" /> {cr.restaurant_name}
                  </h3>
                  <p className="text-xs text-ink-500">Submitted by: {cr.requester_name} &bull; {new Date(cr.created_at).toLocaleDateString()}</p>
                </div>
                <Badge status={cr.status} />
              </div>

              {cr.reason && (
                <div className="rounded-xl bg-ink-50 p-3 text-xs text-ink-700">
                  <span className="font-bold">Manager Reason:</span> {cr.reason}
                </div>
              )}

              {/* Changes Preview */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Requested Updates</p>
                <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-3 font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(cr.changes, null, 2)}</pre>
                </div>
              </div>

              {cr.status === 'pending' && (
                <div className="pt-3 border-t border-ink-100 flex flex-wrap items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Review note or feedback (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex-1 min-w-[200px] rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-900"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === cr.id}
                      onClick={() => handleReview(cr.id, 'reject')}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                    >
                      Reject
                    </button>
                    <button
                      disabled={busyId === cr.id}
                      onClick={() => handleReview(cr.id, 'approve')}
                      className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-500 transition shadow-xs"
                    >
                      Approve &amp; Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
