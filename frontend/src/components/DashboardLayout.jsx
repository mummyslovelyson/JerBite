import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LogOut, Menu, X, Bell, ChevronDown, ChevronRight, User, Settings,
  Shield, CheckCircle, Store, ExternalLink, Search, UtensilsCrossed,
  Sparkles, Activity, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title, sections, links, base }) {
  const { user, restaurant, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Normalize links or sections
  const normalizedSections = useMemo(() => {
    if (sections && sections.length > 0) return sections;
    if (links && links.length > 0) {
      // Group flat links by their 'group' property
      const map = new Map();
      links.forEach((item) => {
        const g = item.group || 'General';
        if (!map.has(g)) {
          map.set(g, {
            title: g,
            icon: item.icon,
            to: item.to,
            key: g.toLowerCase().replace(/\s+/g, '-'),
            items: []
          });
        }
        map.get(g).items.push(item);
      });
      return Array.from(map.values());
    }
    return [];
  }, [sections, links]);

  // Determine active section based on current location
  const activeSection = useMemo(() => {
    return normalizedSections.find((sec) => {
      // Exact match for root paths
      if (sec.to === '/admin' || sec.to === '/manager' || sec.to === '/rider') {
        return location.pathname === sec.to;
      }
      // Check if current path matches or starts with sec.to
      if (sec.to && (location.pathname === sec.to || location.pathname.startsWith(sec.to + '/'))) {
        return true;
      }
      // Check children
      return sec.items?.some((item) =>
        item.end ? location.pathname === item.to : (location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
      );
    });
  }, [location.pathname, normalizedSections]);

  // Filter sections by search text if admin uses the search box
  const displayedSections = useMemo(() => {
    if (!filterText.trim()) return normalizedSections;
    const q = filterText.toLowerCase().trim();
    return normalizedSections.filter((sec) => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchChildren = sec.items?.some((item) => item.label.toLowerCase().includes(q));
      return matchTitle || matchChildren;
    });
  }, [normalizedSections, filterText]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine active page label for top header
  const currentTitle = useMemo(() => {
    for (const sec of normalizedSections) {
      for (const item of sec.items || []) {
        if (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)) {
          return item.label;
        }
      }
    }
    return activeSection?.title || 'Dashboard';
  }, [location.pathname, normalizedSections, activeSection]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'A';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBF9F7] text-ink-900 antialiased">
      {/* FIXED SIDEBAR (CONCISE, REDUCED, INSPIRATION-ALIGNED) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex-col border-r border-[#EFECE6] bg-white transition-transform duration-200 ease-in-out lg:static lg:flex lg:translate-x-0 ${
          mobileOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'
        }`}
      >
        {/* 1. Sidebar Brand Header */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[#F4EFEA] px-5">
          <Link to={base} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EA4A0F] to-[#FF6B3D] text-white shadow-md shadow-orange-500/25">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-ink-900 tracking-tight">JerBite</span>
                <span className="rounded-full bg-[#FFF0E6] px-2 py-0.5 text-[10px] font-bold text-[#E0450A]">
                  Admin
                </span>
              </div>
              <p className="text-[11px] font-semibold text-ink-500">Smart Food Platform</p>
            </div>
          </Link>
          <button
            className="rounded-xl p-1.5 text-ink-500 hover:bg-ink-100 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Manager Restaurant Pill (for manager view) */}
        {user?.role === 'manager' && restaurant && (
          <div className="mx-3.5 mt-3 rounded-2xl border border-[#F0EAE1] bg-[#FFFBF8] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                My Restaurant
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  restaurant.is_open ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${restaurant.is_open ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {restaurant.is_open ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="mt-1 font-bold text-sm text-ink-900 truncate" title={restaurant.name}>
              {restaurant.name}
            </p>
            {restaurant.cuisine && (
              <p className="text-[11px] text-ink-500 truncate">{restaurant.cuisine}</p>
            )}
          </div>
        )}

        {/* 2. Streamlined Top-Level Navigation (Clean & uncluttered matching the inspiration tablet) */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3.5 py-4 scrollbar-thin">
          {displayedSections.map((sec) => {
            const SectionIcon = sec.icon || Store;
            const targetUrl = sec.to || sec.items?.[0]?.to || base;
            const isSectionActive = activeSection?.title === sec.title;

            return (
              <NavLink
                key={sec.title}
                to={targetUrl}
                end={sec.end ?? (targetUrl === '/admin' || targetUrl === '/manager' || targetUrl === '/rider')}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isSectionActive
                    ? 'bg-gradient-to-r from-[#FF5A26] to-[#FA4A0C] text-white shadow-sm shadow-orange-500/25 font-extrabold'
                    : 'text-ink-700 hover:bg-[#F9F6F2] hover:text-ink-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <SectionIcon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      isSectionActive ? 'text-white' : 'text-ink-500 group-hover:text-ink-900'
                    }`}
                  />
                  <span className="truncate text-xs font-bold tracking-tight">
                    {sec.title}
                  </span>
                </div>
                {sec.items && sec.items.length > 1 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                      isSectionActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F4EFEA] text-ink-500'
                    }`}
                  >
                    {sec.items.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* 3. Bottom Sidebar Card (Inspired by the "Upgrade to Pro" card) */}
        <div className="p-3.5 shrink-0">
          <div className="rounded-2xl border border-[#FED7C2]/80 bg-gradient-to-b from-[#FFF7F2] to-[#FEEDEC] p-3.5 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="rounded-xl bg-[#FF5A26] p-1.5 text-white shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-xs text-ink-900">Platform Control</span>
            </div>
            <p className="text-[11px] text-ink-600 leading-tight">
              12 management modules &amp; 75 dedicated pages live.
            </p>
            <Link
              to="/admin/system/health"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF5A26] px-3 py-2 text-xs font-bold text-white shadow-xs shadow-orange-500/25 hover:bg-[#E0450A] transition"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>System Health</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* RIGHT MAIN VIEWPORT */}
      <div className="flex flex-1 flex-col h-screen min-w-0 overflow-hidden">
        {/* FIXED TOP HEADER */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#EFECE6] bg-white px-5 sm:px-8 z-20">
          <div className="flex items-center gap-4">
            <button
              className="rounded-xl p-2 text-ink-600 hover:bg-[#F9F7F4] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-black text-xl sm:text-2xl text-ink-900 tracking-tight leading-none">
                {currentTitle}
              </h1>
              <p className="text-[11px] font-semibold text-ink-400 mt-0.5 hidden sm:block">
                {activeSection?.title || 'JerBite Admin'} &bull; Overview Management
              </p>
            </div>
          </div>

          {/* Top Bar Center/Right */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search food, orders, customers..."
                className="w-64 lg:w-80 rounded-full border border-[#EFEBE4] bg-[#FBF9F7] py-2.5 pl-10 pr-4 text-xs font-medium placeholder:text-ink-400 focus:border-[#FF5A26] focus:bg-white focus:outline-hidden transition"
              />
            </div>

            {/* Notification Bell */}
            <Link
              to={`${base}/notifications`}
              aria-label="Notifications"
              className="relative rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] p-2.5 text-ink-700 hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2] transition"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4747] text-[9px] font-black text-white shadow-xs">
                3
              </span>
            </Link>

            {/* Settings Gear */}
            <Link
              to="/admin/settings/platform"
              aria-label="Settings"
              className="rounded-2xl border border-[#EFEBE4] bg-[#FBF9F7] p-2.5 text-ink-700 hover:bg-[#FFF4ED] hover:text-[#FF5A26] hover:border-[#FED7C2] transition hidden sm:inline-flex"
            >
              <Settings className="h-4.5 w-4.5" />
            </Link>

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-3 rounded-2xl border p-1.5 pr-3 transition ${
                  userDropdownOpen
                    ? 'border-[#FF5A26] bg-[#FFF2EB]'
                    : 'border-[#EFEBE4] bg-white hover:bg-[#FBF9F7]'
                }`}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#EA4A0F] to-[#FF6B3D] font-extrabold text-white text-xs shadow-xs">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="font-extrabold text-xs text-ink-900 leading-tight truncate max-w-[130px]">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-[10px] font-semibold text-ink-400 capitalize">
                    {user?.role === 'admin' ? 'Super Admin' : user?.role || 'Staff'}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#EFEBE4] bg-white p-2 shadow-xl z-50 animate-scale-in">
                  <div className="border-b border-[#F4EFEA] px-3 py-2.5">
                    <p className="font-extrabold text-xs text-ink-900 truncate">{user?.name}</p>
                    <p className="text-[11px] font-medium text-ink-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to={`${base}/account`}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-[#FBF9F7] transition"
                    >
                      <User className="h-4 w-4 text-ink-400" />
                      My Profile
                    </Link>
                    <Link
                      to="/admin/settings/platform"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-[#FBF9F7] transition"
                    >
                      <Settings className="h-4 w-4 text-ink-400" />
                      Platform Settings
                    </Link>
                    <Link
                      to="/"
                      target="_blank"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-[#FBF9F7] transition"
                    >
                      <ExternalLink className="h-4 w-4 text-ink-400" />
                      View Customer Store
                    </Link>
                  </div>
                  <div className="border-t border-[#F4EFEA] pt-1">
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FBF9F7]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
