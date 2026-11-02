import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bike, Check, ChevronRight, Clock, ExternalLink,
  Heart, Info, MapPin, Minus, Phone, Plus, Search,
  ShoppingBag, Sparkles, Star, Store, Trash2, Utensils, X,
  ShieldCheck, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi';
import { assetUrl } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { Spinner, Empty, ErrorNote, money, Badge } from '../../components/ui';

// High-resolution reliable fallback food imagery
const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
const FALLBACK_HERO_IMG = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80';

// Robust Food Image component with graceful fallback & loading states
function DishImage({ src, alt, name }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const finalSrc = !failed && src ? assetUrl(src) : FALLBACK_FOOD_IMG;

  return (
    <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-2xl overflow-hidden bg-ink-100 border border-ink-100 flex items-center justify-center">
      {/* Loading Skeleton Placeholder */}
      {!loaded && !failed && (
        <div className="absolute inset-0 bg-ink-100 animate-pulse flex items-center justify-center">
          <Utensils className="h-6 w-6 text-ink-300" />
        </div>
      )}

      {failed ? (
        <div className="flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-amber-50 to-orange-100 w-full h-full">
          <Utensils className="h-7 w-7 text-brand-500 mb-1" />
          <span className="text-[10px] font-bold text-brand-900 line-clamp-1">{name}</span>
        </div>
      ) : (
        <img
          src={finalSrc}
          alt={alt || name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

export default function Restaurant() {
  const { id } = useParams();
  const { data, loading, error } = useApi(`/restaurants/${id}`);
  const { cart, items, add, setQty, count, subtotal } = useCart();

  const [cat, setCat] = useState('');
  const [dishSearch, setDishSearch] = useState('');

  // Extract data safely
  const r = data?.restaurant;
  const categories = data?.categories || [];
  const products = data?.products || [];

  // Filter products by active category and search keyword (Hooks MUST run unconditionally)
  const filteredProducts = useMemo(() => {
    let list = products || [];
    if (cat) {
      list = list.filter((p) => p.category_id === cat);
    }
    if (dishSearch.trim()) {
      const q = dishSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, cat, dishSearch]);

  // Loading and Error early returns AFTER all hooks have executed
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!r) return <Empty title="Restaurant not found" hint="This kitchen might have closed or been moved." />;

  return (
    <div className="w-full space-y-8 pb-44">
      {/* Back Navigation Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-ink-600 hover:text-brand-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Restaurants
        </Link>

        {r.is_open && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Accepting Live Orders
          </span>
        )}
      </div>

      {/* 1. RESTAURANT HERO PANORAMA */}
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 shadow-xl border border-ink-200">
        {/* Cover Photo */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-ink-950">
          <img
            src={r.cover_url ? assetUrl(r.cover_url) : FALLBACK_HERO_IMG}
            alt={r.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_HERO_IMG;
            }}
            className="h-full w-full object-cover opacity-85"
          />

          {/* Vignette Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />

          {/* Live Status Pill */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black shadow-lg backdrop-blur-md ${
                r.is_open
                  ? 'bg-emerald-500/95 text-white'
                  : 'bg-black/80 text-white'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${r.is_open ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
              {r.is_open ? 'Open Now' : 'Closed for Orders'}
            </span>
          </div>

          {/* Restaurant Header Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="flex items-end gap-4">
              {/* Logo Badge */}
              <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center">
                {r.logo_url ? (
                  <img
                    src={assetUrl(r.logo_url)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_FOOD_IMG;
                    }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-600 text-white font-black text-2xl">
                    {r.name[0]}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
                    {r.name}
                  </h1>
                  <span title="Verified Kitchen">
                    <ShieldCheck className="h-6 w-6 text-brand-400 shrink-0" />
                  </span>
                </div>

                <p className="mt-1 text-xs sm:text-sm font-semibold text-amber-200 drop-shadow-xs flex items-center gap-2">
                  <span>{[r.cuisine, r.city].filter(Boolean).join(' · ')}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    4.9 (240+ reviews)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Stats & Contact Bar */}
        <div className="bg-white p-5 sm:p-6 border-t border-ink-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-ink-700">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[10px] uppercase font-bold text-ink-400">Est. Prep Time</p>
                <p className="font-extrabold text-ink-900">{r.prep_time_minutes || 25} Mins</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Bike className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[10px] uppercase font-bold text-ink-400">Delivery Fee</p>
                <p className="font-extrabold text-ink-900">
                  {Number(r.delivery_fee) > 0 ? money(r.delivery_fee) : <span className="text-emerald-700">Free Delivery</span>}
                </p>
              </div>
            </div>

            {r.min_order > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Utensils className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-ink-400">Min. Order</p>
                  <p className="font-extrabold text-ink-900">{money(r.min_order)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Location & Contacts */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-600">
            {r.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${r.name}, ${r.address}, ${r.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-brand-600 transition"
              >
                <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
                <span>{r.address}</span>
              </a>
            )}

            {r.phone && (
              <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 hover:text-brand-600 transition">
                <Phone className="h-4 w-4 text-brand-600 shrink-0" />
                <span>{r.phone}</span>
              </a>
            )}
          </div>
        </div>

        {r.description && (
          <div className="bg-ink-50/70 px-5 sm:px-6 py-3 border-t border-ink-100 text-xs text-ink-600 leading-relaxed">
            {r.description}
          </div>
        )}
      </div>

      {/* 2. STICKY CATEGORIES & MENU SEARCH BAR */}
      <div className="sticky top-20 z-20 rounded-2xl border border-ink-200/90 bg-white/95 p-3 shadow-md backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setCat('')}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
                cat === ''
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200/70'
              }`}
            >
              All Dishes ({products?.length || 0})
            </button>

            {categories?.map((c) => {
              const countInCategory = products?.filter((p) => p.category_id === c.id).length || 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
                    cat === c.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-ink-100 text-ink-700 hover:bg-ink-200/70'
                  }`}
                >
                  {c.name} ({countInCategory})
                </button>
              );
            })}
          </div>

          {/* Search within Menu */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="text"
              className="input pl-9 pr-8 py-1.5 text-xs w-full bg-ink-50/70"
              placeholder="Search in menu..."
              value={dishSearch}
              onChange={(e) => setDishSearch(e.target.value)}
            />
            {dishSearch && (
              <button
                onClick={() => setDishSearch('')}
                className="absolute right-2.5 top-2 text-ink-400 hover:text-ink-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. APPETIZING DISH CARDS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-ink-900">
            {cat ? categories?.find((c) => c.id === cat)?.name || 'Menu' : 'Full Menu'}
          </h2>
          <span className="text-xs font-semibold text-ink-500">
            {filteredProducts.length} dish{filteredProducts.length !== 1 ? 'es' : ''} available
          </span>
        </div>

        {!filteredProducts.length ? (
          <Empty
            title={dishSearch ? 'No dishes match your search' : 'No dishes in this category'}
            hint={dishSearch ? 'Try clearing your search term.' : 'Select another category to view dishes.'}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((p) => {
              const inCart = items?.find((i) => i.id === p.id);
              const qty = inCart ? inCart.quantity : 0;

              return (
                <div
                  key={p.id}
                  className="group card flex overflow-hidden border border-ink-200 transition-all duration-200 hover:border-brand-300 hover:shadow-xl p-4 gap-4 justify-between"
                >
                  {/* Left Column: Dish Info & Price */}
                  <div className="flex flex-col justify-between flex-1 min-w-0 pr-1">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-base text-ink-900 group-hover:text-brand-600 transition leading-snug">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 flex items-center justify-between mt-auto">
                      <span className="font-black text-base sm:text-lg text-ink-900">
                        {money(p.price)}
                      </span>

                      {/* Interactive Cart Buttons */}
                      {r.is_open ? (
                        qty > 0 ? (
                          <div className="flex items-center gap-2 rounded-xl bg-brand-50 p-1 border border-brand-200">
                            <button
                              onClick={() => setQty(p.id, qty - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-brand-700 shadow-2xs hover:bg-brand-100 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center font-black text-xs text-brand-900">
                              {qty}
                            </span>
                            <button
                              onClick={() => setQty(p.id, qty + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white shadow-2xs hover:bg-brand-700 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              add(r, { id: p.id, name: p.name, price: p.price });
                              toast.success(`${p.name} added to cart`, { icon: '🍲' });
                            }}
                            className="btn-primary text-xs py-2 px-4 rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add
                          </button>
                        )
                      ) : (
                        <span className="text-xs font-semibold text-ink-400 bg-ink-100 px-2.5 py-1 rounded-lg">
                          Store Closed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: High-Res Dish Image with Graceful Fallback */}
                  <div className="relative">
                    <DishImage src={p.image_url} alt={p.name} name={p.name} />
                    {qty > 0 && (
                      <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white font-black text-xs shadow-md">
                        {qty}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. FLOATING CHECKOUT BAR (ANCHORED SAFELY AT BOTTOM-RIGHT WITHOUT OVERLAPPING ANY CARDS) */}
      {count > 0 && (
        <div className="fixed bottom-6 right-6 sm:right-10 z-30 animate-in fade-in slide-in-from-bottom-6 duration-200">
          <Link
            to="/cart"
            className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 px-5 py-3.5 text-white shadow-2xl hover:shadow-brand-500/30 transition-all hover:scale-102 cursor-pointer"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-brand-700 font-black text-[11px] shadow-xs">
                {count}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                View Food Cart
              </p>
              <p className="text-base font-black text-white">{money(subtotal)}</p>
            </div>

            <ChevronRight className="h-5 w-5 ml-2 text-white/80" />
          </Link>
        </div>
      )}
    </div>
  );
}
