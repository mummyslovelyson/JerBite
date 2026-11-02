import { useState, useMemo } from 'react';
import {
  ArrowDownToLine, Banknote, Building2, CheckCircle2, CreditCard,
  DollarSign, Download, Filter, HelpCircle, Percent, Search, Smartphone,
  TrendingUp, Wallet, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api/client';
import useApi from '../../hooks/useApi';
import { Badge, Empty, ErrorNote, Modal, PageHeader, Spinner, Tabs, money, when } from '../../components/ui';

export default function ManagerFinances() {
  const { data, loading, error, reload } = useApi('/manager/finances');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editAccount, setEditAccount] = useState(false);
  const [busy, setBusy] = useState(false);

  const [payoutForm, setPayoutForm] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    mobileMoneyNumber: '',
    mobileMoneyNetwork: ''
  });

  const openAccountModal = () => {
    if (data?.payoutAccount) {
      setPayoutForm({
        bankName: data.payoutAccount.bankName || '',
        accountNumber: data.payoutAccount.accountNumber || '',
        accountName: data.payoutAccount.accountName || '',
        mobileMoneyNumber: data.payoutAccount.mobileMoneyNumber || '',
        mobileMoneyNetwork: data.payoutAccount.mobileMoneyNetwork || ''
      });
    }
    setEditAccount(true);
  };

  const savePayoutAccount = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/manager/finances/account', payoutForm);
      toast.success('Payout account details updated');
      setEditAccount(false);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  // Filter ledger
  const filteredLedger = useMemo(() => {
    if (!data?.ledger) return [];
    let list = data.ledger;
    if (filterStatus) list = list.filter((r) => r.payment_status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.customer_name?.toLowerCase().includes(q) ||
          r.payment_reference?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data?.ledger, filterStatus, search]);

  // Export CSV
  const exportCsv = () => {
    if (!filteredLedger.length) {
      toast.error('No transactions to export');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer', 'Food Subtotal', 'Commission', 'Net Payout', 'Payment Status', 'Reference'];
    const rows = filteredLedger.map((r) => [
      r.id.slice(0, 8).toUpperCase(),
      new Date(r.created_at).toISOString(),
      `"${r.customer_name || ''}"`,
      r.subtotal,
      r.commission_amount,
      r.restaurant_payout,
      r.payment_status,
      r.payment_reference || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurant-finances-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = data?.summary || {};
  const account = data?.payoutAccount || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Finances & Payouts</h1>
          <p className="text-xs text-ink-500">
            Track gross sales, platform commissions deducted, and net restaurant earnings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openAccountModal} className="btn-ghost text-xs">
            <Building2 className="h-4 w-4" /> Payout Settings
          </button>
          <button onClick={exportCsv} className="btn-primary text-xs">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <ErrorNote message={error} />

      {loading && !data ? (
        <Spinner />
      ) : (
        <>
          {/* Lifetime Earnings Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="card p-4">
              <span className="text-xs text-ink-500 font-medium">Gross Food Sales</span>
              <p className="text-xl font-black text-ink-900 mt-1">{money(summary.total_sales)}</p>
              <span className="text-[11px] text-ink-400">Total food order value</span>
            </div>

            <div className="card p-4">
              <span className="text-xs text-rose-600 font-medium">Platform Commission</span>
              <p className="text-xl font-black text-rose-600 mt-1">-{money(summary.total_commission)}</p>
              <span className="text-[11px] text-ink-400">Commission retained</span>
            </div>

            <div className="card p-4 bg-emerald-50/50 border-emerald-200">
              <span className="text-xs text-emerald-800 font-medium">Net Restaurant Earnings</span>
              <p className="text-xl font-black text-emerald-700 mt-1">{money(summary.total_payout)}</p>
              <span className="text-[11px] text-emerald-600">Your total net payout</span>
            </div>

            <div className="card p-4">
              <span className="text-xs text-ink-500 font-medium">Paid Orders</span>
              <p className="text-xl font-bold text-ink-900 mt-1">{summary.paid_orders || 0}</p>
              <span className="text-[11px] text-ink-400">Fulfilled and settled</span>
            </div>

            <div className="card p-4">
              <span className="text-xs text-ink-500 font-medium">Average Order Size</span>
              <p className="text-xl font-bold text-ink-900 mt-1">{money(summary.avg_order_value)}</p>
              <span className="text-[11px] text-ink-400">Average food subtotal</span>
            </div>
          </div>

          {/* Receiving Account Banner */}
          <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-ink-50 to-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink-900">Payout Receiving Details</h3>
                <p className="text-xs text-ink-500">
                  {account.bankName || account.mobileMoneyNumber ? (
                    <>
                      {account.bankName && <span>Bank: <strong>{account.bankName}</strong> ({account.accountNumber}) · </span>}
                      {account.mobileMoneyNumber && (
                        <span>Momo: <strong>{account.mobileMoneyNetwork}</strong> ({account.mobileMoneyNumber})</span>
                      )}
                    </>
                  ) : (
                    'No payout destination configured yet. Add your bank or mobile money account to receive payouts.'
                  )}
                </p>
              </div>
            </div>
            <button onClick={openAccountModal} className="btn-ghost text-xs font-semibold shrink-0">
              {account.bankName || account.mobileMoneyNumber ? 'Edit Account' : 'Set Up Account'}
            </button>
          </div>

          {/* Ledger Table */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-700">
                Order Earnings & Payout Ledger
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-ink-400" />
                  <input
                    type="text"
                    className="input pl-8 py-1 text-xs w-48 sm:w-60"
                    placeholder="Search by order or customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2 top-2 text-ink-400 hover:text-ink-600">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <select
                  className="input py-1 text-xs w-auto"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Payment status"
                >
                  <option value="">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="refund_pending">Refund Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="card overflow-x-auto">
              {!filteredLedger.length ? (
                <Empty title="No transactions found" hint="Order earnings will appear here as orders are placed." />
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-ink-200 bg-ink-50/70 font-bold uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Food Subtotal</th>
                      <th className="px-4 py-3">Commission</th>
                      <th className="px-4 py-3">Your Net Payout</th>
                      <th className="px-4 py-3">Payment Status</th>
                      <th className="px-4 py-3">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {filteredLedger.map((r) => (
                      <tr key={r.id} className="hover:bg-ink-50/40">
                        <td className="px-4 py-3 font-bold text-ink-900">
                          #{r.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                          {when(r.created_at)}
                        </td>
                        <td className="px-4 py-3 font-medium text-ink-800">
                          {r.customer_name}
                        </td>
                        <td className="px-4 py-3 font-semibold text-ink-900">
                          {money(r.subtotal)}
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-semibold">
                          -{money(r.commission_amount)}
                        </td>
                        <td className="px-4 py-3 font-black text-emerald-700">
                          {money(r.restaurant_payout)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={r.payment_status} />
                        </td>
                        <td className="px-4 py-3 text-ink-400 font-mono text-[11px] truncate max-w-[120px]" title={r.payment_reference}>
                          {r.payment_reference || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* EDIT PAYOUT ACCOUNT MODAL */}
      {editAccount && (
        <Modal title="Payout Destination Details" onClose={() => setEditAccount(false)}>
          <form onSubmit={savePayoutAccount} className="space-y-4">
            <p className="text-xs text-ink-600">
              Provide the account where platform payouts should be transferred. You can configure a bank account, mobile money, or both.
            </p>

            <div className="space-y-3 rounded-lg border border-ink-200 p-3.5 bg-ink-50/40">
              <h4 className="text-xs font-bold text-ink-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Building2 className="h-4 w-4 text-brand-600" /> Bank Account Option
              </h4>
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  className="input text-sm"
                  placeholder="e.g. Ecobank, GCB Bank, Standard Chartered"
                  value={payoutForm.bankName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    className="input text-sm"
                    placeholder="Account number"
                    value={payoutForm.accountNumber}
                    onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    className="input text-sm"
                    placeholder="Account holder name"
                    value={payoutForm.accountName}
                    onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-ink-200 p-3.5 bg-ink-50/40">
              <h4 className="text-xs font-bold text-ink-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Smartphone className="h-4 w-4 text-brand-600" /> Mobile Money Option
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Network</label>
                  <select
                    className="input text-sm"
                    value={payoutForm.mobileMoneyNetwork}
                    onChange={(e) => setPayoutForm({ ...payoutForm, mobileMoneyNetwork: e.target.value })}
                  >
                    <option value="">Select network</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Telecel / Vodafone Cash">Telecel / Vodafone Cash</option>
                    <option value="AirtelTigo Money">AirtelTigo Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Momo Phone Number</label>
                  <input
                    type="tel"
                    className="input text-sm"
                    placeholder="e.g. +233 24 123 4567"
                    value={payoutForm.mobileMoneyNumber}
                    onChange={(e) => setPayoutForm({ ...payoutForm, mobileMoneyNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button type="button" onClick={() => setEditAccount(false)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={busy} className="btn-primary">
                {busy ? 'Saving…' : 'Save Details'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
