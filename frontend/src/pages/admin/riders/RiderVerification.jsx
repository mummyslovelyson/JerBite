import { useState, useEffect } from 'react';
import { FileText, CheckCircle2, XCircle, ExternalLink, RefreshCw, ShieldCheck, Search, Bike } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Badge, Modal, Field, ErrorNote } from '../../../components/ui';

export default function RiderVerification() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const [modal, setModal] = useState({ open: false, doc: null, status: 'verified', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get(`/admin/rider-documents?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setDocuments(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (modal.status === 'rejected' && !modal.note.trim()) {
      alert('A note is required to reject a rider credential');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/admin/rider-documents/${modal.doc.id}/review`, {
        status: modal.status,
        note: modal.note.trim()
      });
      setModal({ open: false, doc: null, status: 'verified', note: '' });
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
        title="Rider Verification"
        sub="Verify driver licenses, vehicle roadworthiness certificates, and courier identity documentation"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </PageHeader>

      {/* Filter and Search */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by rider name or document type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-9 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs"
          >
            <option value="">All Verification Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={load}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700"
          >
            Filter
          </button>
        </div>
      </div>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : documents.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">No rider documents found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Courier Name</th>
                  <th className="px-4 py-3.5">Document Type</th>
                  <th className="px-4 py-3.5">Vehicle</th>
                  <th className="px-4 py-3.5">Document File</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <p>{d.rider_name}</p>
                      <p className="text-[10px] text-ink-400 font-normal">{d.rider_phone || d.rider_email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-700 font-semibold flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-sky-600" />
                      <span>{d.document_type}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-600 capitalize">{d.vehicle_type || 'Motorcycle'}</td>
                    <td className="px-4 py-3">
                      {d.file_url ? (
                        <a
                          href={d.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-brand-600 hover:underline"
                        >
                          View File <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-ink-400 italic">No link available</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><Badge status={d.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setModal({ open: true, doc: d, status: 'rejected', note: '' })}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setModal({ open: true, doc: d, status: 'verified', note: '' })}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                        >
                          Verify & Pass
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {modal.open && (
        <Modal
          title={`Verify ${modal.doc?.document_type} for ${modal.doc?.rider_name}`}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <form onSubmit={handleReview} className="space-y-4">
            <Field label="Verification Audit Note" hint={modal.status === 'rejected' ? 'Required' : 'Optional'}>
              <textarea
                rows={3}
                required={modal.status === 'rejected'}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder="Enter verification comments..."
                className="w-full rounded-xl border border-ink-200 p-2.5 text-xs focus:border-brand-500 focus:outline-hidden"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal({ ...modal, open: false })}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs ${
                  modal.status === 'verified' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? 'Saving...' : `Confirm ${modal.status.toUpperCase()}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
