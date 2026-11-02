import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, CheckCircle, XCircle, Clock, Search, MapPin, Store } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function RestaurantApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  // Modal review state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [action, setAction] = useState('approve');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/restaurants?status=pending&search=${encodeURIComponent(search)}`);
      setApplications(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReview = async (e) => {
    e.preventDefault();
    if (action === 'reject' && !note.trim()) {
      alert('A reason is required to reject an application.');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/admin/restaurants/${activeApp.id}/review`, {
        action,
        note: note.trim()
      });
      setModalOpen(false);
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Applications"
        sub="Review incoming restaurant partnership requests, operational eligibility, and business credentials"
      />

      {/* Filter and Search */}
      <div className="card p-4">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search by restaurant name, owner, or cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
          >
            Search
          </button>
        </form>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">All caught up!</h3>
          <p className="text-xs text-ink-500">There are no pending restaurant applications at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <div key={app.id} className="card p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black">
                      {app.name[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-ink-900">{app.name}</h3>
                      <p className="text-xs text-brand-600 font-semibold">{app.cuisine || 'Cuisine not specified'}</p>
                    </div>
                  </div>
                  <Badge status="pending" />
                </div>

                <div className="mt-4 space-y-2 text-xs text-ink-600">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink-700">Owner:</span>
                    <span>{app.owner_name} ({app.owner_email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                    <span className="truncate">{app.address || 'Location pending'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-ink-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Applied on {when(app.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-ink-100 flex items-center justify-between gap-2">
                <Link
                  to={`/admin/restaurants/details?id=${app.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-ink-700 hover:text-ink-900"
                >
                  <Eye className="h-3.5 w-3.5" /> View Profile
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setActiveApp(app); setAction('reject'); setNote(''); setModalOpen(true); }}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => { setActiveApp(app); setAction('approve'); setNote(''); setModalOpen(true); }}
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      {modalOpen && (
        <Modal
          title={`${action === 'approve' ? 'Approve' : 'Reject'} Application: ${activeApp?.name}`}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleReview} className="space-y-4">
            <p className="text-xs text-ink-600">
              {action === 'approve'
                ? `Confirming approval will grant restaurant manager permissions to ${activeApp?.owner_name} and allow them to upload live menus.`
                : `Please provide a reason why this application is being rejected. The applicant will be notified.`}
            </p>

            <Field label="Decision Reason / Feedback" hint={action === 'reject' ? 'Required' : 'Optional note'}>
              <textarea
                rows={3}
                required={action === 'reject'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write feedback..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs ${
                  action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? 'Processing...' : `Confirm ${action.toUpperCase()}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
