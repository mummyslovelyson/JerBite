import { useState, useEffect } from 'react';
import { Mail, Smartphone, Edit2, Save, RefreshCw, Code } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function NotificationTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Edit modal
  const [editing, setEditing] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/notifications/templates');
      setTemplates(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (tpl) => {
    setEditing(tpl);
    setSubject(tpl.subject || '');
    setBody(tpl.body || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/notifications/templates/${editing.id}`, {
        subject: subject.trim(),
        body: body.trim()
      });
      setEditing(null);
      load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Templates"
        sub="Customize automated transactional email and SMS copy sent for order statuses, rider assignments, and receipts"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : templates.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <p className="text-xs">No notification templates registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {templates.map((tpl) => (
            <div key={tpl.id} className="card p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-ink-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      tpl.channel === 'email' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {tpl.channel === 'email' ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-ink-900">{tpl.name}</h4>
                      <p className="font-mono text-[10px] text-ink-400">{tpl.key}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase text-ink-600">
                    {tpl.channel}
                  </span>
                </div>

                {tpl.channel === 'email' && tpl.subject && (
                  <div className="mt-3 text-xs">
                    <span className="font-bold text-ink-500">Subject: </span>
                    <span className="font-semibold text-ink-800">{tpl.subject}</span>
                  </div>
                )}

                <p className="mt-2 text-xs text-ink-600 whitespace-pre-wrap bg-ink-50/70 p-3 rounded-xl border border-ink-100 font-mono text-[11px]">
                  {tpl.body}
                </p>

                {tpl.variables && (
                  <div className="mt-3 flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] font-bold text-ink-400 uppercase">Tags:</span>
                    {(typeof tpl.variables === 'string' ? JSON.parse(tpl.variables) : tpl.variables).map((v) => (
                      <span key={v} className="rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[10px] text-brand-700 font-bold">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-ink-100 flex justify-end">
                <button
                  onClick={() => openEdit(tpl)}
                  className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Template Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editing && (
        <Modal
          title={`Edit Template: ${editing.name}`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            {editing.channel === 'email' && (
              <Field label="Subject Line">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
                />
              </Field>
            )}

            <Field label="Message Template Body" required>
              <textarea
                rows={5}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-xl border border-ink-200 p-2.5 font-mono text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
              >
                {submitting ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
