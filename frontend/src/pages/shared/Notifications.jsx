import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../../api/client';
import useApi from '../../hooks/useApi';
import { Empty, PageHeader, Spinner, when } from '../../components/ui';

export default function Notifications() {
  const { data, loading, reload } = useApi('/me/notifications');
  useEffect(() => { api.patch('/me/notifications/read').then(() => {}).catch(() => {}); }, []);
  return (
    <div className="w-full max-w-4xl space-y-4">
      <PageHeader title="Notifications"><button className="btn-ghost" onClick={reload}>Refresh</button></PageHeader>
      {loading ? <Spinner /> : !data?.length ? <Empty title="You are all caught up" hint="Order and account updates will appear here." /> : (
        <ul className="space-y-2">
          {data.map((n) => (
            <li key={n.id} className={`card flex gap-3 p-3 ${n.is_read ? '' : 'border-brand-500'}`}>
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div><p className="text-sm font-semibold">{n.title}</p><p className="text-sm text-ink-700">{n.body}</p><p className="mt-1 text-xs text-ink-500">{when(n.created_at)}</p></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
