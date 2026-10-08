import { HandCoins, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, IconButton, Input, Modal, Select } from '@/components/ui';
import { usePayrollAction } from '@/features/payroll/hooks/usePayroll';
import { payrollService } from '@/features/payroll/services/payrollService';
import type { SalaryComponent, StaffSalary } from '@/features/payroll/types/payroll.types';
import { employeeName } from '@/features/payroll/utils/payroll.utils';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Save a new salary-structure version (basic + allowances/deductions) for one employee. */
export function SalaryStructureModal({ staff, onClose }: { staff: StaffSalary | null; onClose: () => void }) {
  const [basic, setBasic] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const save = usePayrollAction(() => payrollService.saveStructure(staff!.id, { basicSalary: basic, effectiveFrom, components }), {
    success: 'Salary structure saved',
    onDone: onClose,
    toastErrors: false,
  });
  useEffect(() => {
    if (!staff) return;
    save.reset();
    setBasic(staff.structure ? String(Number(staff.structure.basicSalary)) : '');
    setEffectiveFrom(new Date().toISOString().slice(0, 10));
    setComponents(staff.structure?.components.map(({ kind, name, calc, value }) => ({ kind, name, calc, value: String(Number(value)) })) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff]);
  const set = (i: number, patch: Partial<SalaryComponent>) => setComponents((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <Modal
      open={!!staff}
      title={staff ? `Salary · ${employeeName(staff)}` : 'Salary'}
      onClose={onClose}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="salary" loading={save.isPending}>Save new version</Button></>}
    >
      <form id="salary" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-4">
        {save.error && <Alert>{errorMessage(save.error, 'Could not save the salary.')}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Basic salary (monthly)"><Input required inputMode="decimal" pattern="\d{1,10}(\.\d{1,2})?" value={basic} onChange={(e) => setBasic(e.target.value)} /></Field>
          <Field label="Effective from"><Input type="date" required value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} /></Field>
        </div>
        <div>
          <div className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Allowances and deductions</div>
          <div className="space-y-2">
            {components.map((c, i) => (
              <div key={i} className="grid grid-cols-[7.5rem_1fr_9rem_7rem_auto] items-center gap-2">
                <Select aria-label="Kind" value={c.kind} onChange={(e) => set(i, { kind: e.target.value as SalaryComponent['kind'] })}>
                  <option value="earning">Allowance</option><option value="deduction">Deduction</option>
                </Select>
                <Input aria-label="Name" required maxLength={80} value={c.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="House rent" />
                <Select aria-label="Calculation" value={c.calc} onChange={(e) => set(i, { calc: e.target.value as SalaryComponent['calc'] })}>
                  <option value="fixed">Fixed amount</option><option value="percent_of_basic">% of basic</option>
                </Select>
                <Input aria-label="Value" required inputMode="decimal" pattern="\d{1,10}(\.\d{1,2})?" value={c.value} onChange={(e) => set(i, { value: e.target.value })} />
                <IconButton icon={Trash2} label="Remove" tone="danger" onClick={() => setComponents((r) => r.filter((_, idx) => idx !== i))} />
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" icon={HandCoins} className="mt-2" onClick={() => setComponents((r) => [...r, { kind: 'earning', name: '', calc: 'fixed', value: '' }])}>Add line</Button>
        </div>
        <p className="text-sm text-slate-500">Saving creates a new version; past payroll runs keep the amounts they were calculated with.</p>
      </form>
    </Modal>
  );
}
