import {
  Area, AreaChart as RAreaChart, Bar, BarChart as RBarChart,
  CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend
} from 'recharts';
import { Empty, money } from './ui';

const COLORS = ['#FF5A26', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6'];
const short = (d) => (d && d.length >= 5 ? d.slice(5) : d);

export function ChartCard({ title, subtitle, children, className = '', action }) {
  return (
    <div className={`rounded-3xl border border-ink-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.025)] ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-ink-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-ink-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

export function AreaChartComponent({ data, xKey = 'date', yKey = 'revenue', color = '#FF5A26', money: isMoney }) {
  if (!data?.length) return <Empty title="No data available" />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RAreaChart data={data}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFECE6" vertical={false} />
        <XAxis dataKey={xKey} tickFormatter={short} fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} width={50} />
        <Tooltip
          formatter={(v) => (isMoney ? money(v) : v)}
          contentStyle={{ backgroundColor: '#1C1917', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '8px 12px' }}
        />
        <Area type="monotone" dataKey={yKey} stroke={color} fill="url(#areaGrad)" strokeWidth={2.5} />
      </RAreaChart>
    </ResponsiveContainer>
  );
}

export function BarChartComponent({ data, xKey = 'date', yKey = 'orders', color = '#10B981' }) {
  if (!data?.length) return <Empty title="No data available" />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFECE6" vertical={false} />
        <XAxis dataKey={xKey} tickFormatter={short} fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis allowDecimals={false} fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} width={36} />
        <Tooltip contentStyle={{ backgroundColor: '#1C1917', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
      </RBarChart>
    </ResponsiveContainer>
  );
}

export { AreaChartComponent as AreaChart, BarChartComponent as BarChart };

export function RevenueChart({ data }) {
  if (!data?.some((d) => d.revenue > 0)) {
    return <Empty title="No sales in this period yet" hint="Revenue will appear here once paid orders come in." />;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RAreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF5A26" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#FF5A26" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFECE6" vertical={false} />
        <XAxis dataKey="date" tickFormatter={short} fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} width={50} />
        <Tooltip
          formatter={(v, n) => (n === 'Revenue' ? money(v) : v)}
          contentStyle={{ backgroundColor: '#1C1917', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
        />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#FF5A26" fill="url(#rev)" strokeWidth={2.8} />
      </RAreaChart>
    </ResponsiveContainer>
  );
}

export function OrdersBar({ data, dataKey = 'orders', color = '#10B981' }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFECE6" vertical={false} />
        <XAxis dataKey="date" tickFormatter={short} fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis allowDecimals={false} fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} width={36} />
        <Tooltip contentStyle={{ backgroundColor: '#1C1917', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </RBarChart>
    </ResponsiveContainer>
  );
}

export function HourlyChart({ data }) {
  if (!data?.some((d) => d.orders > 0)) {
    return <Empty title="No hourly activity yet" hint="Peak ordering times will show as orders are placed." />;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFECE6" vertical={false} />
        <XAxis dataKey="hour" fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} interval={2} />
        <YAxis allowDecimals={false} fontSize={11} stroke="#A8A29E" tickLine={false} axisLine={false} width={32} />
        <Tooltip
          formatter={(v, n) => (n === 'orders' ? `${v} orders` : money(v))}
          contentStyle={{ backgroundColor: '#1C1917', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
        />
        <Bar dataKey="orders" name="Orders" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
      </RBarChart>
    </ResponsiveContainer>
  );
}

export function StatusPie({ data }) {
  if (!data?.length) return <Empty title="No orders yet" />;
  const rows = data.map((d) => ({ name: d.status.replace(/_/g, ' '), value: d.count }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
          {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#1C1917', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RankList({ rows, label, value, subLabel, format = (v) => v }) {
  if (!rows?.length) return <Empty title="Nothing to rank yet" />;
  const max = Math.max(...rows.map((r) => r[value]), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r, idx) => (
        <li key={r[label] || idx}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 truncate pr-2">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                idx === 0 ? 'bg-emerald-500 text-white' :
                idx === 1 ? 'bg-amber-500 text-white' :
                idx === 2 ? 'bg-brand-500 text-white' : 'bg-ink-200 text-ink-700'
              }`}>
                {idx + 1}
              </span>
              <span className="truncate font-bold text-ink-900">{r[label]}</span>
              {subLabel && <span className="text-[11px] text-ink-400">({subLabel(r)})</span>}
            </div>
            <span className="font-mono font-black text-ink-900">{format(r[value])}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-[#F4EFEA] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all" style={{ width: `${(r[value] / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
