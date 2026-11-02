import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bike, Search, Eye, RefreshCw, SlidersHorizontal, CheckCircle2, XCircle } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function AllRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [err, setErr] = useState('');

  // Review modal
  const [modal, setModal] = useState({ open: false, rider: null, action: 'approve', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/riders?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setRiders(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (modal.action === 'reject' && !modal.note.trim()) {
      alert('Please specify a reason');
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
        title="All Riders"
        sub="Full courier fleet directory, vehicle specifications, active assignments, and onboarding status"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Filter and Search */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by rider name, phone, or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
          >
            <option value="">All Roster Statuses</option>
            <option value="approved">Approved & Active</option>
            <option value="pending">Pending Approval</option>
            <option value="rejected">Suspended / Rejected</option>
          </select>
          <button
            onClick={load}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
          >
            Filter
          </button>
        </div>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : riders.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <Bike className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No couriers found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Rider</th>
                  <th className="px-4 py-3.5">Vehicle Type</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5 text-center">Deliveries</th>
                  <th className="px-4 py-3.5 text-center">Duty Status</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {riders.map((r) => (
                  <tr key={r.user_id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 font-bold text-sky-700">
                          {r.name ? r.name[0] : 'R'}
                        </div>
                        <div>
                          <p>{r.name}</p>
                          <p className="text-[10px] text-ink-400 font-normal">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-700 capitalize">
                      {r.vehicle_type || 'Motorcycle'}
                    </td>
                    <td className="px-4 py-3 text-ink-600 font-mono">{r.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-center font-extrabold text-ink-900">
                      {r.deliveries || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        r.is_online ? 'bg-emerald-100 text-emerald-800' : 'bg-ink-100 text-ink-600'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${r.is_online ? 'bg-emerald-500' : 'bg-ink-400'}`} />
                        {r.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/riders/details?id=${r.user_id}`}
                          className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                        >
                          Details
                        </Link>
                        {r.status === 'pending' && (
                          <button
                            onClick={() => setModal({ open: true, rider: r, action: 'approve', note: '' })}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                          >
                            Approve
                          </button>
                        )}
                        {r.status === 'approved' && (
                          <button
                            onClick={() => setModal({ open: true, rider: r, action: 'suspend', note: '' })}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {modal.open && (
        <Modal
          title={`${modal.action === 'approve' ? 'Approve' : 'Suspend'} Courier: ${modal.rider?.name}`}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <form onSubmit={handleReview} className="space-y-4">
            <Field label="Audit Reason & Feedback" hint={modal.action !== 'approve' ? 'Required' : 'Optional'}>
              <textarea
                rows={3}
                required={modal.action !== 'approve'}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Enter feedback or administrative note..."
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
                {submitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
