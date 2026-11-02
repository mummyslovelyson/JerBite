import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Search, Eye, RefreshCw, SlidersHorizontal, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, Stat, ErrorNote } from '../../../components/ui';

export default function AllTransactions() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/payments?kind=${kindFilter}&status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setPayments(res.data.rows || []);
      setSummary(res.data.summary || {});
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [kindFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Transactions"
        sub="Comprehensive ledger of payment gateway authorizations, customer charges, and issued refunds"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total Collected" value={money(summary.collected || 0)} hint="Successful charges" icon={ArrowUpRight} tone="green" />
        <Stat label="Total Refunded" value={money(summary.refunded || 0)} hint="Processed reimbursements" icon={ArrowDownLeft} tone="amber" />
        <Stat label="Failed Charges" value={summary.failed || 0} hint="Failed transactions" icon={CreditCard} tone="red" />
      </div>

      {/* Filters and Search */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by transaction reference or restaurant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
          >
            <option value="">All Transaction Types</option>
            <option value="charge">Customer Charges</option>
            <option value="refund">Refunds</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
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
      ) : payments.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CreditCard className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No transactions recorded</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Reference</th>
                  <th className="px-4 py-3.5">Customer & Restaurant</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-ink-900">
                      <Link to={`/admin/payments/details?id=${p.id}`} className="hover:underline text-brand-600">
                        {p.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-ink-900">{p.customer_name}</p>
                      <p className="text-[10px] text-ink-400 font-normal">{p.restaurant_name}</p>
                    </td>
                    <td className="px-4 py-3 capitalize font-bold text-ink-700">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] ${
                        p.kind === 'refund' ? 'bg-amber-100 text-amber-800' : 'bg-ink-100 text-ink-700'
                      }`}>
                        {p.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{when(p.created_at)}</td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    <td className="px-4 py-3 text-right font-extrabold text-ink-900">
                      {p.kind === 'refund' ? `-${money(p.amount)}` : money(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/payments/details?id=${p.id}`}
                        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
