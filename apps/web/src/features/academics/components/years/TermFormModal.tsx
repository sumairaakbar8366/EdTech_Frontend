import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal } from '@/components/ui';
import { useAcademicsAction } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { AcademicYear, Term } from '@/features/academics/types/academics.types';
import { onSubmit } from '@/lib/forms';
import { dateOnly } from '@/lib/format';

/** Add a term to `year`, or edit `term`. */
export function TermFormModal({ target, onClose }: { target: { year: AcademicYear; term?: Term } | null; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });
  useEffect(() => {
    if (!target) return;
    const { year, term } = target;
    setForm(term ? { name: term.name, startDate: dateOnly(term.startDate), endDate: dateOnly(term.endDate) } : { name: '', startDate: dateOnly(year.startDate), endDate: '' });
  }, [target]);
  const save = useAcademicsAction(
    () => (target?.term ? academicsService.updateTerm(target.term.id, form) : academicsService.createTerm(target!.year.id, form)),
    'Term saved',
    onClose,
  );
  return (
    <Modal
      open={!!target}
      title={target?.term ? 'Edit term' : 'Add term'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="term-form" loading={save.isPending}>Save</Button>
        </>
      }
    >
      <form id="term-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-4">
        <Field label="Name" hint="e.g. Term 1, Spring Semester">
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
      </form>
    </Modal>
  );
}
