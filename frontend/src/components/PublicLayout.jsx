import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, User, Store, Bike, ShieldCheck, Heart,
  Phone, Mail, MapPin, Sparkles, Search, ChevronDown,
  HelpCircle, LogOut, FileText, Compass, Utensils, Tag,
  ExternalLink, Menu, X
} from 'lucide-react';
import { useAuth, homeFor } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('delivery'); // 'delivery' or 'pickup'
  const [selectedLocation, setSelectedLocation] = useState('Central Accra, Greater Accra');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const isCustomer = user?.role === 'customer';

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-900 antialiased font-sans">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-ink-200/90 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Left Side: Logo & Main Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-black text-xl shadow-xs">
                J
              </span>
              <div className="leading-tight">
                <span className="font-black text-2xl tracking-tight text-ink-950">JerBite</span>
                <span className="hidden sm:inline-block ml-1.5 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                  Foods
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-5 text-sm font-bold text-ink-700">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'text-brand-600 font-extrabold' : 'hover:text-brand-600'}>
                Home
              </NavLink>
              <a href="/#restaurants" className="hover:text-brand-600 transition">
                Restaurants
              </a>
              <a href="/#popular-food" className="hover:text-brand-600 transition">
                Browse Food
              </a>
              <a href="/#offers" className="hover:text-brand-600 transition flex items-center gap-1 text-rose-600">
                <Sparkles className="h-3.5 w-3.5" /> Offers
              </a>
            </nav>
          </div>

          {/* Center Area: Search Bar & Location Selector */}
          <div className="hidden md:flex flex-1 max-w-xl items-center gap-2">
            {/* Search */}
            <form onSubmit={handleGlobalSearch} className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food or restaurants"
                className="w-full rounded-xl border border-ink-200 bg-ink-100/70 py-2 pl-9 pr-3 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </form>

            {/* Location & Mode Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-ink-100/70 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-white transition"
              >
                <MapPin className="h-3.5 w-3.5 text-brand-600" />
                <span className="max-w-[120px] truncate">{deliveryMode === 'delivery' ? 'Delivery' : 'Pickup'}: {selectedLocation.split(',')[0]}</span>
                <ChevronDown className="h-3 w-3 text-ink-400" />
              </button>

              {showLocationPicker && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-ink-200 bg-white p-3 shadow-xl z-50 animate-scale-in">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">Fulfillment Mode</p>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-ink-100 rounded-xl mb-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode('delivery')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition ${deliveryMode === 'delivery' ? 'bg-white shadow-xs text-brand-700' : 'text-ink-600'}`}
                    >
                      Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode('pickup')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition ${deliveryMode === 'pickup' ? 'bg-white shadow-xs text-brand-700' : 'text-ink-600'}`}
                    >
                      Choose Pickup
                    </button>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1">Preset Locations</p>
                  {['Central Accra, Greater Accra', 'Airport Residential, Accra', 'East Legon, Accra', 'Osu & Cantonments, Accra'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => { setSelectedLocation(loc); setShowLocationPicker(false); }}
                      className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs text-ink-700 hover:bg-ink-100 font-medium transition"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Help, Auth Actions, Basket */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/#help"
              className="hidden sm:flex items-center gap-1 rounded-xl p-2 text-xs font-bold text-ink-600 hover:bg-ink-100 transition"
              title="Help & FAQ"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Link>

            {/* BASKET ICON (Always visible, preserves items) */}
            <Link
              to="/cart"
              className="relative rounded-xl p-2 text-ink-700 hover:bg-ink-100 transition"
              aria-label="Shopping Basket"
            >
              <ShoppingBag className="h-6 w-6 text-ink-800" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-black text-white shadow-xs animate-scale-in">
                  {count}
                </span>
              )}
            </Link>

            {/* AUTH ACTIONS */}
            {user ? (
              <div className="flex items-center gap-2">
                {isCustomer ? (
                  <>
                    <NavLink
                      to="/account/orders"
                      className="hidden sm:inline-flex rounded-xl px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100 transition"
                    >
                      My Orders
                    </NavLink>
                    <NavLink
                      to="/account/profile"
                      className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-800 shadow-xs hover:border-brand-500 transition"
                    >
                      <User className="h-3.5 w-3.5 text-brand-600" />
                      <span className="max-w-[100px] truncate">{user.name}</span>
                    </NavLink>
                  </>
                ) : (
                  <Link
                    to={homeFor(user.role)}
                    className="btn-primary py-2 px-3.5 text-xs font-bold shadow-xs"
                  >
                    Go to Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="rounded-xl p-2 text-xs font-bold text-ink-600 hover:bg-ink-100 hover:text-rose-600 transition"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-xl px-3.5 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary py-2 px-4 text-xs font-bold shadow-xs"
                >
                  Create account
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={handleGlobalSearch} className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food or restaurants"
              className="w-full rounded-xl border border-ink-200 bg-ink-100/70 py-2 pl-9 pr-3 text-xs text-ink-900 focus:outline-none"
            />
          </form>
        </div>

        {/* Mobile dropdown navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-ink-200 bg-white px-4 py-3 space-y-2 lg:hidden">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-bold text-ink-800">Home</Link>
            <a href="/#restaurants" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-bold text-ink-800">Restaurants</a>
            <a href="/#popular-food" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-bold text-ink-800">Browse Food</a>
            <a href="/#offers" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-bold text-rose-600">Offers & Deals</a>
            <a href="/#help" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-bold text-ink-600">Help & FAQs</a>
            {!user && (
              <div className="pt-2 border-t border-ink-100 flex gap-2">
                <Link to="/login" className="flex-1 text-center py-2 text-xs font-bold border border-ink-200 rounded-xl">Sign in</Link>
                <Link to="/register" className="flex-1 text-center py-2 text-xs font-bold bg-brand-600 text-white rounded-xl">Create account</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* COMPREHENSIVE FOOTER */}
      <footer className="border-t border-ink-200 bg-ink-950 text-white pt-16 pb-12 antialiased">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Col 1: Brand */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-black text-xl shadow-xs">
                  J
                </span>
                <span className="font-black text-2xl tracking-tight text-white">JerBite</span>
              </Link>
              <p className="mt-4 text-xs leading-relaxed text-ink-400 max-w-sm">
                Good food, delivered your way. Fresh dishes from verified local kitchens and top restaurants delivered right to your doorstep.
              </p>
              <div className="mt-6 flex items-center gap-4 text-ink-400">
                <span className="text-xs">&copy; {new Date().getFullYear()} JerBite Inc. All rights reserved.</span>
              </div>
            </div>

            {/* Col 2: About & Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-200 mb-4">Support & Help</h4>
              <ul className="space-y-2.5 text-xs text-ink-400">
                <li><a href="/#about" className="hover:text-white transition">About JerBite</a></li>
                <li><a href="/#help" className="hover:text-white transition">Help & FAQs</a></li>
                <li><a href="/#contact" className="hover:text-white transition">Contact & Support</a></li>
                <li><a href="/#delivery-info" className="hover:text-white transition">Delivery & Pickup Info</a></li>
              </ul>
            </div>

            {/* Col 3: Legal & Trust */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-200 mb-4">Policies</h4>
              <ul className="space-y-2.5 text-xs text-ink-400">
                <li><a href="/#terms" className="hover:text-white transition">Terms & Conditions</a></li>
                <li><a href="/#privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/#safety" className="hover:text-white transition">Food Safety Standards</a></li>
                <li><a href="/#refund-policy" className="hover:text-white transition">Refund Guidelines</a></li>
              </ul>
            </div>

            {/* Col 4: Partner with us */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-200 mb-4">Portals & Partners</h4>
              <ul className="space-y-2.5 text-xs text-ink-400">
                <li>
                  <Link to="/manager/login" className="hover:text-white transition flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Store className="h-3.5 w-3.5" /> Restaurant Partner Portal
                  </Link>
                </li>
                <li>
                  <Link to="/rider/login" className="hover:text-white transition flex items-center gap-1.5 text-sky-300 font-semibold">
                    <Bike className="h-3.5 w-3.5" /> Delivery Fleet Portal
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-white transition flex items-center gap-1.5 text-rose-400 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" /> Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
