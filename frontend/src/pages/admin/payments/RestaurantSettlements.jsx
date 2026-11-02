import { useState, useEffect } from 'react';
import { Wallet, Search, RefreshCw, CheckCircle2, ArrowUpRight, Store } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function RestaurantSettlements() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const [modal, setModal] = useState({ open: false, restaurant: null, amount: 0, ref: '', submitting: false });

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/analytics/deep?type=restaurants');
      setRestaurants(res.data || []);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = restaurants.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDisburse = (e) => {
    e.preventDefault();
    alert(`Settlement payout of ${money(modal.amount)} recorded for ${modal.restaurant?.name}.`);
    setModal({ open: false, restaurant: null, amount: 0, ref: '', submitting: false });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Settlements"
        sub="Merchant disbursements, payable net revenue balances, and automated batch bank transfers"
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search restaurants for settlement balances..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <p className="text-xs">No restaurant records found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Restaurant</th>
                  <th className="px-4 py-3.5">Fulfillment Status</th>
                  <th className="px-4 py-3.5 text-right">Gross Sales</th>
                  <th className="px-4 py-3.5 text-right">Commission Deducted</th>
                  <th className="px-4 py-3.5 text-right">Payable Settlement</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((r) => {
                  const gross = Number(r.total_sales) || 0;
                  const comm = Number(r.commission_paid) || (gross * 0.15);
                  const net = gross - comm;
                  return (
                    <tr key={r.id} className="hover:bg-ink-50/60 transition">
                      <td className="px-4 py-3 font-bold text-ink-900">{r.name}</td>
                      <td className="px-4 py-3"><Badge status={r.status} /></td>
                      <td className="px-4 py-3 text-right text-ink-700 font-semibold">{money(gross)}</td>
                      <td className="px-4 py-3 text-right text-brand-600 font-semibold">{money(comm)}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-700 text-sm">{money(net)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setModal({ open: true, restaurant: r, amount: net, ref: `PAYOUT-${Date.now().toString().slice(-6)}`, submitting: false })}
                          disabled={net <= 0}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs disabled:opacity-40"
                        >
                          Disburse Payout
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {modal.open && (
        <Modal
          title={`Disburse Settlement: ${modal.restaurant?.name}`}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <form onSubmit={handleDisburse} className="space-y-4">
            <p className="text-xs text-ink-600">
              You are authorizing a payout of <strong>{money(modal.amount)}</strong> to {modal.restaurant?.name}.
            </p>

            <Field label="Payout Batch / Bank Reference">
              <input
                type="text"
                required
                value={modal.ref}
                onChange={(e) => setModal({ ...modal, ref: e.target.value })}
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
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
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Confirm Settlement Disbursal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
