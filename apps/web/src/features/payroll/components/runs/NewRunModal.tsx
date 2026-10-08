import { useState } from 'react';
import { useAreaNavigate } from '@/app/router/area';
import { Alert, Button, Field, Input, Modal } from '@/components/ui';
import { usePayrollAction } from '@/features/payroll/hooks/usePayroll';
import { payrollService } from '@/features/payroll/services/payrollService';
import { monthRange } from '@/features/payroll/utils/payroll.utils';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Calculate a payroll run for a period, then open it. */
export function NewRunModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useAreaNavigate();
  const [form, setForm] = useState({ ...monthRange(), applyAttendance: true });
  const create = usePayrollAction(() => payrollService.createRun(form), {
    success: 'Payroll calculated',
    onDone: (r) => {
      onClose();
      navigate(`/payroll/runs/${r.id}`);
    },
    toastErrors: false,
  });
  return (
    <Modal
      open={open}
      title="New payroll run"
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="new-run" loading={create.isPending}>Calculate</Button></>}
    >
      <form id="new-run" onSubmit={onSubmit(() => create.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
        {create.error && <div className="sm:col-span-2"><Alert>{errorMessage(create.error, 'Could not start the payroll run.')}</Alert></div>}
        <div className="flex gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={() => setForm((f) => ({ ...f, ...monthRange(-1) }))}>Last month</Button>
          <Button type="button" variant="secondary" onClick={() => setForm((f) => ({ ...f, ...monthRange() }))}>This month</Button>
        </div>
        <div className="sm:col-span-2"><Field label="Name"><Input required maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field></div>
        <Field label="From"><Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
        <Field label="To"><Input type="date" required min={form.startDate} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
        <label className="flex items-start gap-2 text-base text-slate-700 sm:col-span-2 dark:text-slate-200">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-primary-600" checked={form.applyAttendance} onChange={(e) => setForm({ ...form, applyAttendance: e.target.checked })} />
          <span>
            Deduct absences from staff check-in data
            <span className="block text-sm text-slate-500">Working days with no check-in and no approved leave are deducted at the daily rate. Untick if your school does not use check-in yet.</span>
          </span>
        </label>
      </form>
    </Modal>
  );
}
