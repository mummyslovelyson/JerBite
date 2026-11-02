import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, Eye, ShieldAlert, CheckCircle2, XCircle, SlidersHorizontal, RefreshCw } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function AllRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [err, setErr] = useState('');

  // Review modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRest, setSelectedRest] = useState(null);
  const [actionType, setActionType] = useState('approve'); // approve, reject, suspend
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/restaurants?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setRestaurants(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const openReviewModal = (r, action) => {
    setSelectedRest(r);
    setActionType(action);
    setReviewNote('');
    setModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if ((actionType === 'reject' || actionType === 'suspend') && !reviewNote.trim()) {
      alert('Please provide a reason');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/admin/restaurants/${selectedRest.id}/review`, {
        action: actionType,
        note: reviewNote.trim()
      });
      setModalOpen(false);
      load();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Restaurants"
        sub="Full directory of all registered, approved, and suspended restaurant partners"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Search and Filters Bar */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search by restaurant name, owner, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-ink-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {err && <ErrorNote message={err} />}

      {/* Restaurants Table */}
      {loading ? (
        <Spinner />
      ) : restaurants.length === 0 ? (
        <div className="card p-12 text-center">
          <Store className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No restaurants found</h3>
          <p className="text-xs text-ink-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Restaurant</th>
                  <th className="px-4 py-3.5">Owner & Contact</th>
                  <th className="px-4 py-3.5">Cuisine</th>
                  <th className="px-4 py-3.5 text-center">Products</th>
                  <th className="px-4 py-3.5 text-center">Rating</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 font-bold">
                          {r.name[0]}
                        </div>
                        <div>
                          <p className="truncate max-w-[200px]">{r.name}</p>
                          <p className="text-[10px] text-ink-400 font-normal truncate max-w-[200px]">{r.address || 'No address'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      <p className="font-semibold text-ink-900">{r.owner_name}</p>
                      <p className="text-[11px] text-ink-500">{r.owner_email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-700 font-medium">
                      {r.cuisine || 'Various'}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-ink-900">
                      {r.product_count}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-amber-600">
                      ★ {r.rating || '5.0'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/restaurants/details?id=${r.id}`}
                          className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                        >
                          <Eye className="h-3 w-3" /> View
                        </Link>

                        {r.status === 'pending' && (
                          <button
                            onClick={() => openReviewModal(r, 'approve')}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                          >
                            Approve
                          </button>
                        )}

                        {r.status === 'approved' && (
                          <button
                            onClick={() => openReviewModal(r, 'suspend')}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
                          >
                            Suspend
                          </button>
                        )}

                        {r.status === 'suspended' && (
                          <button
                            onClick={() => openReviewModal(r, 'activate')}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                          >
                            Reinstate
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

      {/* Review Modal */}
      {modalOpen && (
        <Modal
          title={`${actionType === 'approve' ? 'Approve' : actionType === 'suspend' ? 'Suspend' : 'Reject'} ${selectedRest?.name}`}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <p className="text-xs text-ink-600">
              {actionType === 'approve'
                ? `Approving this restaurant will make its profile live and notify ${selectedRest?.owner_name}.`
                : actionType === 'suspend'
                ? `Suspending this restaurant will temporarily disable its menu and hide it from diners.`
                : `Rejecting this application will inform the owner with your review reason.`}
            </p>

            <Field
              label="Review Reason / Auditor Note"
              hint={actionType !== 'approve' ? 'Required for record keeping and email notice' : 'Optional internal note'}
            >
              <textarea
                rows={3}
                required={actionType !== 'approve'}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Enter feedback or administrative reason..."
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
                  actionType === 'suspend' || actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {submitting ? 'Recording...' : `Confirm ${actionType.toUpperCase()}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
