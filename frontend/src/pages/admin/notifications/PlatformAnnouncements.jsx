import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, RefreshCw, CheckCircle2, Users } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function PlatformAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/announcements');
      setAnnouncements(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/admin/announcements', {
        title: title.trim(),
        message: message.trim(),
        targetRole
      });
      setModalOpen(false);
      setTitle('');
      setMessage('');
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this platform announcement banner?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      load();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Announcements"
        sub="Publish global news bulletins and alerts visible to diners, restaurant staff, or fleet riders"
      >
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Create Announcement
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : announcements.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <Megaphone className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No active announcements</h3>
          <p className="text-xs text-ink-500">Create an announcement to broadcast urgent news across platforms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="card p-5 border-l-4 border-l-brand-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-extrabold text-base text-ink-900">{a.title}</h3>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                    Target: {a.target_role}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-700">{a.message}</p>
                <p className="mt-2 text-[10px] text-ink-400">Published on {when(a.created_at)}</p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => handleDelete(a.id)}
                  className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 shadow-2xs"
                  title="Delete Announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {modalOpen && (
        <Modal
          title="Create Platform Announcement"
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Target Audience Role">
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 bg-white text-xs focus:border-brand-500 focus:outline-hidden"
              >
                <option value="all">All Users (Diners, Managers, Riders)</option>
                <option value="customer">Customers Only</option>
                <option value="manager">Restaurant Managers</option>
                <option value="rider">Rider Fleet</option>
              </select>
            </Field>

            <Field label="Announcement Title" required>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled System Maintenance"
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Announcement Message" required>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write announcement details..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
              >
                {submitting ? 'Publishing...' : 'Broadcast Announcement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
