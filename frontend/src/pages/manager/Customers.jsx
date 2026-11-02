import { useState } from 'react';
import {
  Users, Search, Star, MessageSquare, ShoppingBag,
  Clock, CheckCircle2, ChevronRight, Send, AlertCircle
} from 'lucide-react';
import useApi from '../../hooks/useApi';
import api, { errMsg } from '../../api/client';
import { Spinner, Empty, ErrorNote, Badge, money } from '../../components/ui';
import toast from 'react-hot-toast';

export default function ManagerCustomers() {
  const [activeTab, setActiveTab] = useState('customers'); // 'customers', 'feedback', 'issues'
  const [search, setSearch] = useState('');

  const { data: customers, loading: loadingCust, error: errCust } = useApi('/manager/customers', { search });
  const { data: feedback, loading: loadingFeed, error: errFeed, reload: reloadFeed } = useApi('/manager/feedback');
  const { data: issues, loading: loadingIssues, error: errIssues, reload: reloadIssues } = useApi('/manager/issues');

  // Customer inspection modal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const { data: customerDetail, loading: loadingDetail } = useApi(
    selectedCustomerId ? `/manager/customers/${selectedCustomerId}` : null
  );

  // Review reply state
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);

  const handleReplyReview = async (id) => {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      await api.post(`/manager/feedback/${id}/reply`, { reply: replyText.trim() });
      toast.success('Your response was posted and sent to customer');
      setReplyText('');
      setReplyReviewId(null);
      reloadFeed();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-950">Restaurant Customer Management</h1>
          <p className="text-xs text-ink-500">Manage patrons who have placed orders with your kitchen, review ratings, and handle feedback</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-200 gap-6 text-xs font-bold">
        {[
          { key: 'customers', label: 'My Customers', count: customers?.length, icon: Users },
          { key: 'feedback', label: 'Reviews & Ratings', count: feedback?.length, icon: Star },
          { key: 'issues', label: 'Customer Complaints & Issues', count: issues?.length, icon: MessageSquare }
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
              {tab.count !== undefined && (
                <span className="rounded-full bg-ink-100 px-2 py-0.2 text-[10px] text-ink-700">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers by name or phone…"
                className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-xs text-ink-900 focus:outline-none"
              />
            </div>
          </div>

          <ErrorNote message={errCust} />
          {loadingCust ? (
            <Spinner />
          ) : !customers?.length ? (
            <Empty title="No customers yet" hint="Patrons who order from your restaurant will appear here." />
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Phone (Order Contact)</th>
                    <th className="px-5 py-3">Orders Fulfilled</th>
                    <th className="px-5 py-3">Total Spend</th>
                    <th className="px-5 py-3">Most Recent Order</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-ink-50/50 transition">
                      <td className="px-5 py-3.5 font-bold text-ink-950 text-sm">{c.name}</td>
                      <td className="px-5 py-3.5 font-mono text-ink-600">
                        {c.phone ? c.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : 'Protected'}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-ink-800">{c.order_count} orders</td>
                      <td className="px-5 py-3.5 font-extrabold text-brand-700">{money(c.total_spent)}</td>
                      <td className="px-5 py-3.5 text-ink-500 text-[11px]">{new Date(c.last_order_date).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedCustomerId(c.id)}
                          className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-bold text-ink-700 hover:bg-ink-100"
                        >
                          Order History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FEEDBACK & REVIEWS */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <ErrorNote message={errFeed} />
          {loadingFeed ? (
            <Spinner />
          ) : !feedback?.length ? (
            <Empty title="No customer reviews yet" hint="Ratings and reviews left by diners will show here." />
          ) : (
            <div className="grid gap-4">
              {feedback.map((rev) => (
                <div key={rev.id} className="card p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-ink-950">{rev.customer_name}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-ink-400">{new Date(rev.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-ink-700 leading-relaxed bg-ink-50 p-3 rounded-xl">{rev.comment}</p>
                  )}

                  {rev.manager_reply ? (
                    <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-3 text-xs space-y-1">
                      <span className="font-bold text-brand-800">Your Response:</span>
                      <p className="text-ink-700">{rev.manager_reply}</p>
                    </div>
                  ) : (
                    <div>
                      {replyReviewId === rev.id ? (
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Write a polite public reply to this review…"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="input flex-1 text-xs"
                          />
                          <button
                            disabled={busy}
                            onClick={() => handleReplyReview(rev.id)}
                            className="btn-primary text-xs"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyReviewId(null)}
                            className="btn-ghost text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setReplyReviewId(rev.id); setReplyText(''); }}
                          className="text-xs font-bold text-brand-600 hover:underline"
                        >
                          Reply to Review &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ISSUES & COMPLAINTS */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <ErrorNote message={errIssues} />
          {loadingIssues ? (
            <Spinner />
          ) : !issues?.length ? (
            <Empty title="No customer issues" hint="Disputes or complaints regarding your kitchen will show here." />
          ) : (
            <div className="grid gap-4">
              {issues.map((issue) => (
                <div key={issue.id} className="card p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-brand-700">#{issue.ticket_number}</span>
                      <h4 className="font-extrabold text-sm text-ink-950 mt-0.5">{issue.subject}</h4>
                      <p className="text-xs text-ink-500">By {issue.customer_name}</p>
                    </div>
                    <Badge status={issue.status} />
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed bg-ink-50 p-3 rounded-xl">{issue.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-ink-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-ink-950">{customerDetail?.customer?.name}</h3>
                <p className="text-xs text-ink-500">Order History with your Restaurant</p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="rounded-xl p-2 text-ink-400 hover:bg-ink-100"
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <Spinner />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs bg-ink-50 p-3 rounded-2xl">
                  <div>
                    <span className="text-ink-400 block font-medium">Orders Placed</span>
                    <span className="font-bold text-ink-900">{customerDetail?.customer?.order_count} times</span>
                  </div>
                  <div>
                    <span className="text-ink-400 block font-medium">Total Spend</span>
                    <span className="font-bold text-brand-700">{money(customerDetail?.customer?.total_spent)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Past Orders</p>
                  {customerDetail?.orders?.map((o) => (
                    <div key={o.id} className="rounded-xl border border-ink-200 p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-brand-700">#{o.id.slice(0, 8).toUpperCase()}</span>
                        <p className="text-ink-500 text-[11px]">{new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-ink-900 block">{money(o.total)}</span>
                        <Badge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
