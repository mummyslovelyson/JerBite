import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Store, Search, SlidersHorizontal, RefreshCw, CheckCircle2,
  Clock, Eye, ShieldAlert, FileText, UserCheck, AlertCircle,
  ArrowRight, DollarSign, Utensils, Star, ExternalLink,
  Calendar, Download, Award, Activity, Flame, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import api, { errMsg, assetUrl } from '../../../api/client';
import { Spinner, Badge, Modal, money, when } from '../../../components/ui';

const FALLBACK_LOGO = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80';

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
  const gradId = `spark-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

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

export default function RestaurantsOverview({ defaultTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [trendRange, setTrendRange] = useState('week'); // 'today', 'week', 'month'

  // Main data states (Real Data from API)
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Real Analytics State from API
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Additional tab states
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [changeRequests, setChangeRequests] = useState([]);
  const [changesLoading, setChangesLoading] = useState(false);

  // Detail Modal State
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [restaurantDetail, setRestaurantDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('menu');

  // Action / Review Modal State
  const [actionModal, setActionModal] = useState({
    open: false,
    restaurant: null,
    action: 'approve',
    note: ''
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  // Doc review modal
  const [docReviewModal, setDocReviewModal] = useState({
    open: false,
    doc: null,
    status: 'verified',
    note: ''
  });

  // Change request review modal
  const [changeModal, setChangeModal] = useState({
    open: false,
    request: null,
    action: 'approve',
    note: ''
  });

  // Load primary restaurant directory
  const loadRestaurants = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/restaurants?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setRestaurants(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  // Load real analytics data from backend
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const days = trendRange === 'today' ? 1 : trendRange === 'week' ? 7 : 30;
      const res = await api.get(`/admin/analytics?days=${days}`);
      setAnalytics(res.data);
    } catch {
      // Non-blocking
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, [statusFilter]);

  useEffect(() => {
    loadAnalytics();
  }, [trendRange]);

  // Load documents
  const loadDocuments = async () => {
    setDocsLoading(true);
    try {
      const res = await api.get('/admin/restaurant-documents');
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Non-blocking
    } finally {
      setDocsLoading(false);
    }
  };

  // Load managers
  const loadManagers = async () => {
    setManagersLoading(true);
    try {
      const res = await api.get('/admin/restaurant-managers');
      setManagers(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Non-blocking
    } finally {
      setManagersLoading(false);
    }
  };

  // Load change requests
  const loadChangeRequests = async () => {
    setChangesLoading(true);
    try {
      const res = await api.get('/admin/restaurant-change-requests');
      setChangeRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Non-blocking
    } finally {
      setChangesLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    loadManagers();
    loadChangeRequests();
  }, []);

  // Open detail modal
  const openDetail = async (id) => {
    setSelectedRestaurantId(id);
    setDetailLoading(true);
    setRestaurantDetail(null);
    setDetailTab('menu');
    try {
      const res = await api.get(`/admin/restaurants/${id}`);
      setRestaurantDetail(res.data);
    } catch (e) {
      toast.error(errMsg(e));
      setSelectedRestaurantId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle Review Submit (Approve / Reject / Suspend / Reinstate)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if ((actionModal.action === 'reject' || actionModal.action === 'suspend') && !actionModal.note.trim()) {
      toast.error('Please specify a reason');
      return;
    }
    setSubmittingAction(true);
    try {
      await api.patch(`/admin/restaurants/${actionModal.restaurant.id}/review`, {
        action: actionModal.action,
        note: actionModal.note.trim()
      });
      toast.success(`Restaurant ${actionModal.action}d successfully`);
      setActionModal({ open: false, restaurant: null, action: 'approve', note: '' });
      loadRestaurants();
      if (selectedRestaurantId) openDetail(selectedRestaurantId);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Document Review
  const handleDocReview = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/restaurant-documents/${docReviewModal.doc.id}/review`, {
        status: docReviewModal.status,
        note: docReviewModal.note.trim()
      });
      toast.success(`Document marked as ${docReviewModal.status}`);
      setDocReviewModal({ open: false, doc: null, status: 'verified', note: '' });
      loadDocuments();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  // Handle Change Request Review
  const handleChangeReview = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/restaurant-change-requests/${changeModal.request.id}/review`, {
        action: changeModal.action,
        note: changeModal.note.trim()
      });
      toast.success(`Change request ${changeModal.action}d`);
      setChangeModal({ open: false, request: null, action: 'approve', note: '' });
      loadChangeRequests();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  // Download CSV report
  const downloadReport = () => {
    if (restaurants.length === 0) {
      toast.error('No restaurant data to export');
      return;
    }
    const headers = ['ID', 'Name', 'Cuisine', 'City', 'Owner Name', 'Owner Email', 'Status', 'Rating', 'Products Count', 'Orders Count'];
    const rows = restaurants.map((r) => [
      r.id,
      `"${r.name || ''}"`,
      `"${r.cuisine || ''}"`,
      `"${r.city || ''}"`,
      `"${r.owner_name || ''}"`,
      `"${r.owner_email || ''}"`,
      r.status,
      r.rating || '—',
      r.product_count || 0,
      r.order_count || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jerbite-restaurants-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
  };

  // =========================================================================
  // REAL COMPUTED METRICS & DATA TRANSFORMS (ZERO MOCK DATA)
  // =========================================================================
  const totalCount = restaurants.length;
  const approvedCount = restaurants.filter((r) => r.status === 'approved').length;
  const pendingCount = restaurants.filter((r) => r.status === 'pending').length;
  const suspendedCount = restaurants.filter((r) => r.status === 'suspended').length;
  const pendingDocsCount = documents.filter((d) => d.status === 'pending').length;
  const pendingChangesCount = changeRequests.filter((c) => c.status === 'pending').length;

  // Real Average Rating computed across actual restaurants
  const validRatings = useMemo(() => {
    return restaurants
      .map((r) => parseFloat(r.rating))
      .filter((n) => !isNaN(n) && n > 0);
  }, [restaurants]);

  const realAvgRating = useMemo(() => {
    if (validRatings.length === 0) return null;
    return (validRatings.reduce((sum, n) => sum + n, 0) / validRatings.length).toFixed(1);
  }, [validRatings]);

  // Real Platform Revenue from Analytics
  const realPlatformRevenue = analytics?.totals?.revenue || 0;
  const realTotalOrders = analytics?.totals?.orders || 0;

  // Real Series Data for Chart
  const realChartData = useMemo(() => {
    if (!analytics?.series || analytics.series.length === 0) {
      return [];
    }
    return analytics.series.map((item) => {
      let label = item.date;
      if (item.date && item.date.length >= 10) {
        const parts = item.date.split('-');
        label = `${parts[1]}/${parts[2]}`;
      }
      return {
        time: label,
        revenue: item.revenue || 0,
        orders: item.orders || 0
      };
    });
  }, [analytics]);

  // Sparkline points derived from real series
  const sparkRevenuePoints = useMemo(() => {
    if (!analytics?.series || analytics.series.length === 0) return [0, 0];
    return analytics.series.map((s) => s.revenue || 0);
  }, [analytics]);

  const sparkOrderPoints = useMemo(() => {
    if (!analytics?.series || analytics.series.length === 0) return [0, 0];
    return analytics.series.map((s) => s.orders || 0);
  }, [analytics]);

  // Real Top Performing Kitchens (sorted by actual order_count, then product_count)
  const realTopKitchens = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.order_count || 0) - (a.order_count || 0) || (b.product_count || 0) - (a.product_count || 0))
      .slice(0, 5);
  }, [restaurants]);

  // Real Cuisine Distribution from actual restaurants
  const realCuisineDistribution = useMemo(() => {
    if (restaurants.length === 0) return [];
    const map = {};
    restaurants.forEach((r) => {
      const c = r.cuisine?.trim() || 'General Food';
      map[c] = (map[c] || 0) + 1;
    });
    const palette = ['#FF5A26', '#F59E0B', '#10B981', '#8B5CF6', '#3B82F6', '#EC4899'];
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cuisine, count], idx) => ({
        cuisine,
        count,
        percent: Math.round((count / restaurants.length) * 100),
        color: palette[idx % palette.length]
      }));
  }, [restaurants]);

  // Real Summary Metrics for Chart Card Footer
  const chartSummary = useMemo(() => {
    if (realChartData.length === 0) {
      return { totalRev: 0, totalOrd: 0, peakRev: 0, peakRevTime: '—', peakOrd: 0, peakOrdTime: '—' };
    }
    let totalRev = 0;
    let totalOrd = 0;
    let peakRev = 0;
    let peakRevTime = '—';
    let peakOrd = 0;
    let peakOrdTime = '—';

    realChartData.forEach((d) => {
      totalRev += d.revenue;
      totalOrd += d.orders;
      if (d.revenue >= peakRev) {
        peakRev = d.revenue;
        peakRevTime = d.time;
      }
      if (d.orders >= peakOrd) {
        peakOrd = d.orders;
        peakOrdTime = d.time;
      }
    });

    return { totalRev, totalOrd, peakRev, peakRevTime, peakOrd, peakOrdTime };
  }, [realChartData]);

  // Real Operational Status Percentages
  const approvedPct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const pendingPct = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;
  const suspendedPct = totalCount > 0 ? Math.round((suspendedCount / totalCount) * 100) : 0;

  // Real Total Dishes in Catalog
  const totalDishesCount = useMemo(() => {
    return restaurants.reduce((acc, r) => acc + (r.product_count || 0), 0);
  }, [restaurants]);

  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());
  }, []);

  // Top tabs matching the vibrant orange tablet style
  const tabs = [
    { id: 'overview', label: 'Overview Hub', icon: Activity, count: null },
    { id: 'all', label: 'All Restaurants', icon: Store, count: totalCount },
    { id: 'applications', label: 'Pending Approvals', icon: Clock, count: pendingCount, alert: pendingCount > 0 },
    { id: 'documents', label: 'KYC & Verification', icon: FileText, count: pendingDocsCount || null },
    { id: 'managers', label: 'Restaurant Managers', icon: UserCheck, count: managers.length || null },
    { id: 'change_requests', label: 'Change Requests', icon: AlertCircle, count: pendingChangesCount || null },
    { id: 'suspended', label: 'Suspended Kitchens', icon: ShieldAlert, count: suspendedCount || null }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* 1. HERO HEADER (Tablet Design with Real Live Counts)            */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-ink-900 tracking-tight">
              Restaurant Management
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFF0E6] text-[#FF5A26] border border-[#FED7C2]">
              {approvedCount} Active Kitchen{approvedCount === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-500 mt-1 font-medium">
            Directory, partner verification, menu oversight, change requests, and operational status.
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
            onClick={() => {
              loadRestaurants();
              loadAnalytics();
              loadDocuments();
              loadManagers();
              loadChangeRequests();
            }}
            className="rounded-2xl border border-[#EFECE6] bg-white p-2 text-ink-600 hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2] transition shadow-xs cursor-pointer"
            title="Refresh Live Data"
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

      {/* ============================================================== */}
      {/* 2. 4 TOP KPI STAT CARDS (REAL DATA ONLY)                        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Platform Gross Revenue */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#FFF2EB] p-2 text-[#FF5A26]">
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Gross Sales</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-ink-900 tracking-tight">
                {money(realPlatformRevenue)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-ink-400">
                {realTotalOrders} completed order{realTotalOrders === 1 ? '' : 's'}
              </p>
            </div>
            <MiniSparkline color="#FF5A26" points={sparkRevenuePoints} />
          </div>
        </div>

        {/* Card 2: Total Kitchens */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#FFF2EB] p-2 text-[#FF5A26]">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Total Partners</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-ink-900 tracking-tight">{totalCount}</p>
              <p className="mt-1 text-[11px] font-medium text-ink-400">
                Registered food kitchens
              </p>
            </div>
            <MiniSparkline color="#FF5A26" points={sparkOrderPoints} />
          </div>
        </div>

        {/* Card 3: Approved & Operational */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Approved &amp; Open</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-ink-900 tracking-tight">{approvedCount}</p>
              <p className="mt-1 text-[11px] font-bold text-emerald-600">
                {totalCount > 0 ? `${approvedPct}% operational` : 'No partners yet'}
              </p>
            </div>
            <MiniSparkline color="#10B981" points={sparkOrderPoints} />
          </div>
        </div>

        {/* Card 4: Real Average Rating */}
        <div className="rounded-3xl border border-[#EFECE6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Star className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-ink-500">Average Rating</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-ink-900 tracking-tight">
                {realAvgRating ? `${realAvgRating} ★` : '—'}
              </p>
              <p className="mt-1 text-[11px] font-medium text-ink-400">
                {validRatings.length > 0 ? `Across ${validRatings.length} kitchen reviews` : 'Awaiting customer reviews'}
              </p>
            </div>
            <MiniSparkline color="#F59E0B" points={validRatings.length > 0 ? validRatings : [0, 0]} />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. NAVIGATION PILLS BAR                                         */}
      {/* ============================================================== */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'applications') setStatusFilter('pending');
                else if (tab.id === 'suspended') setStatusFilter('suspended');
                else if (tab.id === 'all') setStatusFilter('');
              }}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF5A26] to-[#FA4A0C] text-white shadow-sm shadow-orange-500/25 font-extrabold'
                  : 'bg-white border border-[#EFEBE4] text-ink-700 hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2]'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-ink-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  tab.alert
                    ? 'bg-amber-400 text-ink-950'
                    : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F4EFEA] text-ink-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 4. OVERVIEW HUB VIEW: REAL CHARTS & REAL DIRECTORY METRICS     */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: 7 OF 12 COLUMNS */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Revenue & Orders Trend Area Chart (Real API Series) */}
              <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="font-extrabold text-base text-ink-900 tracking-tight">
                      Revenue &amp; Orders Trend
                    </h3>
                    <p className="text-xs text-ink-500 mt-0.5">Live platform order volume from database ledger</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex rounded-xl bg-[#F8F5F0] p-1 border border-[#EFEBE4]">
                      {['today', 'week', 'month'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setTrendRange(range)}
                          className={`rounded-lg px-3 py-1 text-[11px] font-extrabold capitalize transition ${
                            trendRange === range
                              ? 'bg-white text-[#FF5A26] shadow-xs'
                              : 'text-ink-500 hover:text-ink-800'
                          }`}
                        >
                          {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
                        </button>
                      ))}
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold">
                      <span className="flex items-center gap-1.5 text-ink-700">
                        <span className="h-2 w-3 rounded-full bg-[#FF5A26]" /> Revenue (₦)
                      </span>
                      <span className="flex items-center gap-1.5 text-ink-700">
                        <span className="h-2 w-3 rounded-full bg-[#10B981]" /> Orders
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real Data Area Chart */}
                <div className="h-64 w-full">
                  {analyticsLoading ? (
                    <div className="h-full flex items-center justify-center"><Spinner /></div>
                  ) : realChartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#EFECE6] rounded-2xl">
                      <Store className="h-8 w-8 text-ink-300 mb-2" />
                      <p className="text-xs font-bold text-ink-700">No transactions recorded for this period</p>
                      <p className="text-[11px] text-ink-400 mt-0.5">Orders will plot automatically as customers checkout.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={realChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF5A26" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#FF5A26" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#A8A29E" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#A8A29E" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1C1917',
                            borderRadius: '16px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            padding: '8px 12px'
                          }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#FF5A26" strokeWidth={2.8} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2.4} fillOpacity={1} fill="url(#colorOrders)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Real Summary Metrics inside the card footer */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#F4EFEA]">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#FFF2EB] p-1.5 text-[#FF5A26]">
                      <DollarSign className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-400 uppercase">Period Revenue</p>
                      <p className="text-xs font-black text-ink-900">{money(chartSummary.totalRev)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#FFF2EB] p-1.5 text-[#FF5A26]">
                      <Utensils className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-400 uppercase">Period Orders</p>
                      <p className="text-xs font-black text-ink-900">{chartSummary.totalOrd}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
                      <Flame className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-400 uppercase">Peak Day Revenue</p>
                      <p className="text-xs font-black text-ink-900">
                        {money(chartSummary.peakRev)} {chartSummary.peakRevTime !== '—' && `(${chartSummary.peakRevTime})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#FFF2EB] p-1.5 text-[#FF5A26]">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-400 uppercase">Peak Day Volume</p>
                      <p className="text-xs font-black text-ink-900">
                        {chartSummary.peakOrd} orders {chartSummary.peakOrdTime !== '—' && `(${chartSummary.peakOrdTime})`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Top Performing Kitchens (Real Registered Partners) */}
              <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-ink-900 tracking-tight">
                      Top Performing Kitchens
                    </h3>
                    <p className="text-xs text-ink-500 mt-0.5">Ranked by fulfillment order volume</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="text-xs font-bold text-[#FF5A26] hover:text-[#E0450A] transition cursor-pointer"
                  >
                    View All Directory
                  </button>
                </div>

                <div className="space-y-3">
                  {realTopKitchens.length === 0 ? (
                    <div className="text-center py-8 text-xs text-ink-400">
                      No partner kitchens registered yet.
                    </div>
                  ) : (
                    realTopKitchens.map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => openDetail(item.id)}
                        className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#FBF9F7] transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                            idx === 0 ? 'bg-emerald-500 text-white' :
                            idx === 1 ? 'bg-amber-500 text-white' :
                            idx === 2 ? 'bg-orange-500 text-white' : 'bg-ink-300 text-white'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="h-10 w-10 rounded-xl overflow-hidden bg-ink-100 shrink-0 border border-[#EFEBE4]">
                            <img
                              src={item.logo_url ? assetUrl(item.logo_url) : FALLBACK_LOGO}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                            />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-ink-900">{item.name}</p>
                            <p className="text-[11px] text-ink-400 font-medium">
                              {item.cuisine || 'Restaurant'} &bull; {item.product_count ?? 0} dishes listed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-extrabold text-xs text-ink-900 block">
                            {item.order_count ?? 0} orders
                          </span>
                          <span className="text-[10px] font-bold text-amber-700">
                            {item.rating ? `${item.rating} ★` : '—'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 5 OF 12 COLUMNS */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Orders / Kitchens by Cuisine Donut (Real Data) */}
              <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-ink-900 tracking-tight">
                      Kitchens by Cuisine
                    </h3>
                    <p className="text-xs text-ink-500 mt-0.5">Active menu category share</p>
                  </div>
                  <span className="text-[11px] font-bold text-ink-500 bg-[#F8F5F0] px-2.5 py-1 rounded-xl border border-[#EFEBE4]">
                    All Kitchens
                  </span>
                </div>

                {realCuisineDistribution.length === 0 ? (
                  <div className="py-8 text-center text-xs text-ink-400">
                    No cuisine categories found.
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-6 py-2">
                    {/* Recharts Pie Donut */}
                    <div className="relative flex items-center justify-center h-36 w-36 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={realCuisineDistribution}
                            dataKey="count"
                            nameKey="cuisine"
                            innerRadius={42}
                            outerRadius={65}
                            paddingAngle={3}
                          >
                            {realCuisineDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="font-black text-xl text-ink-900 leading-none">{restaurants.length}</span>
                        <span className="text-[9px] font-bold text-ink-400 uppercase tracking-wider mt-0.5">Kitchens</span>
                      </div>
                    </div>

                    {/* Real Legend List */}
                    <div className="space-y-2 text-xs flex-1">
                      {realCuisineDistribution.map((item) => (
                        <div key={item.cuisine} className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 font-medium text-ink-700 truncate max-w-[120px]">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.cuisine}</span>
                          </span>
                          <span className="font-black text-ink-900 shrink-0">
                            {item.percent}% <span className="font-normal text-ink-400 text-[10px]">({item.count})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Category Spotlight Pill */}
                {realCuisineDistribution.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-orange-200/60 bg-[#FFF7F2] p-3 flex items-center gap-3">
                    <div className="rounded-xl bg-[#FF5A26] p-1.5 text-white shrink-0">
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="text-xs">
                      <p className="font-extrabold text-ink-900">Leading Cuisine</p>
                      <p className="text-[11px] text-ink-500">
                        {realCuisineDistribution[0]?.cuisine} represents {realCuisineDistribution[0]?.percent}% of partner kitchens.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Kitchen Operational Status Arc Gauge (Real Counts) */}
              <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-extrabold text-base text-ink-900 tracking-tight">
                      Kitchen Operational Status
                    </h3>
                    <p className="text-xs text-ink-500 mt-0.5">Partner compliance breakdown</p>
                  </div>
                  <span className="text-[11px] font-bold text-ink-500 bg-[#F8F5F0] px-2.5 py-1 rounded-xl border border-[#EFEBE4]">
                    Real-time
                  </span>
                </div>

                {/* Dynamic Segmented Status Bar */}
                <div className="py-4 space-y-3">
                  <div className="h-3 w-full rounded-full bg-[#F4EFEA] overflow-hidden flex">
                    {approvedCount > 0 && (
                      <div
                        style={{ width: `${approvedPct}%` }}
                        className="bg-emerald-500 h-full transition-all"
                        title={`Approved: ${approvedCount}`}
                      />
                    )}
                    {pendingCount > 0 && (
                      <div
                        style={{ width: `${pendingPct}%` }}
                        className="bg-amber-400 h-full transition-all"
                        title={`Pending: ${pendingCount}`}
                      />
                    )}
                    {suspendedCount > 0 && (
                      <div
                        style={{ width: `${suspendedPct}%` }}
                        className="bg-rose-500 h-full transition-all"
                        title={`Suspended: ${suspendedCount}`}
                      />
                    )}
                  </div>

                  {/* 3 Real Breakdown Cards Below */}
                  <div className="grid grid-cols-3 gap-2 w-full pt-1 text-center">
                    <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-2.5">
                      <span className="text-[10px] font-bold text-emerald-700 block">● {approvedPct}%</span>
                      <p className="font-black text-sm text-emerald-950 mt-0.5">{approvedCount}</p>
                      <p className="text-[10px] text-emerald-700/80 font-medium">Approved &amp; Open</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50/60 border border-amber-100 p-2.5">
                      <span className="text-[10px] font-bold text-amber-700 block">● {pendingPct}%</span>
                      <p className="font-black text-sm text-amber-950 mt-0.5">{pendingCount}</p>
                      <p className="text-[10px] text-amber-700/80 font-medium">Pending Review</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50/60 border border-rose-100 p-2.5">
                      <span className="text-[10px] font-bold text-rose-700 block">● {suspendedPct}%</span>
                      <p className="font-black text-sm text-rose-950 mt-0.5">{suspendedCount}</p>
                      <p className="text-[10px] text-rose-700/80 font-medium">Suspended</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Business Insights Card (Real Data) */}
              <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="rounded-xl bg-orange-100 p-1.5 text-[#FF5A26]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h3 className="font-extrabold text-base text-ink-900 tracking-tight">
                    Partner Governance Insights
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#F4EFEA]">
                  <div>
                    <span className="text-[10px] font-bold text-ink-400 uppercase">Top Partner</span>
                    <p className="font-black text-xs text-ink-900 mt-0.5 truncate">
                      {realTopKitchens[0]?.name || 'None registered'}
                    </p>
                    <p className="text-[10px] text-ink-400">
                      {realTopKitchens[0] ? `${realTopKitchens[0].order_count ?? 0} orders` : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-ink-400 uppercase">Total Menu Dishes</span>
                    <p className="font-black text-xs text-ink-900 mt-0.5">
                      {totalDishesCount} dishes
                    </p>
                    <p className="text-[10px] text-ink-400">Listed across kitchens</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-ink-400 uppercase">KYC Compliance</span>
                    <p className="font-black text-xs text-ink-900 mt-0.5">
                      {pendingDocsCount > 0 ? `${pendingDocsCount} in queue` : 'All audited'}
                    </p>
                    <p className="text-[10px] text-ink-400">Business &amp; health permits</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-ink-400 uppercase">Profile Changes</span>
                    <p className="font-black text-xs text-ink-900 mt-0.5">
                      {pendingChangesCount > 0 ? `${pendingChangesCount} waiting` : 'Zero pending'}
                    </p>
                    <p className="text-[10px] text-ink-400">Address/hours edits</p>
                  </div>
                </div>

                {/* Live Platform Status Banner */}
                <div className="mt-4 rounded-2xl bg-[#FFFBF8] border border-[#F2EDE4] p-3 text-center">
                  <p className="text-xs font-bold text-ink-800">
                    {approvedCount > 0
                      ? `${approvedCount} of ${totalCount} kitchen${totalCount === 1 ? '' : 's'} are live and accepting customer orders.`
                      : 'No kitchens currently approved for ordering.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. RESTAURANTS DIRECTORY & FILTERS (LIVE REAL DATA)             */}
      {/* ============================================================== */}
      {(activeTab === 'overview' || activeTab === 'all' || activeTab === 'applications' || activeTab === 'suspended') && (
        <div className="space-y-4 pt-2">
          {/* Header row for Directory Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-lg text-ink-900 tracking-tight">
                {activeTab === 'applications'
                  ? 'Pending Restaurant Applications'
                  : activeTab === 'suspended'
                    ? 'Suspended Partner Kitchens'
                    : 'Live Restaurant Directory'}
              </h3>
              <p className="text-xs text-ink-500 font-medium mt-0.5">
                Search, filter, view 360° details, review KYC, and manage operational status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink-500">
                Showing {restaurants.length} {restaurants.length === 1 ? 'kitchen' : 'kitchens'}
              </span>
            </div>
          </div>

          {/* Action Callout if Pending Applications Exist */}
          {pendingCount > 0 && (activeTab === 'overview' || activeTab === 'all') && (
            <div className="rounded-3xl border border-amber-300 bg-amber-50/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white font-black shadow-xs">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-950">
                    {pendingCount} Restaurant {pendingCount === 1 ? 'Application' : 'Applications'} Awaiting Review
                  </h4>
                  <p className="text-xs text-amber-800 font-medium mt-0.5">
                    Partner restaurants cannot receive customer orders until reviewed and approved.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('applications');
                  setStatusFilter('pending');
                }}
                className="py-2.5 px-4.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto"
              >
                <span>Review Applications</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="rounded-3xl border border-[#EFECE6] bg-white p-4.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <form onSubmit={(e) => { e.preventDefault(); loadRestaurants(); }} className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search by restaurant name, owner, cuisine, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] pl-10 pr-4 py-2.5 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-[#FF5A26] focus:bg-white focus:outline-hidden transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-ink-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-2xl border border-[#EFEBE4] bg-white px-3.5 py-2 text-xs font-bold text-ink-700 shadow-xs focus:border-[#FF5A26] focus:outline-hidden cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="approved">Approved &amp; Active</option>
                  <option value="pending">Pending Approval</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-[#FF5A26] hover:bg-[#E0450A] text-white py-2 px-5 text-xs font-bold shadow-xs shadow-orange-500/20 cursor-pointer transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Restaurants Directory List */}
          {loading ? (
            <div className="p-12"><Spinner /></div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#EFECE6] rounded-3xl bg-white shadow-xs">
              <Store className="h-10 w-10 text-ink-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-ink-700">No restaurants found</p>
              <p className="text-[11px] text-ink-400 mt-0.5">Try clearing your search filter or adding a new kitchen.</p>
            </div>
          ) : (
            <div className="rounded-3xl overflow-hidden border border-[#EFECE6] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] divide-y divide-[#F4EFEA]">
              {restaurants.map((r) => (
                <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FFFBF8] transition">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-ink-100 overflow-hidden shrink-0 border border-[#EFEBE4] shadow-xs">
                      <img
                        src={r.logo_url ? assetUrl(r.logo_url) : FALLBACK_LOGO}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm text-ink-950 tracking-tight">{r.name}</h4>
                        <Badge status={r.status} />
                        {r.rating && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{r.rating}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#FF5A26]">
                        {[r.cuisine, r.city || 'Accra', r.address].filter(Boolean).join(' • ')}
                      </p>
                      <p className="text-[11px] text-ink-500 flex flex-wrap items-center gap-3 pt-0.5 font-medium">
                        <span>Owner: <strong className="text-ink-800">{r.owner_name}</strong></span>
                        <span>Email: <span className="font-mono text-ink-600">{r.owner_email}</span></span>
                        <span>Dishes: <strong className="text-ink-800">{r.product_count ?? 0}</strong></span>
                        <span>Orders: <strong className="text-ink-800">{r.order_count ?? 0}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => openDetail(r.id)}
                      className="rounded-xl border border-[#EFEBE4] bg-[#FBF9F7] hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2] py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </button>

                    {r.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => setActionModal({ open: true, restaurant: r, action: 'approve', note: '' })}
                        className="py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}

                    {r.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => setActionModal({ open: true, restaurant: r, action: 'suspend', note: '' })}
                        className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 py-2 px-3.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" /> Suspend
                      </button>
                    )}

                    {r.status === 'suspended' && (
                      <button
                        type="button"
                        onClick={() => setActionModal({ open: true, restaurant: r, action: 'activate', note: '' })}
                        className="py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Reinstate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. KYC & DOCUMENT VERIFICATION TAB                             */}
      {/* ============================================================== */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div>
              <h3 className="font-black text-base text-ink-950">Restaurant Compliance Documents</h3>
              <p className="text-xs text-ink-500 mt-0.5">
                Business registration certificates, food safety inspection licenses, and health permits
              </p>
            </div>

            {docsLoading ? (
              <Spinner />
            ) : documents.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#EFECE6] rounded-2xl bg-[#FBF9F7]">
                <FileText className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-ink-700">No compliance documents submitted</p>
                <p className="text-[11px] text-ink-400 mt-0.5">Partner documents will appear here once submitted by restaurant managers.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#EFEBE4]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF9F7] border-b border-[#EFEBE4] font-bold text-ink-600">
                    <tr>
                      <th className="py-3 px-4">Restaurant</th>
                      <th className="py-3 px-4">Document Type</th>
                      <th className="py-3 px-4">Submitted By</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEA]">
                    {documents.map((d) => (
                      <tr key={d.id} className="hover:bg-[#FFFBF8] transition">
                        <td className="py-3 px-4 font-bold text-ink-950">{d.restaurant_name}</td>
                        <td className="py-3 px-4 font-mono uppercase text-ink-700">{d.document_type || 'License'}</td>
                        <td className="py-3 px-4 text-ink-600">{d.owner_name}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                            d.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {d.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {d.document_url && (
                            <a
                              href={assetUrl(d.document_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#FF5A26] hover:text-[#E0450A] font-bold"
                            >
                              <span>View File</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setDocReviewModal({ open: true, doc: d, status: 'verified', note: '' })}
                            className="rounded-xl border border-[#EFEBE4] bg-[#FBF9F7] py-1 px-3 text-[11px] font-bold hover:bg-[#FFF4ED] hover:text-[#FF5A26] transition"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. RESTAURANT MANAGERS TAB                                     */}
      {/* ============================================================== */}
      {activeTab === 'managers' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div>
              <h3 className="font-black text-base text-ink-950">Restaurant Manager Accounts</h3>
              <p className="text-xs text-ink-500 mt-0.5">Authorized operators and branch kitchen personnel</p>
            </div>

            {managersLoading ? (
              <Spinner />
            ) : managers.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#EFECE6] rounded-2xl bg-[#FBF9F7]">
                <UserCheck className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-ink-700">No managers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#EFEBE4]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF9F7] border-b border-[#EFEBE4] font-bold text-ink-600">
                    <tr>
                      <th className="py-3 px-4">Manager Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Assigned Restaurant</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEA]">
                    {managers.map((m) => (
                      <tr key={m.id} className="hover:bg-[#FFFBF8] transition">
                        <td className="py-3 px-4 font-bold text-ink-950">{m.name}</td>
                        <td className="py-3 px-4 text-ink-600">
                          <div>{m.email}</div>
                          <div className="text-[11px] text-ink-400 font-mono">{m.phone || 'No phone'}</div>
                        </td>
                        <td className="py-3 px-4">
                          {m.restaurant_name ? (
                            <span className="font-bold text-ink-900">{m.restaurant_name}</span>
                          ) : (
                            <span className="text-ink-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                            m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-ink-100 text-ink-700'
                          }`}>
                            {m.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-ink-500 text-[11px]">
                          {when(m.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. PROFILE CHANGE REQUESTS TAB                                 */}
      {/* ============================================================== */}
      {activeTab === 'change_requests' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div>
              <h3 className="font-black text-base text-ink-950">Restaurant Profile Change Requests</h3>
              <p className="text-xs text-ink-500 mt-0.5">Requested updates to restaurant brand name, address, cuisine, or hours</p>
            </div>

            {changesLoading ? (
              <Spinner />
            ) : changeRequests.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#EFECE6] rounded-2xl bg-[#FBF9F7]">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-ink-700">All change requests resolved</p>
                <p className="text-[11px] text-ink-400 mt-0.5">No pending profile changes need admin review.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F4EFEA]">
                {changeRequests.map((req) => (
                  <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-ink-950">{req.restaurant_name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-ink-600">
                        Requested fields: <strong className="font-mono text-ink-900">{JSON.stringify(req.changes)}</strong>
                      </p>
                      <p className="text-[11px] text-ink-400">Submitted {when(req.created_at)}</p>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setChangeModal({ open: true, request: req, action: 'approve', note: '' })}
                          className="py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          Approve Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setChangeModal({ open: true, request: req, action: 'reject', note: '' })}
                          className="py-1.5 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. RESTAURANT DETAIL MODAL (360° VIEW)                         */}
      {/* ============================================================== */}
      {selectedRestaurantId && (
        <Modal
          title={restaurantDetail ? restaurantDetail.restaurant.name : 'Loading Restaurant Details…'}
          onClose={() => setSelectedRestaurantId(null)}
        >
          {detailLoading || !restaurantDetail ? (
            <div className="py-8"><Spinner /></div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FBF9F7] border border-[#EFEBE4]">
                <div className="h-16 w-16 rounded-xl bg-white overflow-hidden shrink-0 border border-[#EFEBE4] shadow-xs">
                  <img
                    src={restaurantDetail.restaurant.logo_url ? assetUrl(restaurantDetail.restaurant.logo_url) : FALLBACK_LOGO}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                  />
                </div>
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm text-ink-950">{restaurantDetail.restaurant.name}</h3>
                    <Badge status={restaurantDetail.restaurant.status} />
                  </div>
                  <p className="text-ink-600 font-semibold">{restaurantDetail.restaurant.cuisine} · {restaurantDetail.restaurant.city}</p>
                  <p className="text-ink-500 text-[11px] flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-ink-400" />
                    <span>{restaurantDetail.restaurant.address || 'Address not listed'}</span>
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-ink-600">
                    <span>Owner: <strong>{restaurantDetail.restaurant.owner_name}</strong></span>
                    <span>Email: <span className="font-mono">{restaurantDetail.restaurant.owner_email}</span></span>
                    <span>Phone: <span className="font-mono">{restaurantDetail.restaurant.owner_phone}</span></span>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-[#EFEBE4] bg-white text-center">
                  <span className="text-[10px] font-bold text-ink-400 uppercase block">Gross Sales</span>
                  <span className="font-mono font-bold text-sm text-ink-900">{money(restaurantDetail.restaurant.gross_sales || 0)}</span>
                </div>
                <div className="p-3 rounded-xl border border-[#EFEBE4] bg-white text-center">
                  <span className="text-[10px] font-bold text-ink-400 uppercase block">Completed Orders</span>
                  <span className="font-bold text-sm text-ink-900">{restaurantDetail.restaurant.completed_orders || 0}</span>
                </div>
                <div className="p-3 rounded-xl border border-[#EFEBE4] bg-white text-center">
                  <span className="text-[10px] font-bold text-ink-400 uppercase block">Dishes in Menu</span>
                  <span className="font-bold text-sm text-ink-900">{restaurantDetail.products?.length || 0}</span>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="flex border-b border-[#EFEBE4] gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDetailTab('menu')}
                  className={`pb-2 border-b-2 transition ${detailTab === 'menu' ? 'border-[#FF5A26] text-[#FF5A26] font-black' : 'border-transparent text-ink-500'}`}
                >
                  Menu Dishes ({restaurantDetail.products?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('orders')}
                  className={`pb-2 border-b-2 transition ${detailTab === 'orders' ? 'border-[#FF5A26] text-[#FF5A26] font-black' : 'border-transparent text-ink-500'}`}
                >
                  Recent Orders ({restaurantDetail.recent_orders?.length || 0})
                </button>
              </div>

              {/* Tab: Menu */}
              {detailTab === 'menu' && (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {restaurantDetail.products?.length === 0 ? (
                    <p className="text-center py-6 text-xs text-ink-400">No dishes in menu yet.</p>
                  ) : (
                    restaurantDetail.products?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[#EFEBE4] bg-[#FBF9F7] text-xs">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-white shrink-0">
                            <img
                              src={item.image_url ? assetUrl(item.image_url) : FALLBACK_LOGO}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-ink-900">{item.name}</p>
                            <p className="text-[11px] text-ink-500">{item.category_name || 'Standard'}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-ink-900">{money(item.price)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Orders */}
              {detailTab === 'orders' && (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {restaurantDetail.recent_orders?.length === 0 ? (
                    <p className="text-center py-6 text-xs text-ink-400">No orders for this restaurant.</p>
                  ) : (
                    restaurantDetail.recent_orders?.map((ord) => (
                      <div key={ord.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[#EFEBE4] bg-[#FBF9F7] text-xs">
                        <div>
                          <p className="font-bold text-ink-900">Order #{ord.id.slice(0, 8)}</p>
                          <p className="text-[11px] text-ink-500">{when(ord.created_at)} · {ord.status}</p>
                        </div>
                        <span className="font-mono font-bold text-ink-900">{money(ord.total)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 10. ACTION MODAL (Approve / Reject / Suspend / Reinstate)       */}
      {/* ============================================================== */}
      {actionModal.open && (
        <Modal
          title={`Confirm ${actionModal.action.toUpperCase()} - ${actionModal.restaurant?.name}`}
          onClose={() => setActionModal({ open: false, restaurant: null, action: 'approve', note: '' })}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <p className="text-xs text-ink-600">
              Are you sure you want to <strong>{actionModal.action}</strong> this restaurant?
              {actionModal.action === 'approve' && ' The restaurant will immediately go live and be able to receive customer orders.'}
              {actionModal.action === 'suspend' && ' The restaurant will be hidden from the customer app and orders halted.'}
              {actionModal.action === 'activate' && ' The restaurant will be restored to active operational standing.'}
            </p>

            {(actionModal.action === 'reject' || actionModal.action === 'suspend') && (
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1">
                  Reason for {actionModal.action} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={actionModal.note}
                  onChange={(e) => setActionModal({ ...actionModal, note: e.target.value })}
                  placeholder={`Explain why this partner is being ${actionModal.action}ed...`}
                  className="w-full rounded-xl border border-[#EFEBE4] p-3 text-xs focus:border-[#FF5A26] focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModal({ open: false, restaurant: null, action: 'approve', note: '' })}
                className="rounded-xl border border-[#EFEBE4] px-4 py-2 text-xs font-bold text-ink-600 hover:bg-[#FBF9F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-xs transition ${
                  actionModal.action === 'approve' || actionModal.action === 'activate'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submittingAction ? 'Processing…' : `Confirm ${actionModal.action}`}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 11. DOCUMENT REVIEW MODAL                                      */}
      {/* ============================================================== */}
      {docReviewModal.open && (
        <Modal
          title={`Review KYC Document: ${docReviewModal.doc?.document_type || 'License'}`}
          onClose={() => setDocReviewModal({ open: false, doc: null, status: 'verified', note: '' })}
        >
          <form onSubmit={handleDocReview} className="space-y-4">
            <div className="rounded-xl bg-[#FBF9F7] p-3 text-xs space-y-1 border border-[#EFEBE4]">
              <p><strong>Restaurant:</strong> {docReviewModal.doc?.restaurant_name}</p>
              <p><strong>Submitted by:</strong> {docReviewModal.doc?.owner_name}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 mb-1">Verification Decision</label>
              <select
                value={docReviewModal.status}
                onChange={(e) => setDocReviewModal({ ...docReviewModal, status: e.target.value })}
                className="w-full rounded-xl border border-[#EFEBE4] p-2.5 text-xs font-bold"
              >
                <option value="verified">Verified (Approved)</option>
                <option value="rejected">Rejected (Needs resubmission)</option>
                <option value="pending">Pending Further Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 mb-1">Auditor Note</label>
              <textarea
                rows={3}
                value={docReviewModal.note}
                onChange={(e) => setDocReviewModal({ ...docReviewModal, note: e.target.value })}
                placeholder="Optional compliance review notes..."
                className="w-full rounded-xl border border-[#EFEBE4] p-3 text-xs focus:border-[#FF5A26] focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocReviewModal({ open: false, doc: null, status: 'verified', note: '' })}
                className="rounded-xl border border-[#EFEBE4] px-4 py-2 text-xs font-bold text-ink-600 hover:bg-[#FBF9F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#FF5A26] hover:bg-[#E0450A] px-5 py-2 text-xs font-bold text-white shadow-xs"
              >
                Save Decision
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 12. CHANGE REQUEST REVIEW MODAL                                */}
      {/* ============================================================== */}
      {changeModal.open && (
        <Modal
          title={`Review Profile Change: ${changeModal.request?.restaurant_name}`}
          onClose={() => setChangeModal({ open: false, request: null, action: 'approve', note: '' })}
        >
          <form onSubmit={handleChangeReview} className="space-y-4">
            <div className="rounded-xl bg-[#FBF9F7] p-3 text-xs space-y-1.5 border border-[#EFEBE4]">
              <p><strong>Restaurant:</strong> {changeModal.request?.restaurant_name}</p>
              <p><strong>Proposed Modifications:</strong></p>
              <pre className="p-2 rounded bg-white border border-[#EFEBE4] font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(changeModal.request?.changes, null, 2)}
              </pre>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 mb-1">Decision</label>
              <div className="flex gap-4 text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="changeAction"
                    value="approve"
                    checked={changeModal.action === 'approve'}
                    onChange={() => setChangeModal({ ...changeModal, action: 'approve' })}
                  />
                  <span>Approve &amp; Apply Changes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="changeAction"
                    value="reject"
                    checked={changeModal.action === 'reject'}
                    onChange={() => setChangeModal({ ...changeModal, action: 'reject' })}
                  />
                  <span className="text-rose-600">Reject Request</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 mb-1">Reviewer Note</label>
              <textarea
                rows={2}
                value={changeModal.note}
                onChange={(e) => setChangeModal({ ...changeModal, note: e.target.value })}
                placeholder="Optional response sent to restaurant manager..."
                className="w-full rounded-xl border border-[#EFEBE4] p-3 text-xs focus:border-[#FF5A26] focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChangeModal({ open: false, request: null, action: 'approve', note: '' })}
                className="rounded-xl border border-[#EFEBE4] px-4 py-2 text-xs font-bold text-ink-600 hover:bg-[#FBF9F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#FF5A26] hover:bg-[#E0450A] px-5 py-2 text-xs font-bold text-white shadow-xs"
              >
                Submit Review
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
