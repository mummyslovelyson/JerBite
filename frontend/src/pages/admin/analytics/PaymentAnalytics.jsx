import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, Spinner, PageHeader, Stat, ErrorNote } from '../../../components/ui';

export default function PaymentAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/analytics/deep?type=payments&days=${days}`);
      setData(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [days]);

  if (loading && !data) return <Spinner />;

  const gatewayStats = data?.gatewayStats || [];
  const methodShare = data?.methodShare || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Analytics"
        sub="Payment gateway performance, success rates, failure analysis, and payment channel distribution"
      >
        <div className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white p-1 shadow-2xs">
          <Calendar className="h-4 w-4 text-ink-400 ml-2" />
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                days === d
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {/* Two cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gateway Authorization Matrix */}
        <div className="card p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-ink-900">Gateway Transaction Outcomes</h3>
          <p className="text-xs text-ink-500">Processed authorizations vs refund requests</p>

          <div className="space-y-3">
            {gatewayStats.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink-400">No gateway transactions in this window.</p>
            ) : (
              gatewayStats.map((st, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-ink-50/70 p-3 text-xs">
                  <div>
                    <span className="font-bold text-ink-900 capitalize">{st.kind} - {st.status}</span>
                    <p className="text-[10px] text-ink-400">{st.count} transactions</p>
                  </div>
                  <span className="font-extrabold text-sm text-ink-900">{money(st.volume)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Method Distribution */}
        <div className="card p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-ink-900">Payment Channel Breakdown</h3>
          <p className="text-xs text-ink-500">Share of Card, Mobile Money, and Cash checkouts</p>

          <div className="space-y-3">
            {methodShare.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink-400">No payment method data recorded.</p>
            ) : (
              methodShare.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-ink-50/70 p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="h-4 w-4 text-brand-600" />
                    <div>
                      <p className="font-bold text-ink-900 capitalize">{m.payment_method || 'Mobile Money / Card'}</p>
                      <p className="text-[10px] text-ink-400">{m.count} orders</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-brand-700">{money(m.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
