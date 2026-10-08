import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal } from '@/components/ui';
import { useAcademicsAction } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { SchoolClass } from '@/features/academics/types/academics.types';
import { onSubmit } from '@/lib/forms';

/** Create a class (`nextLevel` pre-fills its level) or edit one. */
export function ClassFormModal({ target, nextLevel, onClose }: { target: SchoolClass | 'new' | null; nextLevel: number; onClose: () => void }) {
  const existing = target && target !== 'new' ? target : null;
  const [form, setForm] = useState({ name: '', level: '' });
  useEffect(() => {
    if (target) setForm(existing ? { name: existing.name, level: String(existing.level) } : { name: '', level: String(nextLevel) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  const save = useAcademicsAction(() => academicsService.saveClass(existing?.id, { name: form.name, level: Number(form.level) }), 'Class saved', onClose);
  return (
    <Modal
      open={!!target}
      title={existing ? 'Edit class' : 'New class'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="class-form" loading={save.isPending}>Save</Button>
        </>
      }
    >
      <form id="class-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field label="Name" hint="e.g. Grade 5">
            <Input required maxLength={50} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
        </div>
        <Field label="Level" hint="Sort order">
          <Input type="number" required min={1} max={100} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
        </Field>
      </form>
    </Modal>
  );
}
