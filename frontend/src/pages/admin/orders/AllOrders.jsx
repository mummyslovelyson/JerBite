import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ClipboardList, Search, Eye, RefreshCw, SlidersHorizontal, MapPin, Store, User,
  Clock, CheckCircle, XCircle, AlertTriangle, ChevronRight, Calendar, Download,
  ShoppingBag, CheckCircle2, ArrowRight
} from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, Badge, ErrorNote } from '../../../components/ui';

// Mini Sparkline component
function MiniSparkline({ color = '#FF5A26', points = [10, 16, 14, 22, 19, 28, 25, 34] }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 84;
  const height = 32;
  const pts = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const pathD = `M ${pts[0]} ` + pts.slice(1).map((pt) => `L ${pt}`).join(' ');
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  const gradId = `order-spark-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [err, setErr] = useState('');
  const [tabFilter, setTabFilter] = useState('all'); // 'all', 'active', 'completed', 'cancelled'

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/orders?status=${statusFilter}&payment=${paymentFilter}&search=${encodeURIComponent(search)}`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, paymentFilter]);

  const activeCount = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
  const completedCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
  const totalCount = orders.length;
  const activePct = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
  const completedPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const cancelledPct = totalCount > 0 ? Math.round((cancelledCount / totalCount) * 100) : 0;

  const filteredOrders = useMemo(() => {
    if (tabFilter === 'active') {
      return orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
    }
    if (tabFilter === 'completed') {
      return orders.filter((o) => o.status === 'delivered');
    }
    if (tabFilter === 'cancelled') {
      return orders.filter((o) => o.status === 'cancelled');
    }
    return orders;
  }, [orders, tabFilter]);

  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());
  }, []);

  const downloadReport = () => {
    if (orders.length === 0) {
      toast.error('No order records to export');
      return;
    }
    const headers = ['Order ID', 'Customer', 'Restaurant', 'Total', 'Payment Status', 'Fulfillment Status', 'Created At'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.customer_name || 'Guest'}"`,
      `"${o.restaurant_name || ''}"`,
      o.total,
      o.payment_status || 'pending',
      o.status,
      o.created_at
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jerbite-orders-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders report downloaded');
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* 1. Header (Tablet Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-ink-900 tracking-tight">
              Order Management
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFF0E6] text-[#FF5A26] border border-[#FED7C2]">
              {orders.length} Total Orders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-500 mt-1 font-medium">
            Platform master ledger of orders, fulfillment lifecycles, payments, and disputes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-2xl border border-[#EFECE6] bg-white px-3.5 py-2 text-xs font-bold text-ink-700 shadow-xs">
            <Calendar className="h-4 w-4 text-[#FF5A26]" />
            <span>{todayStr}</span>
          </div>

          <button
            type="button"
            onClick={downloadReport}
            className="flex items-center gap-1.5 rounded-2xl bg-[#FF5A26] px-4 py-2 text-xs font-bold text-white shadow-xs shadow-orange-500/20 hover:bg-[#E0450A] transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>

          <button
            type="button"
            onClick={load}
            className="rounded-2xl border border-[#EFECE6] bg-white p-2 text-ink-600 hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2] transition shadow-xs cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#FFF2EB] p-2 text-[#FF5A26]">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Total Orders</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-ink-900 tracking-tight">{orders.length}</p>
              <p className="mt-1 text-[11px] font-medium text-ink-400">
                All platform records
              </p>
            </div>
            <MiniSparkline color="#FF5A26" points={orders.length > 0 ? [0, orders.length] : [0, 0]} />
          </div>
        </div>

        {/* Active Orders */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#FFF2EB] p-2 text-[#FF5A26]">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Active Live Orders</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-ink-900 tracking-tight">{activeCount}</p>
              <p className="mt-1 text-[11px] font-bold text-[#FF5A26]">
                {activePct}% in fulfillment
              </p>
            </div>
            <MiniSparkline color="#FF5A26" points={activeCount > 0 ? [0, activeCount] : [0, 0]} />
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Completed Orders</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-ink-900 tracking-tight">{completedCount}</p>
              <p className="mt-1 text-[11px] font-bold text-emerald-600">
                {completedPct}% fulfillment rate
              </p>
            </div>
            <MiniSparkline color="#10B981" points={completedCount > 0 ? [0, completedCount] : [0, 0]} />
          </div>
        </div>

        {/* Cancelled / Disputed */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
                <XCircle className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Cancelled / Rejected</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-ink-900 tracking-tight">{cancelledCount}</p>
              <p className="mt-1 text-[11px] font-bold text-rose-600">
                {cancelledPct}% cancellation rate
              </p>
            </div>
            <MiniSparkline color="#EF4444" points={cancelledCount > 0 ? [0, cancelledCount] : [0, 0]} />
          </div>
        </div>
      </div>

      {/* 3. Orange Pill Tabs (Everything in the Overview) */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {[
          { id: 'all', label: 'All Orders', count: orders.length },
          { id: 'active', label: 'Active Live Orders', count: activeCount },
          { id: 'completed', label: 'Completed Deliveries', count: completedCount },
          { id: 'cancelled', label: 'Cancelled Orders', count: cancelledCount }
        ].map((tab) => {
          const isActive = tabFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTabFilter(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF5A26] to-[#FA4A0C] text-white shadow-sm shadow-orange-500/25 font-extrabold'
                  : 'bg-white border border-[#EFEBE4] text-ink-700 hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#F4EFEA] text-ink-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}

        <Link
          to="/admin/orders/disputes"
          className="flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 bg-white border border-[#EFEBE4] text-ink-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 transition"
        >
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Order Disputes</span>
        </Link>
      </div>

      {/* 4. Search and Filters */}
      <div className="rounded-3xl border border-[#EFECE6] bg-white p-4.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by order ID, diner name, or restaurant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] pl-10 pr-4 py-2.5 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-[#FF5A26] focus:bg-white focus:outline-hidden transition"
          />
        </form>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-ink-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-[#EFEBE4] bg-white px-3.5 py-2 text-xs font-bold text-ink-700 shadow-xs focus:outline-hidden cursor-pointer"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="placed">Placed</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="picked_up">Picked Up</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-2xl border border-[#EFEBE4] bg-white px-3.5 py-2 text-xs font-bold text-ink-700 shadow-xs focus:outline-hidden cursor-pointer"
          >
            <option value="">All Payment States</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {err && <ErrorNote message={err} />}

      {/* 5. Orders Table */}
      <div className="rounded-3xl border border-[#EFECE6] bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="p-12"><Spinner /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-ink-500 font-medium text-xs">
            No orders match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F4EFEA] bg-[#FBF9F7] text-[11px] font-extrabold text-ink-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Restaurant</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEA]">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FFFBF8] transition">
                    <td className="px-5 py-3.5">
                      <div className="font-extrabold text-ink-900">#{o.id.slice(0, 8)}</div>
                      <div className="text-[11px] text-ink-400 mt-0.5">{when(o.created_at)}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-ink-800">
                      {o.customer_name || 'Guest'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-ink-900">{o.restaurant_name}</div>
                      <div className="text-[11px] text-ink-400 truncate max-w-xs">{o.delivery_address}</div>
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-ink-900 font-mono">
                      {money(o.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          o.payment_status === 'paid'
                            ? 'success'
                            : o.payment_status === 'failed'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {o.payment_status || 'pending'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          o.status === 'delivered'
                            ? 'success'
                            : o.status === 'cancelled'
                            ? 'danger'
                            : 'info'
                        }
                      >
                        {o.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#FBF9F7] border border-[#EFEBE4] px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2] transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
