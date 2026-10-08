import { useState } from 'react';
import { Alert, Badge, Button, Field, Input, Modal, Select, Spinner, TextArea } from '@/components/ui';
import { INVOICE_TONE, METHOD_LABEL } from '@/features/fees/constants';
import { useFeesAction, useStatement } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import type { PaymentMethod, StudentRef } from '@/features/fees/types/fee.types';
import { balanceOf, money } from '@/features/fees/utils/fee.utils';
import { StudentPicker } from '@/features/students/components/StudentPicker';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { formatDate } from '@/lib/format';

/** Take a payment from a student; it is applied to their oldest open invoices and a receipt is issued. */
export function RecordPaymentModal({ open, onClose, onRecorded }: { open: boolean; onClose: () => void; onRecorded: (paymentId: string) => void }) {
  const [student, setStudent] = useState<StudentRef | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const statement = useStatement(student?.id);
  const openInvoices = statement.data?.invoices.filter((i) => ['pending', 'partial', 'overdue'].includes(i.status)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)) ?? [];
  const outstanding = openInvoices.reduce((s, i) => s + balanceOf(i), 0);

  const record = useFeesAction(() => feeService.recordPayment({ studentId: student!.id, amount, method, reference: reference || null, notes: notes || null }), {
    success: (r) => `Payment recorded · receipt ${r.receiptNo}`,
    onDone: (r) => {
      reset();
      onClose();
      onRecorded(r.paymentId);
    },
    toastErrors: false,
  });
  function reset() { setStudent(null); setAmount(''); setMethod('cash'); setReference(''); setNotes(''); record.reset(); }

  return (
    <Modal
      open={open}
      title="Record payment"
      onClose={() => { reset(); onClose(); }}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" form="record-payment" loading={record.isPending} disabled={!student || !amount || outstanding === 0}>Record &amp; issue receipt</Button>
        </>
      }
    >
      <form id="record-payment" onSubmit={onSubmit(() => record.mutate(undefined))} className="space-y-4">
        {record.error && <Alert>{errorMessage(record.error, 'Could not record the payment.')}</Alert>}
        <Field label="Student" required><StudentPicker value={student} onChange={setStudent} /></Field>
        {student && statement.isLoading && <Spinner />}
        {student && statement.data && (
          openInvoices.length === 0 ? (
            <Alert tone="success">This student has no outstanding invoices.</Alert>
          ) : (
            <div className="rounded-xl bg-slate-500/5 p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold uppercase tracking-wider text-slate-500">Open invoices (oldest paid first)</span>
                <button type="button" className="font-semibold text-primary-600 hover:underline dark:text-primary-300" onClick={() => setAmount(outstanding.toFixed(2))}>
                  Pay all {money(outstanding)}
                </button>
              </div>
              <ul className="space-y-1">
                {openInvoices.map((i) => (
                  <li key={i.id} className="flex items-center justify-between text-sm">
                    <span><span className="tabular-nums">{i.invoiceNo}</span> · {i.periodLabel} · due {formatDate(i.dueDate)} <Badge tone={INVOICE_TONE[i.status]}>{i.status}</Badge></span>
                    <span className="font-semibold tabular-nums">{money(balanceOf(i))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Amount"><Input required inputMode="decimal" pattern="\d{1,10}(\.\d{1,2})?" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></Field>
          <Field label="Method">
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {(Object.keys(METHOD_LABEL) as PaymentMethod[]).map((m) => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}
            </Select>
          </Field>
          <Field label="Reference" hint="Cheque / transaction no."><Input maxLength={100} value={reference} onChange={(e) => setReference(e.target.value)} /></Field>
        </div>
        <Field label="Notes"><TextArea maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}
