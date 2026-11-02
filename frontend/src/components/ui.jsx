import { Loader2, Inbox, X } from 'lucide-react';

export const money = (n) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: import.meta.env.VITE_CURRENCY || 'GHS' }).format(Number(n) || 0);
export const when = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export function Spinner({ className = '' }) {
  return (
    <div className={`flex justify-center py-12 ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-label="Loading" />
    </div>
  );
}

export function Empty({ title, hint, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <Inbox className="h-8 w-8 text-ink-400" />
      <p className="font-bold text-sm text-ink-900">{title}</p>
      {hint && <p className="max-w-sm text-xs text-ink-500">{hint}</p>}
      {children}
    </div>
  );
}

export function ErrorNote({ message }) {
  return message ? (
    <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700">
      {message}
    </p>
  ) : null;
}

export function Field({ label, hint, className = '', children, ...props }) {
  return (
    <label className={`block text-xs ${className}`}>
      <span className="mb-1.5 block font-bold text-ink-700">{label}</span>
      {children || <input className="input" {...props} />}
      {hint && <span className="mt-1 block text-[11px] text-ink-400 font-medium">{hint}</span>}
    </label>
  );
}

const TONE = {
  green: 'bg-[#ECFDF5] text-[#027A48] border border-[#A6F4C5]',
  amber: 'bg-[#FEF7EC] text-[#B54708] border border-[#FEDF89]',
  red: 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]',
  blue: 'bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]',
  orange: 'bg-[#FFF0E6] text-[#FF5A26] border border-[#FED7C2]',
  gray: 'bg-[#F5F2EB] text-ink-700 border border-[#EFECE6]'
};

const STATUS_TONE = {
  approved: 'green', delivered: 'green', paid: 'green', active: 'green',
  accepted: 'blue', preparing: 'blue', ready: 'blue', picked_up: 'blue',
  pending: 'amber', placed: 'amber', pending_payment: 'gray', unpaid: 'gray', refund_pending: 'amber',
  rejected: 'red', cancelled: 'red', suspended: 'red', refunded: 'gray'
};

export function Badge({ status, children }) {
  const label = children || String(status).replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${TONE[STATUS_TONE[status] || 'gray']}`}>
      {label}
    </span>
  );
}

export function Stat({ label, value, hint, icon: Icon, tone = 'orange' }) {
  const iconTones = {
    orange: 'bg-[#FFF2EB] text-[#FF5A26]',
    green: 'bg-[#ECFDF5] text-[#10B981]',
    amber: 'bg-[#FEF9C3] text-[#F59E0B]',
    red: 'bg-[#FEF2F2] text-[#EF4444]',
    blue: 'bg-[#EFF8FF] text-[#3B82F6]',
    purple: 'bg-[#F5F3FF] text-[#8B5CF6]',
    gray: 'bg-[#F5F2EB] text-ink-600'
  };
  const iconClass = iconTones[tone] || iconTones.orange;

  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.025)] transition hover:shadow-md">
      <div className="flex items-center justify-between text-xs font-bold text-ink-500">
        <span>{label}</span>
        {Icon && (
          <div className={`rounded-xl p-2 ${iconClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-black text-ink-900 tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-[11px] font-medium text-ink-400">{hint}</p>}
    </div>
  );
}

export function PageHeader({ title, children, sub }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-900 tracking-tight leading-tight">{title}</h1>
        {sub && <p className="text-xs sm:text-sm text-ink-500 font-medium mt-1">{sub}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl shadow-2xl border border-ink-200">
        <div className="mb-4 flex items-center justify-between border-b border-ink-200/60 pb-3">
          <h2 className="text-base font-black text-ink-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition" aria-label="Close">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-5 flex gap-1.5 overflow-x-auto rounded-2xl bg-[#F5F2EB] p-1 border border-ink-200 scrollbar-none">
      {tabs.map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
            value === k
              ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-xs font-extrabold'
              : 'text-ink-600 hover:text-ink-900 hover:bg-white/60'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
