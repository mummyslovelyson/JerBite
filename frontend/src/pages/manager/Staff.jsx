import { useState } from 'react';
import { Users, Plus, Trash2, ShieldCheck, Mail, Phone } from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote } from '../../components/ui';
import toast from 'react-hot-toast';

export default function ManagerStaff() {
  const { data: staff, loading, error, reload } = useApi('/manager/staff');
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('staff');
  const [busy, setBusy] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/manager/staff', {
        name,
        email,
        phone,
        role,
        permissions: ['orders', 'menu']
      });
      toast.success(`Invited ${name} to restaurant staff`);
      setName('');
      setEmail('');
      setPhone('');
      setShowInvite(false);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/manager/staff/${id}`);
      toast.success('Staff member removed');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Staff &amp; Team Management</h1>
          <p className="text-xs text-ink-500">Invite and manage kitchen chefs, cashiers, and restaurant dispatch staff</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" /> Invite Staff Member
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="card p-5 space-y-4 border-brand-200 bg-brand-50/20">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-800">Invite New Team Member</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Assigned Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
                <option value="chef">Kitchen Chef (KDS)</option>
                <option value="cashier">Cashier &amp; Orders</option>
                <option value="manager">Assistant Manager</option>
                <option value="staff">General Floor Staff</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowInvite(false)} className="btn-ghost text-xs">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary text-xs">
              {busy ? 'Inviting…' : 'Send Invite'}
            </button>
          </div>
        </form>
      )}

      <ErrorNote message={error} />
      {loading ? (
        <Spinner />
      ) : !staff?.length ? (
        <Empty title="No staff members invited" hint="Invite chefs and front-of-house staff to manage your live queue." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <div key={s.id} className="card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-ink-950">{s.name}</h3>
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-black uppercase text-brand-700">
                    {s.role}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-ink-600">
                  <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-ink-400" /> {s.email}</p>
                  {s.phone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-ink-400" /> {s.phone}</p>}
                </div>
              </div>
              <div className="pt-3 border-t border-ink-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {s.status}
                </span>
                <button
                  onClick={() => handleRemove(s.id)}
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  title="Remove staff"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
