import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, RefreshCw, Key, UserCheck, ShieldAlert } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Create Admin Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/system/admins');
      setAdmins(res.data);
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
    if (!name.trim() || !email.trim() || !password) return;
    setSubmitting(true);
    try {
      await api.post('/admin/system/admins', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password
      });
      setModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
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
        title="Admin Users"
        sub="Authorized staff credentials with access to the JerBite administration platform"
      >
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add Admin User
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : admins.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <p className="text-xs">No admin users found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Admin Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Phone</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Created At</th>
                  <th className="px-4 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 font-bold text-brand-700">
                        {a.name ? a.name[0] : 'A'}
                      </div>
                      <span>{a.name}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{a.email}</td>
                    <td className="px-4 py-3 text-ink-600 font-mono">{a.phone || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold text-brand-700 uppercase text-[10px]">
                      Administrator
                    </td>
                    <td className="px-4 py-3 text-ink-500">{when(a.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge status={a.status || 'active'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      {modalOpen && (
        <Modal
          title="Create New Administrator"
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Full Name" required>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Official Email Address" required>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jerbite.com"
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Phone Number" required>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <Field label="Temporary Password" required>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters..."
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
                {submitting ? 'Creating...' : 'Create Admin Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
