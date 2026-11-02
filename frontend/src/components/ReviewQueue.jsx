import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Modal, Field, Tabs, Spinner, Empty, ErrorNote } from './ui';
import useApi from '../hooks/useApi';

// Admin approval queue used for restaurants, products and riders.
// `render(item)` draws the card body; `idOf(item)` gives the id used in the review URL.
export default function ReviewQueue({ listUrl, reviewUrl, idOf = (i) => i.id, render, noun, tabs, allowSuspend }) {
  const [status, setStatus] = useState('pending');
  const { data, loading, error, reload } = useApi(listUrl, { status });
  const [target, setTarget] = useState(null); // { item, action }
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const act = async (item, action, text) => {
    setBusy(true);
    try {
      await api.patch(`${reviewUrl}/${idOf(item)}/review`, { action, note: text });
      toast.success(`${noun} ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'suspended'}`);
      setTarget(null); setNote(''); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <>
      <Tabs tabs={tabs || [['pending', 'Waiting for review'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['', 'All']]} value={status} onChange={setStatus} />
      <ErrorNote message={error} />
      {loading ? <Spinner /> : !data?.length ? <Empty title={`No ${noun.toLowerCase()}s here`} /> : (
        <div className="grid gap-3 lg:grid-cols-2">
          {data.map((item) => (
            <div key={idOf(item)} className="card flex flex-col justify-between p-4">
              {render(item)}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
                {item.status !== 'approved' && <button className="btn-primary" disabled={busy} onClick={() => act(item, 'approve')}>Approve</button>}
                {item.status !== 'rejected' && <button className="btn-ghost" onClick={() => setTarget({ item, action: 'reject' })}>Reject</button>}
                {allowSuspend && item.status === 'approved' && <button className="btn-danger" onClick={() => setTarget({ item, action: 'suspend' })}>Suspend</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {target && (
        <Modal title={`${target.action === 'reject' ? 'Reject' : 'Suspend'} ${noun.toLowerCase()}`} onClose={() => setTarget(null)}>
          <Field label="Reason (sent to the owner)">
            <textarea className="input min-h-24" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Explain what needs to change" />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setTarget(null)}>Cancel</button>
            <button className="btn-danger" disabled={!note.trim() || busy} onClick={() => act(target.item, target.action, note)}>Confirm</button>
          </div>
        </Modal>
      )}
    </>
  );
}
