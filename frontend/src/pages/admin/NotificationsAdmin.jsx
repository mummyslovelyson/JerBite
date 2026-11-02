import { useState } from 'react';
import {
  Bell, Mail, MessageSquare, Send, FileText, CheckCircle2,
  Clock, Plus, Trash2, Megaphone, Edit3
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote } from '../../components/ui';
import toast from 'react-hot-toast';

export default function NotificationsAdmin() {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'announcements', 'logs'
  const { data: templates, loading: loadingTpl, error: errTpl, reload: reloadTpl } = useApi('/admin/notifications/templates');
  const { data: announcements, loading: loadingAnn, error: errAnn, reload: reloadAnn } = useApi('/admin/announcements');
  const { data: logs, loading: loadingLogs, error: errLogs } = useApi('/admin/notifications/logs');

  // Announcement modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annRole, setAnnRole] = useState('all');
  const [busy, setBusy] = useState(false);

  // Template editing
  const [editingTpl, setEditingTpl] = useState(null);
  const [tplSubject, setTplSubject] = useState('');
  const [tplBody, setTplBody] = useState('');

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/announcements', {
        title: annTitle,
        message: annMessage,
        targetRole: annRole
      });
      toast.success('Platform announcement published');
      setAnnTitle('');
      setAnnMessage('');
      setShowAnnModal(false);
      reloadAnn();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success('Announcement removed');
      reloadAnn();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!editingTpl) return;
    setBusy(true);
    try {
      await api.put(`/admin/notifications/templates/${editingTpl.id}`, {
        subject: tplSubject,
        body: tplBody
      });
      toast.success('Template updated successfully');
      setEditingTpl(null);
      reloadTpl();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const startEditTemplate = (tpl) => {
    setEditingTpl(tpl);
    setTplSubject(tpl.subject || '');
    setTplBody(tpl.body || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Notification &amp; Comms Management</h1>
          <p className="text-xs text-ink-500">Configure email &amp; SMS automated templates, platform broadcasts, and review delivery logs</p>
        </div>
        {activeTab === 'announcements' && (
          <button
            onClick={() => setShowAnnModal(!showAnnModal)}
            className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" /> New Announcement
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-200 gap-6 text-xs font-bold">
        {[
          { key: 'templates', label: 'Message Templates', icon: FileText },
          { key: 'announcements', label: 'Platform Announcements', icon: Megaphone },
          { key: 'logs', label: 'Delivery Logs', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-brand-600 text-brand-700 font-black'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {editingTpl && (
            <form onSubmit={handleSaveTemplate} className="card p-5 space-y-4 border-brand-300 bg-brand-50/20">
              <h3 className="font-extrabold text-sm text-brand-900 flex items-center gap-2">
                <Edit3 className="h-4 w-4" /> Edit Template: {editingTpl.name} ({editingTpl.channel.toUpperCase()})
              </h3>
              {editingTpl.channel === 'email' && (
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    required
                    value={tplSubject}
                    onChange={(e) => setTplSubject(e.target.value)}
                    className="input"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-ink-700 block mb-1">Body Text (with variables)</label>
                <textarea
                  rows={4}
                  required
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  className="input font-mono text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingTpl(null)} className="btn-ghost text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="btn-primary text-xs">
                  {busy ? 'Saving…' : 'Save Template'}
                </button>
              </div>
            </form>
          )}

          {loadingTpl ? (
            <Spinner />
          ) : !templates?.length ? (
            <Empty title="No templates found" hint="System templates will display here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {templates.map((t) => (
                <div key={t.id} className="card p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-ink-950">{t.name}</h4>
                      <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-black uppercase text-ink-700">
                        {t.channel}
                      </span>
                    </div>
                    {t.subject && (
                      <p className="mt-1 text-xs font-semibold text-brand-700">Subject: {t.subject}</p>
                    )}
                    <p className="mt-2 text-xs text-ink-600 bg-ink-50 p-3 rounded-xl font-mono leading-relaxed">
                      {t.body}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-ink-100 flex items-center justify-between">
                    <span className="text-[10px] text-ink-400">Key: {t.key}</span>
                    <button
                      onClick={() => startEditTemplate(t)}
                      className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-bold text-ink-700 hover:bg-ink-100"
                    >
                      Edit Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {showAnnModal && (
            <form onSubmit={handleCreateAnnouncement} className="card p-5 space-y-4 border-brand-200 bg-brand-50/20">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-800">New Broadcast Announcement</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-ink-700 block mb-1">Headline / Title</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. System Maintenance Window"
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">Target Audience</label>
                  <select
                    value={annRole}
                    onChange={(e) => setAnnRole(e.target.value)}
                    className="input"
                  >
                    <option value="all">Everyone</option>
                    <option value="customer">Customers Only</option>
                    <option value="manager">Restaurant Managers</option>
                    <option value="rider">Riders Fleet</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-ink-700 block mb-1">Announcement Message</label>
                <textarea
                  rows={3}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAnnModal(false)} className="btn-ghost text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="btn-primary text-xs">
                  {busy ? 'Publishing…' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          )}

          {loadingAnn ? (
            <Spinner />
          ) : !announcements?.length ? (
            <Empty title="No active announcements" hint="Publish announcements to customers, managers or riders." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {announcements.map((a) => (
                <div key={a.id} className="card p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-ink-950">{a.title}</h4>
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                        Audience: {a.target_role}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-ink-600 leading-relaxed">{a.message}</p>
                  </div>
                  <div className="pt-3 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-400">
                    <span>{new Date(a.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="text-rose-600 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DELIVERY LOGS */}
      {activeTab === 'logs' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-5 py-3">Channel</th>
                  <th className="px-5 py-3">Recipient</th>
                  <th className="px-5 py-3">Title / Content</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {!logs?.length ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-ink-400">
                      No notification logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id}>
                      <td className="px-5 py-3 font-bold uppercase text-[10px] text-ink-600">{l.channel}</td>
                      <td className="px-5 py-3 font-mono">{l.recipient}</td>
                      <td className="px-5 py-3 max-w-xs truncate">{l.title || l.content}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-400 text-[11px]">{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
