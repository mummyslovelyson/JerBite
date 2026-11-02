import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Bike, Phone, Mail, MapPin, FileText, CheckCircle2, XCircle, RefreshCw, ShoppingBag, DollarSign } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { money, when, Spinner, PageHeader, Badge, ErrorNote, Tabs } from '../../../components/ui';

export default function RiderDetailsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const riderId = searchParams.get('id');

  const [ridersList, setRidersList] = useState([]);
  const [selectedId, setSelectedId] = useState(riderId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('deliveries');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/admin/riders').then((res) => {
      setRidersList(res.data);
      if (!selectedId && res.data.length > 0) {
        setSelectedId(res.data[0].user_id);
        setSearchParams({ id: res.data[0].user_id });
      }
    }).catch(() => {});
  }, []);

  const loadDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/riders/${id}`);
      setData(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      loadDetails(selectedId);
      setSearchParams({ id: selectedId });
    }
  }, [selectedId]);

  const rider = data?.rider;
  const deliveries = data?.deliveries || [];
  const documents = data?.documents || [];
  const location = data?.location;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl text-ink-900">Rider Details</h1>
          <p className="text-xs text-ink-500 mt-0.5">Courier profile, vehicle specifications, verification records, and delivery track record</p>
        </div>

        {/* Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-ink-500">Select Courier:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-800 shadow-2xs max-w-xs truncate"
          >
            {ridersList.map((r) => (
              <option key={r.user_id} value={r.user_id}>
                {r.name} ({r.vehicle_type || 'Motorcycle'})
              </option>
            ))}
          </select>
          <button
            onClick={() => loadDetails(selectedId)}
            className="rounded-xl border border-ink-200 bg-white p-2 text-ink-600 hover:bg-ink-50 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : !rider ? (
        <div className="card p-12 text-center text-ink-400">Please choose a rider to view details.</div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-500 font-black text-white text-2xl shadow-sm">
                  {rider.name ? rider.name[0] : 'R'}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-extrabold text-ink-900">{rider.name}</h2>
                    <Badge status={rider.status} />
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      rider.is_online ? 'bg-emerald-100 text-emerald-800' : 'bg-ink-100 text-ink-600'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${rider.is_online ? 'bg-emerald-500' : 'bg-ink-400'}`} />
                      {rider.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-xs text-sky-700 font-bold mt-1 capitalize">Vehicle: {rider.vehicle_type || 'Motorcycle'}</p>
                  <p className="text-xs text-ink-500 mt-1 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {rider.email} • <Phone className="h-3.5 w-3.5" /> {rider.phone || 'No phone'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl bg-ink-50 p-3 text-center border border-ink-100">
                <div>
                  <p className="text-[10px] font-bold uppercase text-ink-400">Completed Trips</p>
                  <p className="text-lg font-black text-ink-900">{rider.deliveries || 0}</p>
                </div>
                <div className="h-8 w-px bg-ink-200" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-ink-400">Account</p>
                  <Badge status={rider.account_status} />
                </div>
              </div>
            </div>
          </div>

          {/* Subtabs */}
          <Tabs
            tabs={[
              ['deliveries', `Delivery History (${deliveries.length})`],
              ['documents', `Submitted Documents (${documents.length})`]
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === 'deliveries' && (
            <div className="card p-5">
              <h3 className="font-extrabold text-sm text-ink-900 mb-4">Completed Deliveries</h3>
              {deliveries.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-400">No deliveries completed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-ink-100 bg-ink-50 text-[11px] font-bold text-ink-500">
                      <tr>
                        <th className="px-3 py-2">Order ID</th>
                        <th className="px-3 py-2">Restaurant</th>
                        <th className="px-3 py-2">Customer</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Delivery Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {deliveries.map((d) => (
                        <tr key={d.id} className="hover:bg-ink-50">
                          <td className="px-3 py-2 font-mono font-bold text-ink-900">
                            #{d.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-3 py-2 text-ink-800 font-semibold">{d.restaurant_name}</td>
                          <td className="px-3 py-2 text-ink-700">{d.customer_name}</td>
                          <td className="px-3 py-2 text-ink-400">{when(d.created_at)}</td>
                          <td className="px-3 py-2"><Badge status={d.status} /></td>
                          <td className="px-3 py-2 text-right font-extrabold text-ink-900">{money(d.delivery_fee)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'documents' && (
            <div className="card p-5">
              <h3 className="font-extrabold text-sm text-ink-900 mb-4">Driver Documents</h3>
              {documents.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-400">No documents uploaded for this courier.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/50 p-3 text-xs">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-sky-600" />
                        <div>
                          <p className="font-bold text-ink-900">{doc.document_type}</p>
                          <p className="text-[11px] text-ink-400">Uploaded {when(doc.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge status={doc.status} />
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-brand-600 hover:underline"
                          >
                            View File
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
