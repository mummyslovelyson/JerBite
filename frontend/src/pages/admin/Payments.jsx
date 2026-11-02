import { useState } from 'react';
import { Banknote, RotateCcw, AlertTriangle } from 'lucide-react';
import useApi from '../../hooks/useApi';
import { Badge, Empty, ErrorNote, Spinner, Stat, Tabs, money, when } from '../../components/ui';

export default function AdminPayments() {
  const [tab, setTab] = useState('');
  const params = tab === 'failed' ? { status: 'failed' } : { kind: tab };
  const { data, loading, error } = useApi('/admin/payments', params);

  return (
    <div className="w-full space-y-4 pb-16">
      {/* Metric Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat
            label="Collected"
            value={money(data.summary.collected)}
            icon={Banknote}
          />
          <Stat
            label="Refunded"
            value={money(data.summary.refunded)}
            icon={RotateCcw}
          />
          <Stat
            label="Failed"
            value={data.summary.failed}
            icon={AlertTriangle}
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          ['', 'All Transactions'],
          ['charge', 'Charges'],
          ['refund', 'Refunds'],
          ['failed', 'Failed Attempts']
        ]}
      />

      <ErrorNote message={error} />

      {loading ? (
        <Spinner />
      ) : !data?.rows?.length ? (
        <Empty
          title="No payment records found"
          hint="Transactions appear automatically when orders are processed."
        />
      ) : (
        <div className="card overflow-hidden border border-ink-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50/60 text-ink-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Date</th>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th className="pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.rows.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/50 transition">
                    <td className="p-4 font-medium text-ink-500">{when(p.created_at)}</td>
                    <td className="max-w-[180px] truncate font-mono text-[11px] font-bold text-ink-800">
                      {p.reference}
                    </td>
                    <td className="font-semibold text-ink-900">{p.customer_name}</td>
                    <td className="text-ink-600">{p.restaurant_name}</td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold capitalize ${
                          p.kind === 'refund'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.kind}
                      </span>
                    </td>
                    <td className="font-black text-sm text-ink-900">
                      {p.kind === 'refund' ? '−' : ''}
                      {money(p.amount)}
                    </td>
                    <td className="pr-4">
                      <Badge
                        status={
                          p.status === 'success'
                            ? 'paid'
                            : p.status === 'failed'
                            ? 'cancelled'
                            : p.status === 'initiated'
                            ? 'unpaid'
                            : 'pending'
                        }
                      >
                        {p.status}
                      </Badge>
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
