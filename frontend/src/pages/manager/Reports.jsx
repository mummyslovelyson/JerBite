import { useState } from 'react';
import {
  FileText, Download, TrendingUp, DollarSign,
  Utensils, Calendar, ShoppingBag
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import { Spinner, Empty, ErrorNote, Stat, money } from '../../components/ui';
import { AreaChart, BarChart } from '../../components/Charts';
import toast from 'react-hot-toast';

export default function ManagerReports() {
  const [days, setDays] = useState(30);
  const { data: analytics, loading, error } = useApi('/manager/analytics', { days });

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

  const { totals = {}, series = [], topProducts = [], categorySales = [] } = analytics || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Restaurant Reports &amp; Exports</h1>
          <p className="text-xs text-ink-500">Sales performance, dish popularities, and CSV exports for accounting</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(series, 'restaurant_sales_report')}
            className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-4 w-4" /> Export Sales CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={`Food Sales (${days}d)`} value={money(totals.revenue || 0)} hint={`${totals.orders || 0} completed orders`} icon={DollarSign} tone="orange" />
        <Stat label="Net Kitchen Payout" value={money(totals.payout || 0)} hint="After commission deduction" icon={TrendingUp} tone="green" />
        <Stat label="Platform Commission" value={money(totals.commission || 0)} hint="Platform fee" icon={DollarSign} tone="amber" />
        <Stat label="Average Ticket" value={money(totals.avg_order || 0)} hint="Per food order" icon={ShoppingBag} tone="orange" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider flex items-center gap-2">
            <Utensils className="h-4 w-4 text-brand-600" /> Best-Selling Menu Items
          </h3>
          <div className="divide-y divide-ink-100">
            {topProducts.map((p, i) => (
              <div key={p.name || i} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <p className="font-bold text-ink-950">{p.name}</p>
                  <p className="text-ink-500">{p.sold} units sold</p>
                </div>
                <span className="font-extrabold text-brand-700">{money(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-ink-950 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-600" /> Category Revenue Breakdown
          </h3>
          <div className="divide-y divide-ink-100">
            {categorySales.map((c, i) => (
              <div key={c.name || i} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <p className="font-bold text-ink-950">{c.name}</p>
                  <p className="text-ink-500">{c.sold} items ordered</p>
                </div>
                <span className="font-extrabold text-brand-700">{money(c.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
