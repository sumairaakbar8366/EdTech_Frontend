import { useState } from 'react';
import { Alert, Button, Field, Input, Modal, Select, TextArea } from '@/components/ui';
import { useFeesAction } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import type { Concession, StudentRef } from '@/features/fees/types/fee.types';
import { concessionValue } from '@/features/fees/utils/fee.utils';
import { StudentPicker } from '@/features/students/components/StudentPicker';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Award an active concession to one student for a date range. */
export function AwardModal({ open, concessions, onClose }: { open: boolean; concessions: Concession[]; onClose: () => void }) {
  const [student, setStudent] = useState<StudentRef | null>(null);
  const [discountId, setDiscountId] = useState('');
  const [reason, setReason] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');
  const grant = useFeesAction(() => feeService.grantAward({ studentId: student!.id, discountId, reason, validFrom, validUntil }), {
    success: 'Concession awarded',
    onDone: () => {
      setStudent(null); setDiscountId(''); setReason(''); setValidUntil('');
      onClose();
    },
    toastErrors: false,
  });
  return (
    <Modal
      open={open}
      title="Award a concession"
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="award" loading={grant.isPending} disabled={!student}>Award</Button></>}
    >
      <form id="award" onSubmit={onSubmit(() => grant.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
        {grant.error && <div className="sm:col-span-2"><Alert>{errorMessage(grant.error, 'Could not award the concession.')}</Alert></div>}
        <div className="sm:col-span-2"><Field label="Student" required><StudentPicker value={student} onChange={setStudent} /></Field></div>
        <div className="sm:col-span-2">
          <Field label="Concession">
            <Select required value={discountId} onChange={(e) => setDiscountId(e.target.value)}>
              <option value="">Choose…</option>
              {concessions.map((c) => <option key={c.id} value={c.id}>{c.name} ({concessionValue(c)})</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Valid from"><Input type="date" required value={validFrom} onChange={(e) => setValidFrom(e.target.value)} /></Field>
        <Field label="Valid until"><Input type="date" required min={validFrom} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></Field>
        <div className="sm:col-span-2"><Field label="Reason"><TextArea required maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></Field></div>
      </form>
    </Modal>
  );
}
