import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bike, CheckCircle2, XCircle, Eye, RefreshCw, Clock, Phone, Mail } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function RiderApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [modal, setModal] = useState({ open: false, rider: null, action: 'approve', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/riders?status=pending');
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
    if (modal.action === 'reject' && !modal.note.trim()) {
      alert('A review reason is required to reject an application');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/admin/riders/${modal.rider.user_id}/review`, {
        action: modal.action,
        note: modal.note.trim()
      });
      setModal({ open: false, rider: null, action: 'approve', note: '' });
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
        title="Rider Applications"
        sub="Incoming driver onboarding requests, driver license submissions, and vehicle registrations"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No pending rider applications</h3>
          <p className="text-xs text-ink-500">All driver onboarding submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <div key={app.user_id} className="card p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black">
                      {app.name ? app.name[0] : 'R'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-ink-900">{app.name}</h4>
                      <p className="text-xs font-semibold text-brand-600 capitalize">{app.vehicle_type || 'Motorcycle'}</p>
                    </div>
                  </div>
                  <Badge status="pending" />
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-ink-600">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-ink-400" /> {app.phone || 'No phone'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-ink-400" /> {app.email}
                  </p>
                  <p className="flex items-center gap-2 text-[11px] text-ink-400">
                    <Clock className="h-3.5 w-3.5" /> Applied {when(app.joined_at)}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-ink-100 flex items-center justify-between">
                <Link
                  to={`/admin/riders/details?id=${app.user_id}`}
                  className="text-xs font-bold text-ink-600 hover:text-ink-900"
                >
                  View Details
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setModal({ open: true, rider: app, action: 'reject', note: '' })}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setModal({ open: true, rider: app, action: 'approve', note: '' })}
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

      {/* Review Dialog */}
      {modal.open && (
        <Modal
          title={`${modal.action === 'approve' ? 'Approve' : 'Reject'} Courier: ${modal.rider?.name}`}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <form onSubmit={handleReview} className="space-y-4">
            <Field label="Review Note" hint={modal.action === 'reject' ? 'Required for applicant' : 'Optional'}>
              <textarea
                rows={3}
                required={modal.action === 'reject'}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Enter feedback..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal({ ...modal, open: false })}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs ${
                  modal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? 'Processing...' : `Confirm ${modal.action.toUpperCase()}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
