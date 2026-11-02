import { useState, useEffect } from 'react';
import { ShieldCheck, Search, CheckCircle2, RefreshCw, Mail, Phone, AlertCircle } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, ErrorNote } from '../../../components/ui';

export default function CustomerVerification() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/customers?verified=false&search=${encodeURIComponent(search)}`);
      setCustomers(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const manualVerify = async (customer) => {
    if (!confirm(`Are you sure you want to manually verify ${customer.name}'s contact credentials? This action is logged.`)) {
      return;
    }
    setVerifyingId(customer.id);
    try {
      await api.patch(`/admin/customers/${customer.id}/verify`);
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Verification"
        sub="Monitor pending OTP/email verification queues and perform manual identity overrides for customer accounts"
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
              placeholder="Search unverified customers..."
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
      ) : customers.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">All customers verified!</h3>
          <p className="text-xs text-ink-500">There are no unverified accounts requiring administrator attention.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Customer Name</th>
                  <th className="px-4 py-3.5">Email Address</th>
                  <th className="px-4 py-3.5">Phone Number</th>
                  <th className="px-4 py-3.5">Registered</th>
                  <th className="px-4 py-3.5">Email Status</th>
                  <th className="px-4 py-3.5">Phone Status</th>
                  <th className="px-4 py-3.5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">{c.name}</td>
                    <td className="px-4 py-3 text-ink-600">{c.email}</td>
                    <td className="px-4 py-3 text-ink-600">{c.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-ink-500">{when(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.email_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.email_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.phone_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.phone_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => manualVerify(c)}
                        disabled={verifyingId === c.id}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs transition"
                      >
                        {verifyingId === c.id ? 'Verifying...' : 'Manual Verify'}
                      </button>
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
