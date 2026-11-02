import { Bike, Award, Truck } from 'lucide-react';
import { Badge } from '../../components/ui';
import ReviewQueue from '../../components/ReviewQueue';

export default function AdminRiders() {
  return (
    <div className="w-full space-y-4 pb-16">
      <ReviewQueue
        noun="Rider"
        listUrl="/admin/riders"
        reviewUrl="/admin/riders"
        idOf={(r) => r.user_id}
        render={(r) => (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 font-black text-xl shadow-2xs">
              <Bike className="h-8 w-8" />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-extrabold text-base text-ink-900">{r.name}</h3>
                <Badge status={r.status} />
              </div>

              <p className="text-ink-600 font-medium">
                {r.email} • {r.phone}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-lg bg-ink-100 px-2.5 py-1 font-bold text-ink-800">
                  <Truck className="h-3 w-3 text-ink-500" />
                  Vehicle: {r.vehicle_type || 'Motorcycle'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-ink-100 px-2.5 py-1 font-mono text-[11px] font-bold text-ink-800">
                  Plate: {r.plate_number || 'N/A'}
                </span>
              </div>

              <p className="flex items-center gap-1 text-ink-500 pt-1">
                <Award className="h-3.5 w-3.5 text-brand-600" />
                <span>{r.deliveries || 0} completed deliveries</span>
              </p>

              {r.review_note && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2 text-xs text-rose-800 mt-2">
                  <span className="font-bold">Feedback Note:</span> {r.review_note}
                </div>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
}
