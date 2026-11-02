import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { Field, PageHeader, Empty } from '../../components/ui';

// Shared by customer, manager and rider ("My account")
export default function Profile({ withAddresses = false }) {
  const { user, refresh } = useAuth();
  const [p, setP] = useState({ name: user.name, phone: user.phone });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [a, setA] = useState({ label: '', address: '', city: '' });
  const addrs = useApi('/me/addresses');

  const saveProfile = async (e) => {
    e.preventDefault();
    try { await api.put('/me/profile', p); await refresh(); toast.success('Profile saved'); } catch (err) { toast.error(errMsg(err)); }
  };
  const savePw = async (e) => {
    e.preventDefault();
    try { await api.put('/me/password', pw); setPw({ currentPassword: '', newPassword: '' }); toast.success('Password changed'); } catch (err) { toast.error(errMsg(err)); }
  };
  const addAddress = async (e) => {
    e.preventDefault();
    try { await api.post('/me/addresses', a); setA({ label: '', address: '', city: '' }); addrs.reload(); toast.success('Address saved'); } catch (err) { toast.error(errMsg(err)); }
  };
  const removeAddress = async (id) => { await api.delete(`/me/addresses/${id}`); addrs.reload(); };

  return (
    <div className="w-full max-w-4xl space-y-5">
      <PageHeader title="My account" />
      <form onSubmit={saveProfile} className="card space-y-4 p-5">
        <h2 className="font-bold">Personal details</h2>
        <Field label="Full name" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} required />
        <Field label="Email" value={user.email} disabled hint="Email cannot be changed" />
        <Field label="Phone" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} required />
        <button className="btn-primary">Save changes</button>
      </form>

      <form onSubmit={savePw} className="card space-y-4 p-5">
        <h2 className="font-bold">Change password</h2>
        <Field label="Current password" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required autoComplete="current-password" placeholder="Enter your current password" />
        <Field label="New password" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
        <button className="btn-primary">Update password</button>
      </form>

      {withAddresses && (
        <div className="card space-y-4 p-5">
          <h2 className="font-bold">Delivery addresses</h2>
          {!addrs.data?.length ? <Empty title="No saved addresses" hint="Save one to check out faster." /> : (
            <ul className="divide-y divide-ink-100">
              {addrs.data.map((x) => (
                <li key={x.id} className="flex items-center justify-between py-2 text-sm">
                  <div><p className="font-semibold">{x.label}</p><p className="text-ink-500">{x.address}{x.city && `, ${x.city}`}</p></div>
                  <button onClick={() => removeAddress(x.id)} aria-label="Delete address" className="rounded p-2 hover:bg-ink-100"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addAddress} className="grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-2">
            <Field label="Label" value={a.label} onChange={(e) => setA({ ...a, label: e.target.value })} required placeholder="Home, Office…" />
            <Field label="City" value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} placeholder="Enter your city" />
            <Field label="Address" className="sm:col-span-2" value={a.address} onChange={(e) => setA({ ...a, address: e.target.value })} required placeholder="Street, landmark, area" />
            <button className="btn-primary sm:col-span-2">Add address</button>
          </form>
        </div>
      )}
    </div>
  );
}
