import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function ReportedFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/food/reported');
      setFoods(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const suspendItem = async (f) => {
    if (!confirm(`Take "${f.name}" off the platform?`)) return;
    setUpdatingId(f.id);
    try {
      await api.patch(`/admin/products/${f.id}/status`, { isAvailable: false, status: 'rejected' });
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reported Food Listings"
        sub="Dishes flagged by diners or compliance for hygiene, inaccurate pricing, or food safety discrepancies"
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
      ) : foods.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No reported food listings!</h3>
          <p className="text-xs text-ink-500">All published food items are compliant and unflagged.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {foods.map((f) => (
            <div key={f.id} className="card p-5 border-l-4 border-l-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-ink-900">{f.name}</h3>
                    <Badge status={f.status} />
                    <span className="font-extrabold text-xs text-brand-700">{money(f.price)}</span>
                  </div>
                  <p className="text-xs text-ink-600 mt-0.5">
                    Restaurant: <strong>{f.restaurant_name}</strong> • Category: {f.category_name || 'General'}
                  </p>
                  <p className="text-xs text-amber-800 font-semibold mt-1">
                    Customer flags / reports logged: {f.report_count || 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/food/details?id=${f.id}`}
                  className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                >
                  Inspect Listing
                </Link>
                <button
                  onClick={() => suspendItem(f)}
                  disabled={updatingId === f.id}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
                >
                  {updatingId === f.id ? 'Removing...' : 'Delist & Suspend Item'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
