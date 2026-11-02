import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Store, Bike, Users, LifeBuoy, AlertTriangle,
  ArrowUpRight, Clock, ShieldCheck, CheckCircle2, ChevronRight, RefreshCw,
  TrendingUp, Calendar, Download, Plus, UtensilsCrossed, Package, HeartHandshake
} from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner } from '../../../components/ui';

// Smooth cubic sparkline component using real numeric values
function MiniSparkline({ color = '#FF5A26', points = [] }) {
  const safePoints = points.length >= 2 ? points : [0, 0];
  const min = Math.min(...safePoints);
  const max = Math.max(...safePoints);
  const range = max - min || 1;
  const width = 84;
  const height = 32;
  const pts = safePoints.map((p, i) => {
    const x = (i / (safePoints.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const pathD = `M ${pts[0]} ` + pts.slice(1).map((pt) => `L ${pt}`).join(' ');
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  const gradId = `spark-admin-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

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

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/analytics?days=30');
      setData(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = data?.counts || {};
  const totals = data?.totals || {};
  const recentAudit = data?.recentAudit || [];
  const series = data?.series || [];
  const signups = data?.signups || [];

  const revPoints = useMemo(() => {
    if (series.length < 2) return [0, 0];
    return series.map((s) => s.revenue || 0);
  }, [series]);

  const ordPoints = useMemo(() => {
    if (series.length < 2) return [0, 0];
    return series.map((s) => s.orders || 0);
  }, [series]);

  const userPoints = useMemo(() => {
    if (signups.length < 2) return [0, 0];
    return signups.map((s) => s.users || 0);
  }, [signups]);

  const avgPoints = useMemo(() => {
    if (series.length < 2) return [0, 0];
    return series.map((s) => (s.orders > 0 ? Math.round(s.revenue / s.orders) : 0));
  }, [series]);

  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());
  }, []);

  if (loading && !data) return <Spinner />;

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-8">
      {/* 1. TOP GREETING HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-black text-2xl sm:text-3xl text-ink-900 tracking-tight flex items-center gap-2">
            Good Day, Admin! <span className="text-2xl">👋</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-500 font-medium">
            Here's what's happening across the JerBite food &amp; delivery network today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-2xl border border-[#EFECE6] bg-white px-3.5 py-2 text-xs font-bold text-ink-700 shadow-xs">
            <Calendar className="h-4 w-4 text-[#FF5A26]" />
            <span>{todayStr}</span>
          </div>

          <Link
            to="/admin/analytics/reports"
            className="flex items-center gap-1.5 rounded-2xl bg-[#FF5A26] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-orange-500/20 hover:bg-[#E0450A] transition"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </Link>

          <button
            onClick={load}
            title="Refresh Live Data"
            className="rounded-2xl border border-[#EFECE6] bg-white p-2 text-ink-600 shadow-xs hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2] transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">
          {err}
        </div>
      )}

      {/* 2. FOUR KPI CARDS (Real Live Data Only) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#FFF2EB] p-2 text-[#FF5A26]">
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Total Revenue</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-black text-ink-900 tracking-tight">
              {money(totals.revenue || 0)}
            </p>
            <MiniSparkline color="#FF5A26" points={revPoints} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-ink-400">Past 30 days platform gross</p>
        </div>

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
            <p className="text-2xl font-black text-ink-900 tracking-tight">
              {totals.orders || 0}
            </p>
            <MiniSparkline color="#FF5A26" points={ordPoints} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-ink-400">Completed deliveries</p>
        </div>

        {/* New Diners / Customers */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Active Diners</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-black text-ink-900 tracking-tight">
              {counts.customers || 0}
            </p>
            <MiniSparkline color="#10B981" points={userPoints} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-ink-400">Registered marketplace accounts</p>
        </div>

        {/* Average Order Value */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Average Basket</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-black text-ink-900 tracking-tight">
              {money(totals.avg_order || 0)}
            </p>
            <MiniSparkline color="#F59E0B" points={avgPoints} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-ink-400">Spend per completed checkout</p>
        </div>
      </div>

      {/* 3. ACTION REQUIRED BANNER (Highlighting pending approvals) */}
      {((counts.pending_restaurants || 0) > 0 || (counts.pending_riders || 0) > 0 || (counts.pending_refunds || 0) > 0 || (counts.open_tickets || 0) > 0) && (
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-[#FFFBF0] to-[#FFF8E7] p-6 shadow-xs">
          <div className="flex items-center gap-2.5 font-black text-amber-950 text-sm">
            <div className="rounded-xl bg-amber-500 p-1.5 text-white">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <span>Items Requiring Administrator Review &amp; Approval</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {counts.pending_restaurants > 0 && (
              <Link
                to="/admin/restaurants/applications"
                className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white p-4 shadow-xs hover:border-[#FF5A26] hover:shadow-md transition"
              >
                <div>
                  <p className="text-xs text-ink-500 font-bold">Restaurant Approvals</p>
                  <p className="text-xl font-black text-amber-950 mt-0.5">{counts.pending_restaurants} pending</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#FF5A26]" />
              </Link>
            )}
            {counts.pending_riders > 0 && (
              <Link
                to="/admin/riders/applications"
                className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white p-4 shadow-xs hover:border-[#FF5A26] hover:shadow-md transition"
              >
                <div>
                  <p className="text-xs text-ink-500 font-bold">Rider Applications</p>
                  <p className="text-xl font-black text-amber-950 mt-0.5">{counts.pending_riders} waiting</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#FF5A26]" />
              </Link>
            )}
            {counts.pending_refunds > 0 && (
              <Link
                to="/admin/payments/refund-requests"
                className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white p-4 shadow-xs hover:border-[#FF5A26] hover:shadow-md transition"
              >
                <div>
                  <p className="text-xs text-ink-500 font-bold">Refund Requests</p>
                  <p className="text-xl font-black text-amber-950 mt-0.5">{counts.pending_refunds} requests</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#FF5A26]" />
              </Link>
            )}
            {counts.open_tickets > 0 && (
              <Link
                to="/admin/support"
                className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white p-4 shadow-xs hover:border-[#FF5A26] hover:shadow-md transition"
              >
                <div>
                  <p className="text-xs text-ink-500 font-bold">Support Disputes</p>
                  <p className="text-xl font-black text-amber-950 mt-0.5">{counts.open_tickets} tickets</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#FF5A26]" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 4. MANAGEMENT MODULE QUICK JUMP & AUDIT LOG FEED */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Management Hub */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-base text-ink-900 tracking-tight">Platform Management Hub</h2>
              <p className="text-xs text-ink-500 mt-0.5">Quick jump to core operational modules</p>
            </div>
            <span className="text-[11px] font-bold text-[#E0450A] bg-[#FFF0E6] px-2.5 py-1 rounded-full">
              12 Modules
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Link
              to="/admin/restaurants"
              className="rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] p-3.5 hover:bg-[#FFF4ED] hover:border-[#FED7C2] transition text-left group"
            >
              <div className="rounded-xl bg-white p-2 w-fit text-[#FF5A26] shadow-xs mb-2 group-hover:bg-[#FF5A26] group-hover:text-white transition">
                <Store className="h-4 w-4" />
              </div>
              <p className="font-extrabold text-xs text-ink-900">Restaurants</p>
              <p className="text-[11px] text-ink-500">{counts.restaurants || 0} registered</p>
            </Link>

            <Link
              to="/admin/food"
              className="rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] p-3.5 hover:bg-[#FFF4ED] hover:border-[#FED7C2] transition text-left group"
            >
              <div className="rounded-xl bg-white p-2 w-fit text-[#FF5A26] shadow-xs mb-2 group-hover:bg-[#FF5A26] group-hover:text-white transition">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <p className="font-extrabold text-xs text-ink-900">Food &amp; Menus</p>
              <p className="text-[11px] text-ink-500">{counts.pending_products || 0} pending review</p>
            </Link>

            <Link
              to="/admin/riders"
              className="rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] p-3.5 hover:bg-[#FFF4ED] hover:border-[#FED7C2] transition text-left group"
            >
              <div className="rounded-xl bg-white p-2 w-fit text-[#FF5A26] shadow-xs mb-2 group-hover:bg-[#FF5A26] group-hover:text-white transition">
                <Bike className="h-4 w-4" />
              </div>
              <p className="font-extrabold text-xs text-ink-900">Rider Fleet</p>
              <p className="text-[11px] text-ink-500">{counts.riders || 0} active</p>
            </Link>

            <Link
              to="/admin/orders"
              className="rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] p-3.5 hover:bg-[#FFF4ED] hover:border-[#FED7C2] transition text-left group"
            >
              <div className="rounded-xl bg-white p-2 w-fit text-[#FF5A26] shadow-xs mb-2 group-hover:bg-[#FF5A26] group-hover:text-white transition">
                <Package className="h-4 w-4" />
              </div>
              <p className="font-extrabold text-xs text-ink-900">All Orders</p>
              <p className="text-[11px] text-ink-500">{totals.orders || 0} fulfilled</p>
            </Link>

            <Link
              to="/admin/payments"
              className="rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] p-3.5 hover:bg-[#FFF4ED] hover:border-[#FED7C2] transition text-left group"
            >
              <div className="rounded-xl bg-white p-2 w-fit text-[#FF5A26] shadow-xs mb-2 group-hover:bg-[#FF5A26] group-hover:text-white transition">
                <DollarSign className="h-4 w-4" />
              </div>
              <p className="font-extrabold text-xs text-ink-900">Finance</p>
              <p className="text-[11px] text-ink-500">{money(totals.revenue || 0)} gross</p>
            </Link>

            <Link
              to="/admin/support"
              className="rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] p-3.5 hover:bg-[#FFF4ED] hover:border-[#FED7C2] transition text-left group"
            >
              <div className="rounded-xl bg-white p-2 w-fit text-[#FF5A26] shadow-xs mb-2 group-hover:bg-[#FF5A26] group-hover:text-white transition">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <p className="font-extrabold text-xs text-ink-900">Support</p>
              <p className="text-[11px] text-ink-500">{counts.open_tickets || 0} open tickets</p>
            </Link>
          </div>
        </div>

        {/* Live Admin Audit Trail Feed */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-base text-ink-900 tracking-tight">Recent Administrative Actions</h2>
              <p className="text-xs text-ink-500 mt-0.5">Recorded in platform audit log</p>
            </div>
            <Link
              to="/admin/system/audit-logs"
              className="text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] transition"
            >
              View All Logs &rarr;
            </Link>
          </div>

          <div className="mt-5 space-y-2.5">
            {recentAudit.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink-400">No recent administrative actions recorded.</p>
            ) : (
              recentAudit.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start justify-between rounded-2xl bg-[#FBF9F7] border border-[#EFEBE4] p-3.5 text-xs">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#EA4A0F] to-[#FF6B3D] text-white font-black text-[10px]">
                      {log.user_name ? log.user_name[0].toUpperCase() : 'A'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-ink-900 truncate">
                        {log.user_name || 'Admin'} <span className="font-semibold text-ink-500">({log.action})</span>
                      </p>
                      <p className="text-[11px] text-ink-500 truncate mt-0.5">
                        Target: <span className="font-mono text-ink-700">{log.entity_type}</span> {log.entity_id ? `(#${log.entity_id.slice(0, 8)})` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold text-ink-400 ml-2">
                    {when(log.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
