import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal, TextArea } from '@/components/ui';
import { money } from '@/features/fees/utils/fee.utils';
import { usePayrollAction } from '@/features/payroll/hooks/usePayroll';
import { payrollService } from '@/features/payroll/services/payrollService';
import type { PayItem } from '@/features/payroll/types/payroll.types';
import { employeeName } from '@/features/payroll/utils/payroll.utils';
import { onSubmit } from '@/lib/forms';

/** Bonus and a manual deduction on one employee's line of a draft run. */
export function AdjustItemModal({ item, onClose }: { item: PayItem | null; onClose: () => void }) {
  const [bonus, setBonus] = useState('0');
  const [manual, setManual] = useState('0');
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!item) return;
    const m = item.deductions.find((d) => d.type === 'manual');
    setBonus(String(Number(item.bonus)));
    setManual(m ? String(Number(m.amount)) : '0');
    setLabel(m?.label ?? '');
    setNote(item.note ?? '');
  }, [item]);
  const save = usePayrollAction(
    () => payrollService.adjustItem(item!.id, { bonus: bonus || '0', manualDeduction: manual || '0', manualDeductionLabel: label || null, note: note || null }),
    { success: 'Adjustment saved', onDone: onClose },
  );
  return (
    <Modal
      open={!!item}
      title={item ? `Adjust · ${employeeName(item.employee)}` : 'Adjust'}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="adjust" loading={save.isPending}>Save</Button></>}
    >
      {item && (
        <form id="adjust" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 rounded-xl bg-slate-500/5 p-3 text-sm sm:col-span-2">
            {item.deductions.filter((d) => d.type !== 'manual').map((d) => (
              <div key={d.id} className="flex justify-between"><span>{d.label}</span><span className="tabular-nums">−{money(d.amount)}</span></div>
            ))}
            {item.deductions.filter((d) => d.type !== 'manual').length === 0 && <div className="text-slate-500">No calculated deductions.</div>}
          </div>
          <Field label="Bonus"><Input inputMode="decimal" pattern="\d{1,10}(\.\d{1,2})?" value={bonus} onChange={(e) => setBonus(e.target.value)} /></Field>
          <Field label="Other deduction"><Input inputMode="decimal" pattern="\d{1,10}(\.\d{1,2})?" value={manual} onChange={(e) => setManual(e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Deduction label"><Input maxLength={80} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Advance recovery" /></Field></div>
          <div className="sm:col-span-2"><Field label="Note"><TextArea maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></Field></div>
        </form>
      )}
    </Modal>
  );
}
