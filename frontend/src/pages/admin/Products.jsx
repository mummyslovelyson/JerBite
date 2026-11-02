import { Utensils, Store } from 'lucide-react';
import { Badge, money } from '../../components/ui';
import ReviewQueue from '../../components/ReviewQueue';
import { assetUrl } from '../../api/client';

const FALLBACK_FOOD = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

export default function AdminProducts() {
  return (
    <div className="w-full space-y-4 pb-16">
      <ReviewQueue
        noun="Product"
        listUrl="/admin/products"
        reviewUrl="/admin/products"
        render={(p) => (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Dish Photo Thumbnail with Fallback */}
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-ink-100 border border-ink-200 shadow-2xs flex items-center justify-center">
              {p.image_url ? (
                <img
                  src={assetUrl(p.image_url)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_FOOD;
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Utensils className="h-8 w-8 text-brand-600" />
              )}
            </div>

            {/* Dish Info */}
            <div className="min-w-0 flex-1 space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-extrabold text-base text-ink-900">{p.name}</h3>
                <Badge status={p.status} />
              </div>

              <p className="flex items-center gap-1 font-semibold text-brand-700">
                <Store className="h-3.5 w-3.5" />
                <span>{p.restaurant_name}</span>
              </p>

              <p className="font-black text-sm text-ink-900 pt-0.5">
                {money(p.price)}
              </p>

              <p className="text-ink-600 line-clamp-2 leading-relaxed">
                {p.description || 'No description provided.'}
              </p>

              {p.review_note && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2 text-xs text-rose-800 mt-2">
                  <span className="font-bold">Moderator Note:</span> {p.review_note}
                </div>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
}
