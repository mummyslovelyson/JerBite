import { useState, useEffect } from 'react';
import {
  AlertCircle, Calendar, Check, Clock, Flame, PauseCircle, PlayCircle,
  Save, Sparkles, Timer
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { ErrorNote, Field, PageHeader, Spinner } from '../../components/ui';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const hhmm = (t) => (t ? t.slice(0, 5) : '08:00');

export default function ManagerSchedule() {
  const { restaurant, refresh: refreshAuth } = useAuth();
  const { data, loading, error, reload } = useApi('/manager/schedule');

  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [prepTime, setPrepTime] = useState(30);
  const [schedule, setSchedule] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) {
      setOpeningTime(hhmm(data.opening_time));
      setClosingTime(hhmm(data.closing_time));
      setPrepTime(data.prep_time_minutes || 30);
      const initialSched = {};
      DAYS.forEach(({ key }) => {
        initialSched[key] = data.schedule?.[key] || {
          isOpen: true,
          open: hhmm(data.opening_time),
          close: hhmm(data.closing_time)
        };
      });
      setSchedule(initialSched);
    }
  }, [data]);

  const toggleDayOpen = (dayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: !prev[dayKey]?.isOpen
      }
    }));
  };

  const updateDayTime = (dayKey, field, val) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: val
      }
    }));
  };

  const applyDefaultToAll = () => {
    const updated = {};
    DAYS.forEach(({ key }) => {
      updated[key] = {
        isOpen: true,
        open: openingTime,
        close: closingTime
      };
    });
    setSchedule(updated);
    toast.success('Applied standard hours to all days');
  };

  const saveSchedule = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/manager/schedule', {
        openingTime,
        closingTime,
        prepTimeMinutes: prepTime,
        schedule
      });
      await refreshAuth();
      toast.success('Schedule and operating hours saved');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const pauseOrders = async (minutes) => {
    setBusy(true);
    try {
      await api.post('/manager/schedule/pause', { minutes });
      await refreshAuth();
      toast.success(minutes > 0 ? `Orders paused for ${minutes} minutes` : 'Order pause cleared');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const isPaused = data?.pause_until && new Date(data.pause_until) > new Date();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Operating Hours & Kitchen Schedule</h1>
        <p className="text-xs text-ink-500">
          Configure weekly opening times, estimated kitchen preparation speed, and temporary rush-hour pauses.
        </p>
      </div>

      <ErrorNote message={error} />

      {loading && !data ? (
        <Spinner />
      ) : (
        <form onSubmit={saveSchedule} className="space-y-6">
          {/* Rush Hour Mode Card */}
          <div className="card p-5 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 via-white to-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-600" />
                  Kitchen Rush Hour / Temporary Pause
                </h2>
                <p className="text-xs text-ink-600 mt-1">
                  Overwhelmed in the kitchen? Temporarily pause new orders without having to close down completely. Existing orders can still be prepared and delivered.
                </p>
              </div>

              {isPaused && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  Paused until {new Date(data.pause_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-ink-700 mr-2">Pause incoming orders:</span>
              <button
                type="button"
                onClick={() => pauseOrders(15)}
                className="rounded-lg border border-amber-300 bg-amber-100/60 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200 transition"
              >
                15 Minutes
              </button>
              <button
                type="button"
                onClick={() => pauseOrders(30)}
                className="rounded-lg border border-amber-300 bg-amber-100/60 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200 transition"
              >
                30 Minutes
              </button>
              <button
                type="button"
                onClick={() => pauseOrders(60)}
                className="rounded-lg border border-amber-300 bg-amber-100/60 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200 transition"
              >
                1 Hour
              </button>
              {isPaused && (
                <button
                  type="button"
                  onClick={() => pauseOrders(0)}
                  className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-200 transition"
                >
                  Resume Now
                </button>
              )}
            </div>
          </div>

          {/* Average Prep Time */}
          <div className="card p-5 space-y-3">
            <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
              <Timer className="h-5 w-5 text-brand-600" />
              Kitchen Preparation Speed
            </h2>
            <p className="text-xs text-ink-500">
              Expected time to cook and pack orders. Customers will see this estimated prep time on your restaurant menu.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 items-center">
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  className="input text-sm font-semibold"
                  value={prepTime}
                  onChange={(e) => setPrepTime(Number(e.target.value))}
                />
              </div>
              <div className="rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
                💡 <strong>Tip:</strong> During rainy days or rush hours, increasing your prep time gives cooks more breathing room.
              </div>
            </div>
          </div>

          {/* Standard Daily Hours */}
          <div className="card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-600" />
                  Standard Operating Hours
                </h2>
                <p className="text-xs text-ink-500">Default opening and closing times.</p>
              </div>

              <button
                type="button"
                onClick={applyDefaultToAll}
                className="btn-ghost text-xs font-semibold"
              >
                Apply to all 7 days &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1">Default Opens At</label>
                <input
                  type="time"
                  className="input text-sm"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1">Default Closes At</label>
                <input
                  type="time"
                  className="input text-sm"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Day-by-Day Schedule */}
          <div className="card p-5 space-y-3">
            <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-600" />
              Day-by-Day Weekly Hours
            </h2>
            <p className="text-xs text-ink-500">
              Customize times for specific days (e.g. earlier closing on Sundays).
            </p>

            <div className="divide-y divide-ink-100">
              {DAYS.map(({ key, label }) => {
                const day = schedule[key] || { isOpen: true, open: openingTime, close: closingTime };
                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
                    <div className="flex items-center gap-3 w-36">
                      <input
                        type="checkbox"
                        id={`check-${key}`}
                        checked={day.isOpen}
                        onChange={() => toggleDayOpen(key)}
                        className="h-4 w-4 rounded border-ink-300 text-brand-600 cursor-pointer"
                      />
                      <label htmlFor={`check-${key}`} className="font-semibold text-sm text-ink-900 cursor-pointer">
                        {label}
                      </label>
                    </div>

                    {day.isOpen ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          className="input py-1 text-xs w-28"
                          value={day.open || openingTime}
                          onChange={(e) => updateDayTime(key, 'open', e.target.value)}
                        />
                        <span className="text-xs text-ink-400">to</span>
                        <input
                          type="time"
                          className="input py-1 text-xs w-28"
                          value={day.close || closingTime}
                          onChange={(e) => updateDayTime(key, 'close', e.target.value)}
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-rose-600 py-1">Closed All Day</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="submit" disabled={busy} className="btn-primary">
              <Save className="h-4 w-4" />
              {busy ? 'Saving…' : 'Save Operating Schedule'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
