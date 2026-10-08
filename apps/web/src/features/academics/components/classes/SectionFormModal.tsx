import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { useAcademicsAction } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { SchoolClass, Section } from '@/features/academics/types/academics.types';
import { useActiveCampuses } from '@/features/campuses/hooks/useCampuses';
import { onSubmit, optionalNumber } from '@/lib/forms';

/** Add a section to a class, or edit one. Sections run at a specific campus (decision 10). */
export function SectionFormModal({ target, onClose }: { target: { schoolClass: SchoolClass; section?: Section } | null; onClose: () => void }) {
  const campuses = useActiveCampuses(!!target);
  const [form, setForm] = useState({ campusId: '', name: '', capacity: '' });
  useEffect(() => {
    if (!target) return;
    const s = target.section;
    setForm({ campusId: s?.campusId ?? campuses.data?.[0]?.id ?? '', name: s?.name ?? '', capacity: s?.capacity?.toString() ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  const save = useAcademicsAction(
    () =>
      target!.section
        ? academicsService.updateSection(target!.section.id, { name: form.name, campusId: form.campusId, capacity: optionalNumber(form.capacity, null) as number | null })
        : academicsService.createSection({ classId: target!.schoolClass.id, campusId: form.campusId, name: form.name, capacity: optionalNumber(form.capacity) ?? undefined }),
    'Section saved',
    onClose,
  );
  const className = target?.schoolClass.name ?? '';
  return (
    <Modal
      open={!!target}
      title={target?.section ? `Edit section · ${className}` : `New section · ${className}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="section-form" loading={save.isPending}>Save</Button>
        </>
      }
    >
      <form id="section-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Section name" hint="e.g. A, B, Blue">
            <Input required maxLength={20} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Capacity (optional)">
            <Input type="number" min={1} max={1000} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </Field>
        </div>
        <Field label="Campus">
          <Select required value={form.campusId} onChange={(e) => setForm({ ...form, campusId: e.target.value })}>
            <option value="" disabled>Select a campus…</option>
            {campuses.data?.map((cp) => <option key={cp.id} value={cp.id}>{cp.name} ({cp.code})</option>)}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
