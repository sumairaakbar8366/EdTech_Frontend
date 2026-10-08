import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, Modal, Select, TextArea } from '@/components/ui';
import { requestService, TYPE_HINT, TYPE_LABEL, useRequestAction, type Delivery, type RequestType } from '@/features/document-requests/requests';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Ask the school for a document. Parents choose which child; a student requests for themselves. */
export function NewRequestModal({ open, onClose, students }: { open: boolean; onClose: () => void; students: { id: string; name: string }[] }) {
  const [studentId, setStudentId] = useState('');
  const [type, setType] = useState<RequestType>('marksheet');
  const [purpose, setPurpose] = useState('');
  const [details, setDetails] = useState('');
  const [copies, setCopies] = useState('1');
  const [delivery, setDelivery] = useState<Delivery>('pickup');
  const save = useRequestAction(requestService.create, 'Request sent to the school office', onClose);

  useEffect(() => {
    if (!open) return;
    setStudentId(students.length === 1 ? students[0]!.id : '');
    setType('marksheet');
    setPurpose('');
    setDetails('');
    setCopies('1');
    setDelivery('pickup');
    save.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      open={open}
      title="Request a document"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="doc-request" icon={Send} loading={save.isPending}>Send request</Button>
        </>
      }
    >
      <form id="doc-request" onSubmit={onSubmit(() => save.mutate({ studentId, type, purpose, details: details.trim() || null, copies: Number(copies), delivery }))} className="grid gap-4 sm:grid-cols-2">
        {save.error && <div className="sm:col-span-2"><Alert>{errorMessage(save.error, 'Could not send the request.')}</Alert></div>}
        {students.length > 1 && (
          <div className="sm:col-span-2">
            <Field label="For">
              <Select required value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Choose your child</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
          </div>
        )}
        <div className="sm:col-span-2">
          <Field label="Document" hint={TYPE_HINT[type]}>
            <Select required value={type} onChange={(e) => setType(e.target.value as RequestType)}>
              {(Object.keys(TYPE_LABEL) as RequestType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </Select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Purpose" hint="Why you need it, e.g. admission to another school, bank account, visa">
            <Input required minLength={3} maxLength={300} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Details (optional)" hint="Which exam or session, name spelling, anything the office should know">
            <TextArea rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} />
          </Field>
        </div>
        <Field label="Copies">
          <Input type="number" required min={1} max={10} value={copies} onChange={(e) => setCopies(e.target.value)} />
        </Field>
        <Field label="Delivery">
          <Select value={delivery} onChange={(e) => setDelivery(e.target.value as Delivery)}>
            <option value="pickup">Collect from the school office</option>
            <option value="digital">Digital copy (download here)</option>
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
