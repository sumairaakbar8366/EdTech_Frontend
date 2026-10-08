import { useState } from 'react';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { METHOD_LABEL } from '@/features/fees/constants';
import type { PaymentMethod } from '@/features/fees/types/fee.types';
import { money } from '@/features/fees/utils/fee.utils';

/** Confirms the salary payment for a whole approved run. */
export function PayRunModal({ open, total, loading, onClose, onSubmit }: { open: boolean; total: string; loading: boolean; onClose: () => void; onSubmit: (b: { method: PaymentMethod; reference: string | null }) => void }) {
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  return (
    <Modal
      open={open}
      title="Mark payroll as paid"
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={loading} onClick={() => onSubmit({ method, reference: reference || null })}>Confirm payment</Button></>}
    >
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">Records the salary payment for every employee in this run (<strong>{money(total)}</strong> in total) and generates their payslips.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Method">
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {(Object.keys(METHOD_LABEL) as PaymentMethod[]).map((m) => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}
            </Select>
          </Field>
          <Field label="Reference" hint="Bank batch / cheque no."><Input maxLength={100} value={reference} onChange={(e) => setReference(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}
