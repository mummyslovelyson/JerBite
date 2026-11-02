import { useState } from 'react';
import { Download, FileSpreadsheet, Calendar, RefreshCw, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { PageHeader, Field, ErrorNote } from '../../../components/ui';

export default function ReportsAndExports() {
  const [reportType, setReportType] = useState('orders');
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setErr('');
    setSuccess('');
    try {
      let rows = [];
      let filename = `jerbite_${reportType}_${Date.now()}.csv`;

      if (reportType === 'orders') {
        const res = await api.get('/admin/orders');
        rows = res.data.map(o => ({
          order_id: o.id,
          restaurant: o.restaurant_name,
          customer: o.customer_name,
          status: o.status,
          payment_status: o.payment_status,
          total: o.total,
          delivery_fee: o.delivery_fee,
          created_at: o.created_at
        }));
      } else if (reportType === 'restaurants') {
        const res = await api.get('/admin/restaurants');
        rows = res.data.map(r => ({
          restaurant_id: r.id,
          name: r.name,
          owner: r.owner_name,
          email: r.owner_email,
          cuisine: r.cuisine,
          status: r.status,
          product_count: r.product_count,
          created_at: r.created_at
        }));
      } else if (reportType === 'payments') {
        const res = await api.get('/admin/payments');
        rows = (res.data.rows || []).map(p => ({
          reference: p.reference,
          order_id: p.order_id,
          customer: p.customer_name,
          restaurant: p.restaurant_name,
          kind: p.kind,
          amount: p.amount,
          status: p.status,
          created_at: p.created_at
        }));
      } else if (reportType === 'customers') {
        const res = await api.get('/admin/customers');
        rows = res.data.map(c => ({
          customer_id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          status: c.status,
          verified: c.email_verified,
          orders: c.order_count,
          total_spent: c.total_spent,
          joined: c.created_at
        }));
      } else if (reportType === 'audit') {
        const res = await api.get('/admin/system/audit-logs');
        rows = res.data.map(a => ({
          log_id: a.id,
          admin_user: a.user_name,
          action: a.action,
          entity: a.entity_type,
          entity_id: a.entity_id,
          timestamp: a.created_at
        }));
      }

      if (!rows.length) {
        alert('No data records available to export.');
        return;
      }

      // Convert to CSV
      const headers = Object.keys(rows[0]).join(',');
      const csvContent = [
        headers,
        ...rows.map(row => Object.values(row).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`Export generated successfully: ${filename}`);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports and Exports"
        sub="Generate customizable CSV data files for accounting, tax audits, operation reviews, and platform analytics"
      />

      {err && <ErrorNote message={err} />}
      {success && (
        <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200">
          {success}
        </div>
      )}

      {/* Export Configuration Card */}
      <div className="card p-6 max-w-2xl space-y-5">
        <h3 className="font-extrabold text-base text-ink-900 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-brand-600" /> Export Data Set
        </h3>

        <div className="space-y-4">
          <Field label="Dataset Category">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs bg-white focus:border-brand-500 focus:outline-hidden"
            >
              <option value="orders">Orders Master Ledger</option>
              <option value="payments">Financial Transactions & Gateway Charges</option>
              <option value="restaurants">Restaurant Directory & Commissions</option>
              <option value="customers">Customer Accounts & Lifetime Values</option>
              <option value="audit">Administrative Audit Logs</option>
            </select>
          </Field>

          <Field label="Date Range Coverage">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-2.5 text-xs bg-white focus:border-brand-500 focus:outline-hidden"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">Full Lifetime Records</option>
            </select>
          </Field>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 p-3 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
          >
            <Download className="h-4 w-4" /> {exporting ? 'Compiling CSV File...' : 'Download CSV Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
