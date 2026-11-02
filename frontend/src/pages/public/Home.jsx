import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Clock, Bike, Star, ArrowRight, ShieldCheck,
  CreditCard, Bell, Sparkles, CheckCircle2, ChevronRight,
  Plus, ShoppingBag, Utensils, HelpCircle, AlertCircle
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import { assetUrl } from '../../api/client';
import { Spinner, Empty, ErrorNote, money } from '../../components/ui';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(urlQuery);
  const [appliedSearch, setAppliedSearch] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);

  const { add } = useCart();

  useEffect(() => {
    if (urlQuery !== appliedSearch) {
      setSearch(urlQuery);
      setAppliedSearch(urlQuery);
    }
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlQuery, urlCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = search.trim();
    setAppliedSearch(q);
    const p = {};
    if (q) p.q = q;
    if (selectedCategory) p.category = selectedCategory;
    setSearchParams(p);
  };

  const handleCategoryClick = (catName) => {
    const next = selectedCategory === catName ? '' : catName;
    setSelectedCategory(next);
    const p = {};
    if (appliedSearch) p.q = appliedSearch;
    if (next) p.category = next;
    setSearchParams(p);
  };

  const rest = useApi('/restaurants', { search: appliedSearch, category: selectedCategory });
  const dishes = useApi('/dishes', { search: appliedSearch, category: selectedCategory, limit: 12 });
  const categoriesApi = useApi('/categories');
  const promosApi = useApi('/promotions');
  const cfg = useApi('/settings/public');

  const defaultCategories = [
    { name: 'Local Dishes', icon: '🍲' },
    { name: 'Rice Meals', icon: '🍚' },
    { name: 'Fast Food', icon: '🍔' },
    { name: 'Snacks & Pastries', icon: '🥟' },
    { name: 'Drinks & Smoothies', icon: '🥤' },
    { name: 'Desserts', icon: '🍨' }
  ];

  const categories = categoriesApi.data?.length ? categoriesApi.data : defaultCategories;

  const handleAddDish = (dish) => {
    add(
      {
        id: dish.id,
        restaurant_id: dish.restaurant_id,
        name: dish.name,
        price: dish.price,
        image_url: dish.image_url
      },
      {
        id: dish.restaurant_id,
        name: dish.restaurant_name,
        delivery_fee: dish.delivery_fee || 0,
        prep_time_minutes: dish.prep_time_minutes || 30
      }
    );
    toast.success(`Added ${dish.name} to basket`);
  };

  return (
    <div className="w-full space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50/70 via-white to-ink-50 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-ink-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Hero Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-100/80 px-3.5 py-1 text-xs font-black text-brand-800 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                <span>JerBite Food Delivery Platform</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-ink-950 sm:text-5xl lg:text-6xl leading-[1.1]">
                Good food, <br />
                <span className="text-brand-600">delivered your way.</span>
              </h1>
              <p className="text-base text-ink-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Order sizzling hot meals, local specialties, and chef-curated dishes from verified kitchens near you. Quick delivery, easy pickup, and transparent tracking.
              </p>

              {/* Main Hero Search Field */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto lg:mx-0">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-ink-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search food, cuisines, or restaurants…"
                    className="w-full rounded-2xl border border-ink-300 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-ink-900 shadow-xs placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/30 hover:bg-brand-500 transition"
                >
                  Find Food
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#popular-food"
                  className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-ink-800 transition"
                >
                  <Utensils className="h-4 w-4" /> Browse Food
                </a>
                <a
                  href="#restaurants"
                  className="inline-flex items-center gap-2 rounded-xl border border-ink-300 bg-white px-5 py-3 text-xs font-bold text-ink-800 shadow-xs hover:bg-ink-50 transition"
                >
                  Find Restaurants <ArrowRight className="h-3.5 w-3.5 text-brand-600" />
                </a>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-ink-200/90 bg-white p-4 shadow-2xl">
                <div className="aspect-4/3 overflow-hidden rounded-2xl bg-brand-100">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                    alt="Delicious dishes"
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-ink-900">Fresh Flavors Delivered</h3>
                    <p className="text-xs text-ink-500">Fast local courier &bull; 15-30 min</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                    <Star className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" /> 4.9
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Closed Banner if applicable */}
      {cfg.data?.platformOpen === false && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-300 p-4 text-amber-900">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-xs sm:text-sm font-semibold">
              Ordering is temporarily paused platform-wide for maintenance or off-hours. You can still browse menus and prepare your basket.
            </p>
          </div>
        </div>
      )}

      {/* 2. FOOD CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink-950">Food Categories</h2>
            <p className="text-xs sm:text-sm text-ink-500">Pick a category to filter dishes and restaurants</p>
          </div>
          {selectedCategory && (
            <button
              onClick={() => handleCategoryClick('')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Clear filter ({selectedCategory})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((c, i) => {
            const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name || i}
                onClick={() => handleCategoryClick(c.name)}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm ring-2 ring-brand-500/20'
                    : 'border-ink-200 bg-white hover:border-brand-300 hover:bg-ink-50/50 shadow-xs'
                }`}
              >
                <span className="text-2xl">{c.icon || '🍽️'}</span>
                <span className="text-xs font-bold truncate max-w-[110px]">{c.name}</span>
                {c.count && <span className="text-[10px] text-ink-400">{c.count} items</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. OFFERS AND PROMOTIONS (Active only) */}
      {promosApi.data && promosApi.data.length > 0 && (
        <section id="offers" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> Specials
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-ink-950">Offers &amp; Promotions</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promosApi.data.map((p) => (
              <div
                key={p.id}
                className="relative overflow-hidden rounded-2xl border border-rose-200 bg-linear-to-br from-rose-50/60 to-white p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
                      {p.discount_type === 'percentage' ? `${Math.round(p.discount_value)}% OFF` : `${money(p.discount_value)} OFF`}
                    </span>
                    <h3 className="mt-2 text-base font-extrabold text-ink-950">{p.title}</h3>
                    {p.restaurant_name && (
                      <p className="text-xs font-semibold text-brand-700">At {p.restaurant_name}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-dashed border-rose-300 bg-rose-100/50 px-3 py-1 text-xs font-mono font-black text-rose-800">
                    {p.code}
                  </div>
                </div>
                {p.description && <p className="mt-2 text-xs text-ink-600 leading-relaxed">{p.description}</p>}
                <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-[11px] text-ink-500">
                  <span>Min order: {money(p.min_order_amount)}</span>
                  <span>Active promotion</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. FEATURED RESTAURANTS (Approved & active only) */}
      <section id="restaurants" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink-950">Featured Restaurants</h2>
            <p className="text-xs sm:text-sm text-ink-500">
              {appliedSearch
                ? `Showing approved kitchens matching "${appliedSearch}"`
                : 'Browse our vetted partner kitchens and eateries'}
            </p>
          </div>
        </div>

        <ErrorNote message={rest.error} />
        {rest.loading ? (
          <Spinner />
        ) : !rest.data?.length ? (
          <Empty
            title={appliedSearch ? 'No restaurants match your search' : 'No restaurants currently listed'}
            hint="Try searching for another dish or cuisine."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.data.map((r) => (
              <Link
                key={r.id}
                to={`/restaurant/${r.id}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-44 w-full overflow-hidden bg-ink-100">
                  {r.cover_url ? (
                    <img
                      src={assetUrl(r.cover_url)}
                      alt={r.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-brand-600 to-ink-900 text-white font-black text-3xl">
                      {r.name[0]}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-black text-ink-900 shadow-md">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{r.rating || '4.8'}</span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        r.is_open ? 'bg-emerald-500 text-white' : 'bg-ink-800/80 text-white'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {r.is_open ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="text-base font-extrabold text-ink-950 group-hover:text-brand-600 transition">
                      {r.name}
                    </h3>
                    <p className="mt-1 text-xs text-ink-500 line-clamp-1">
                      {[r.cuisine, r.city || r.address].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-ink-400" />
                      {r.prep_time_minutes || 30} min prep
                    </span>
                    <span className="flex items-center gap-1">
                      <Bike className="h-3.5 w-3.5 text-brand-600" />
                      {Number(r.delivery_fee) > 0 ? money(r.delivery_fee) : 'Free delivery'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. POPULAR FOOD (Approved & Available only) */}
      <section id="popular-food" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink-950">Popular Food &amp; Dishes</h2>
            <p className="text-xs sm:text-sm text-ink-500">Delicious items you can add straight to your basket</p>
          </div>
        </div>

        {dishes.loading ? (
          <Spinner />
        ) : !dishes.data?.length ? (
          <Empty title="No food items found" hint="Try exploring our restaurants directly." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dishes.data.map((d) => (
              <div
                key={d.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-200 bg-white p-3 shadow-xs hover:shadow-md transition"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-ink-100 mb-3">
                  {d.image_url ? (
                    <img
                      src={assetUrl(d.image_url)}
                      alt={d.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-600 font-bold text-2xl">
                      🍽️
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-extrabold text-sm text-ink-950 line-clamp-1">{d.name}</h4>
                    <span className="font-black text-sm text-brand-700 shrink-0">{money(d.price)}</span>
                  </div>
                  <Link
                    to={`/restaurant/${d.restaurant_id}`}
                    className="text-xs font-semibold text-ink-500 hover:text-brand-600 line-clamp-1 block"
                  >
                    {d.restaurant_name}
                  </Link>
                  {d.description && (
                    <p className="text-[11px] text-ink-400 line-clamp-2 leading-relaxed">{d.description}</p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-ink-100 flex items-center justify-between">
                  <Link
                    to={`/restaurant/${d.restaurant_id}`}
                    className="text-[11px] font-bold text-ink-600 hover:text-ink-900"
                  >
                    View Menu &rarr;
                  </Link>
                  <button
                    onClick={() => handleAddDish(d)}
                    className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-500 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. HOW JERBITE WORKS */}
      <section className="border-y border-ink-200/80 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-black uppercase tracking-wider text-brand-600">Simplicity</span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink-950">How JerBite Works</h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-500 max-w-md mx-auto">
            Order mouth-watering dishes in three simple steps.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-ink-50/60 border border-ink-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 font-black text-xl mb-4">
                1
              </div>
              <h3 className="font-extrabold text-base text-ink-900">Choose Food</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed max-w-xs">
                Explore a rich collection of approved local and international restaurants and select your favorite dishes.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-ink-50/60 border border-ink-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 font-black text-xl mb-4">
                2
              </div>
              <h3 className="font-extrabold text-base text-ink-900">Place an Order</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed max-w-xs">
                Confirm your delivery location, customize notes, and pay seamlessly with integrated payment options.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-ink-50/60 border border-ink-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 font-black text-xl mb-4">
                3
              </div>
              <h3 className="font-extrabold text-base text-ink-900">Receive or Collect</h3>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed max-w-xs">
                Track rider progress with live status alerts or collect your meal directly from the restaurant counter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE JERBITE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-brand-600">The JerBite Standard</span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink-950">Why Choose JerBite?</h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-500">Built for food lovers, restaurateurs, and couriers</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-sm text-ink-900">Verified Restaurants</h4>
            <p className="mt-1 text-xs text-ink-500 leading-relaxed">
              Every kitchen and restaurant is inspected and approved by administrators before going live.
            </p>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
              <CreditCard className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-sm text-ink-900">Secure Checkout</h4>
            <p className="mt-1 text-xs text-ink-500 leading-relaxed">
              Bank-grade security with instant confirmation, automatic refunds on cancellation, and zero hidden fees.
            </p>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4">
              <Bell className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-sm text-ink-900">Order Updates</h4>
            <p className="mt-1 text-xs text-ink-500 leading-relaxed">
              Real-time SMS and in-app notifications at every milestone from kitchen acceptance to door drop-off.
            </p>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-4">
              <Bike className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-sm text-ink-900">Delivery &amp; Pickup</h4>
            <p className="mt-1 text-xs text-ink-500 leading-relaxed">
              Choose between swift door-to-door rider delivery or skip-the-line pickup directly at the restaurant.
            </p>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-brand-600 to-brand-800 px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Hungry? Discover your next favorite meal now.
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 max-w-lg mx-auto">
              Join thousands of food lovers enjoying top-tier cuisine delivered with speed and care.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-white px-6 py-3 text-xs font-black text-brand-700 shadow-md hover:bg-brand-50 transition"
              >
                Create Free Account
              </Link>
              <a
                href="#restaurants"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                Explore Restaurants
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ & HELP ANCHOR */}
      <section id="help" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-ink-950">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-ink-500">Everything you need to know about ordering on JerBite</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does food delivery work?',
              a: 'Once your order is accepted and prepared by the restaurant, an approved JerBite rider is assigned to pick it up and deliver it promptly to your delivery address.'
            },
            {
              q: 'Can I choose pickup instead of delivery?',
              a: 'Yes! Select "Choose pickup" in the fulfillment selector at the top, and your food will be ready for you to collect without delivery charges.'
            },
            {
              q: 'What happens if a restaurant cancels my order?',
              a: 'If an order is cancelled or declined, your payment is automatically queued for immediate refund to your original payment method.'
            },
            {
              q: 'How do restaurants and riders join?',
              a: 'Click "Restaurant Registration" or "Rider Registration" in the footer below to submit your details and begin onboarding.'
            }
          ].map((faq, i) => (
            <div key={i} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-xs">
              <h4 className="font-extrabold text-sm text-ink-900">{faq.q}</h4>
              <p className="mt-2 text-xs text-ink-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
