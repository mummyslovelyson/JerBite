import { useState } from 'react';
import {
  FileText, Download, TrendingUp, ShoppingBag, Store,
  Users, Bike, CreditCard, Calendar, ArrowUpRight
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import { Spinner, Empty, ErrorNote, Stat, money } from '../../components/ui';
import { AreaChart, BarChart } from '../../components/Charts';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [reportType, setReportType] = useState('sales'); // 'sales', 'orders', 'restaurants', 'customers', 'riders', 'payments'
  const [days, setDays] = useState(30);

  const { data: analytics, loading, error } = useApi('/admin/analytics', { days });

  const exportCSV = (dataArr, filename) => {
    if (!dataArr || !dataArr.length) {
      toast.error('No data to export');
      return;
    }
    const headers = Object.keys(dataArr[0]).join(',');
    const rows = dataArr.map((obj) => Object.values(obj).map((v) => `"${v}"`).join(',')).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + '\n' + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded as CSV');
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { totals = {}, series = [], topRestaurants = [], signups = [], byStatus = [] } = analytics || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Reports &amp; Data Exports</h1>
          <p className="text-xs text-ink-500">Generate executive summaries, operational audit reports, and downloadable datasets</p>
        </div>
        <button
          onClick={() => exportCSV(series, `jerbite_${reportType}_report`)}
          className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Download className="h-4 w-4" /> Export CSV Dataset
        </button>
      </div>

      {/* Report Selector Pills */}
      <div className="flex border-b border-ink-200 gap-4 text-xs font-bold overflow-x-auto pb-1">
        {[
          { key: 'sales', label: 'Sales Report', icon: TrendingUp },
          { key: 'orders', label: 'Order Analytics', icon: ShoppingBag },
          { key: 'restaurants', label: 'Restaurant Performance', icon: Store },
          { key: 'customers', label: 'Customer Retention', icon: Users },
          { key: 'payments', label: 'Payment Ledger', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key)}
              className={`flex items-center gap-2 pb-3 transition whitespace-nowrap ${
                reportType === tab.key
                  ? 'border-b-2 border-brand-600 text-brand-700 font-black'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Gross Sales Volume" value={money(totals.revenue || 0)} hint={`Over past ${days} days`} icon={TrendingUp} tone="orange" />
        <Stat label="Platform Commission" value={money(totals.commission || 0)} hint="Net operator earnings" icon={ArrowUpRight} tone="amber" />
        <Stat label="Total Orders Fulfilled" value={totals.orders || 0} hint="100% paid checkouts" icon={ShoppingBag} tone="green" />
        <Stat label="Dispatched Courier Fees" value={money(totals.delivery_fees || 0)} hint="Fleet payouts" icon={Bike} tone="orange" />
      </div>

      {/* Visual Report Display */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-ink-100 pb-3">
          <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" />
            {reportType.toUpperCase()} Dataset Breakdown
          </h3>
          <span className="text-xs text-ink-500">{series.length} data points</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-5 py-3">Reporting Date</th>
                <th className="px-5 py-3">Orders Completed</th>
                <th className="px-5 py-3">Gross Revenue</th>
                <th className="px-5 py-3">Estimated Commission</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {series.map((row, i) => (
                <tr key={row.date || i}>
                  <td className="px-5 py-3 font-mono font-bold text-ink-900">{row.date}</td>
                  <td className="px-5 py-3 font-semibold">{row.orders} orders</td>
                  <td className="px-5 py-3 font-extrabold text-brand-700">{money(row.revenue)}</td>
                  <td className="px-5 py-3 text-emerald-700 font-bold">{money(row.revenue * 0.1)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-[11px] font-bold text-ink-400">Audited</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
