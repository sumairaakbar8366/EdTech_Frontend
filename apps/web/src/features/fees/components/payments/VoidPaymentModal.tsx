import { useState } from 'react';
import { Button, Field, Modal, TextArea } from '@/components/ui';
import { useFeesAction } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import type { Payment } from '@/features/fees/types/fee.types';
import { money, studentName } from '@/features/fees/utils/fee.utils';

/** Void a payment with a reason; its allocations are reversed and the receipt is marked void. */
export function VoidPaymentModal({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const [note, setNote] = useState('');
  const voidIt = useFeesAction(() => feeService.voidPayment(payment!.id, note), {
    success: 'Payment voided; invoice balances restored',
    onDone: () => {
      setNote('');
      onClose();
    },
  });
  return (
    <Modal
      open={!!payment}
      title="Void payment"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={voidIt.isPending} disabled={!note.trim()} onClick={() => voidIt.mutate(undefined)}>Void payment</Button>
        </>
      }
    >
      {payment && (
        <div className="space-y-3">
          <p className="text-slate-600 dark:text-slate-300">
            Voiding receipt <strong>{payment.receipt?.receiptNo}</strong> ({money(payment.amount)} from {studentName(payment.student)}) reverses it on every invoice it paid. The receipt stays on record, marked void.
          </p>
          <Field label="Reason"><TextArea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} /></Field>
        </div>
      )}
    </Modal>
  );
}
