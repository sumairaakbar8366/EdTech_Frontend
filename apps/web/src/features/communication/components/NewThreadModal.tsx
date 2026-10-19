import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, Modal, SearchSelect, Spinner, TextArea } from '@/components/ui';
import { useCommunicationAction, useContacts } from '@/features/communication/hooks/useCommunication';
import { communicationService } from '@/features/communication/services/communicationService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Start a conversation about one student with one of their teachers (or, for teachers, a parent). */
export function NewThreadModal({ open, onClose, onStarted }: { open: boolean; onClose: () => void; onStarted: (id: string) => void }) {
  const contacts = useContacts(open);
  const [studentId, setStudentId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const student = contacts.data?.find((c) => c.studentId === studentId);
  useEffect(() => {
    if (open && contacts.data?.length === 1 && !studentId) setStudentId(contacts.data[0]!.studentId);
  }, [open, contacts.data, studentId]);
  const start = useCommunicationAction(() => communicationService.startThread({ studentId, recipientId, subject, body }), {
    success: 'Message sent',
    onDone: (t) => {
      setSubject('');
      setBody('');
      setRecipientId('');
      onStarted(t.id);
    },
    toastErrors: false,
  });
  return (
    <Modal open={open} title="New message" onClose={onClose} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="new-thread" loading={start.isPending} disabled={!recipientId || !studentId}>Send</Button></>}>
      {contacts.isLoading && <Spinner />}
      {contacts.data?.length === 0 && <Alert tone="info">There is nobody to message yet: teachers are listed once your child is enrolled in a section with assigned teachers.</Alert>}
      {!!contacts.data?.length && (
        <form id="new-thread" onSubmit={onSubmit(() => start.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
          {start.error && <div className="sm:col-span-2"><Alert>{errorMessage(start.error, 'Could not send the message.')}</Alert></div>}
          <Field label="About" required>
            <SearchSelect
              value={studentId}
              onChange={(v) => { setStudentId(v); setRecipientId(''); }}
              placeholder="Search student by name or class…"
              options={contacts.data.map((c) => ({ value: c.studentId, label: c.studentName, detail: c.section ?? undefined }))}
              emptyText="No student matches"
            />
          </Field>
          <Field label="To" required>
            <SearchSelect
              value={recipientId}
              disabled={!student}
              onChange={setRecipientId}
              placeholder={!student ? 'Choose a student first' : !student.contacts.length ? 'No one available' : 'Search by name or subject…'}
              options={student?.contacts.map((c) => ({ value: c.userId, label: c.name, detail: c.detail })) ?? []}
              emptyText="Nobody matches"
            />
          </Field>
          <div className="sm:col-span-2"><Field label="Subject"><Input required maxLength={150} value={subject} onChange={(e) => setSubject(e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Message"><TextArea required maxLength={5000} rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></Field></div>
        </form>
      )}
    </Modal>
  );
}
