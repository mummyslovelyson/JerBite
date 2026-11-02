import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, RefreshCw, CheckCircle2, Eye, Search, AlertTriangle } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function SuspendedRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const [modal, setModal] = useState({ open: false, restaurant: null, note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/restaurants?status=suspended&search=${encodeURIComponent(search)}`);
      setRestaurants(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReinstate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/admin/restaurants/${modal.restaurant.id}/review`, {
        action: 'activate',
        note: modal.note.trim() || 'Reinstated by administrator'
      });
      setModal({ open: false, restaurant: null, note: '' });
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
        title="Suspended Restaurants"
        sub="Restaurants whose operations or listings are currently paused due to compliance, payment, or operational flags"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Search */}
      <div className="card p-4">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search suspended restaurants..."
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
      ) : restaurants.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No suspended restaurants!</h3>
          <p className="text-xs text-ink-500">All registered restaurant partners are currently in good standing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r) => (
            <div key={r.id} className="card p-5 border-l-4 border-l-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-black">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-ink-900">{r.name}</h3>
                    <Badge status="suspended" />
                  </div>
                  <p className="text-xs text-ink-600 mt-0.5">
                    Owner: <strong>{r.owner_name}</strong> ({r.owner_email})
                  </p>
                  {r.review_note && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Suspension Reason: {r.review_note}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/restaurants/details?id=${r.id}`}
                  className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                >
                  Inspect
                </Link>
                <button
                  onClick={() => setModal({ open: true, restaurant: r, note: '' })}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" /> Reinstate Restaurant
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reinstate Modal */}
      {modal.open && (
        <Modal
          title={`Reinstate ${modal.restaurant?.name}`}
          onClose={() => setModal({ open: false, restaurant: null, note: '' })}
        >
          <form onSubmit={handleReinstate} className="space-y-4">
            <p className="text-xs text-ink-600">
              Reinstating this restaurant will change its status back to <strong>Approved</strong>, allow the restaurant manager to open the store, and display their menu to diners.
            </p>

            <Field label="Reinstatement Note / Resolution Details">
              <textarea
                rows={3}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Document why this restaurant is being reinstated..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal({ open: false, restaurant: null, note: '' })}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {submitting ? 'Reinstating...' : 'Confirm Reinstatement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
