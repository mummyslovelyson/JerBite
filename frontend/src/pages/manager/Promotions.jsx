import { useState } from 'react';
import { Tag, Plus, Trash2, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote, money } from '../../components/ui';
import toast from 'react-hot-toast';

export default function ManagerPromotions() {
  const { data: promotions, loading, error, reload } = useApi('/manager/promotions');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('15');
  const [minOrder, setMinOrder] = useState('20');
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/manager/promotions', {
        title,
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount: minOrder
      });
      toast.success('Promotion code published');
      setTitle('');
      setCode('');
      setDescription('');
      setShowAdd(false);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this offer?')) return;
    try {
      await api.delete(`/manager/promotions/${id}`);
      toast.success('Promotion removed');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Promotions &amp; Discounts</h1>
          <p className="text-xs text-ink-500">Create promotional codes, seasonal discounts, and minimum order vouchers</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" /> Create Promotion
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="card p-5 space-y-4 border-brand-200 bg-brand-50/20">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-800">New Promotion Voucher</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Promotion Title</label>
              <input type="text" required placeholder="e.g. Weekend Special 15%" value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Coupon Code</label>
              <input type="text" required placeholder="e.g. WEEKEND15" value={code} onChange={(e) => setCode(e.target.value)} className="input font-mono uppercase" />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Discount Type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="input">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (GHS)</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Discount Value</label>
              <input type="number" step="0.5" required value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">Minimum Order Amount</label>
              <input type="number" step="1" required value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-ink-700 block mb-1">Offer Terms / Description</label>
            <input type="text" placeholder="e.g. Valid on all rice and pasta dishes" value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost text-xs">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary text-xs">
              {busy ? 'Saving…' : 'Activate Promotion'}
            </button>
          </div>
        </form>
      )}

      <ErrorNote message={error} />
      {loading ? (
        <Spinner />
      ) : !promotions?.length ? (
        <Empty title="No active promotions" hint="Reward your customers by launching your first voucher discount above." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((p) => (
            <div key={p.id} className="card p-5 space-y-3 flex flex-col justify-between border-brand-100">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
                      {p.discount_type === 'percentage' ? `${Math.round(p.discount_value)}% OFF` : `${money(p.discount_value)} OFF`}
                    </span>
                    <h3 className="mt-2 text-base font-extrabold text-ink-950">{p.title}</h3>
                  </div>
                  <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 px-2.5 py-1 text-xs font-mono font-bold text-brand-700">
                    {p.code}
                  </div>
                </div>
                {p.description && <p className="mt-2 text-xs text-ink-600 leading-relaxed">{p.description}</p>}
              </div>
              <div className="pt-3 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                <span>Min order: {money(p.min_order_amount)}</span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  title="Remove offer"
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
