import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal } from '@/components/ui';
import { useAcademicsAction } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { AcademicYear } from '@/features/academics/types/academics.types';
import { onSubmit } from '@/lib/forms';
import { dateOnly } from '@/lib/format';

/** Create (year = 'new') or edit an academic year. */
export function YearFormModal({ year, onClose }: { year: AcademicYear | 'new' | null; onClose: () => void }) {
  const existing = year && year !== 'new' ? year : null;
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', makeCurrent: false });
  useEffect(() => {
    if (!year) return;
    setForm(existing ? { name: existing.name, startDate: dateOnly(existing.startDate), endDate: dateOnly(existing.endDate), makeCurrent: false } : { name: '', startDate: '', endDate: '', makeCurrent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);
  const save = useAcademicsAction(
    () => {
      const dates = { name: form.name, startDate: form.startDate, endDate: form.endDate };
      return existing ? academicsService.updateYear(existing.id, dates) : academicsService.createYear({ ...dates, makeCurrent: form.makeCurrent });
    },
    'Academic year saved',
    onClose,
  );
  return (
    <Modal
      open={!!year}
      title={existing ? 'Edit academic year' : 'New academic year'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="year-form" loading={save.isPending}>Save</Button>
        </>
      }
    >
      <form id="year-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-4">
        <Field label="Name" hint="e.g. 2026-2027">
          <Input required maxLength={50} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts">
            <Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="Ends">
            <Input type="date" required min={form.startDate} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Field>
        </div>
        {!existing && (
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={form.makeCurrent} onChange={(e) => setForm({ ...form, makeCurrent: e.target.checked })} />
            Make this the current year
          </label>
        )}
      </form>
    </Modal>
  );
}
