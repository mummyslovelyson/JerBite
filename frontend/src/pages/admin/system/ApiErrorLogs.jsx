import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Eye, Search, Code, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../../../api/client';
import { when, Spinner, PageHeader, Modal, ErrorNote } from '../../../components/ui';

export default function ApiErrorLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/admin/system/api-logs');
      setLogs(res.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Error Logs"
        sub="Runtime exceptions, failed HTTP requests, 5xx server faults, and operational stack traces"
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 shadow-2xs hover:bg-ink-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Errors
        </button>
      </PageHeader>

      {err && <ErrorNote message={err} />}

      {loading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center text-ink-400">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-2 font-bold text-sm text-ink-900">Zero unhandled API errors!</h3>
          <p className="text-xs text-ink-500">The platform is executing without runtime exceptions.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Method</th>
                  <th className="px-4 py-3.5">Endpoint URL</th>
                  <th className="px-4 py-3.5">Status Code</th>
                  <th className="px-4 py-3.5">Error Message</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-ink-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-ink-900">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] uppercase ${
                        log.method === 'POST' ? 'bg-indigo-100 text-indigo-700' : log.method === 'PATCH' ? 'bg-amber-100 text-amber-800' : 'bg-ink-100 text-ink-700'
                      }`}>
                        {log.method || 'GET'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-800">{log.endpoint}</td>
                    <td className="px-4 py-3 font-mono font-extrabold text-rose-700">{log.status_code || 500}</td>
                    <td className="px-4 py-3 text-ink-600 max-w-[280px] truncate">{log.error_message}</td>
                    <td className="px-4 py-3 text-ink-400 text-[11px]">{when(log.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-100 shadow-2xs"
                      >
                        Inspect Stack
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Stack Modal */}
      {selectedLog && (
        <Modal
          title={`Error ${selectedLog.status_code || 500}: ${selectedLog.endpoint}`}
          onClose={() => setSelectedLog(null)}
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-ink-500 uppercase text-[10px]">Message:</span>
              <p className="font-bold text-rose-700 mt-0.5">{selectedLog.error_message}</p>
            </div>

            {selectedLog.stack_trace && (
              <div>
                <span className="font-bold text-ink-500 uppercase text-[10px]">Stack Trace:</span>
                <pre className="mt-1 overflow-x-auto rounded-xl bg-ink-900 p-3 font-mono text-[11px] text-ink-100 max-h-60">
                  {selectedLog.stack_trace}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-ink-700 hover:bg-ink-100"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
