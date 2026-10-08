import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal } from '@/components/ui';
import { useAcademicsAction } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { Subject } from '@/features/academics/types/academics.types';
import { onSubmit } from '@/lib/forms';

/** Create (subject = 'new') or edit a subject. */
export function SubjectFormModal({ subject, onClose }: { subject: Subject | 'new' | null; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', code: '' });
  const id = subject && subject !== 'new' ? subject.id : undefined;
  useEffect(() => {
    if (subject) setForm(subject === 'new' ? { name: '', code: '' } : { name: subject.name, code: subject.code });
  }, [subject]);
  const save = useAcademicsAction(() => academicsService.saveSubject(id, form), 'Subject saved', onClose);
  return (
    <Modal
      open={!!subject}
      title={id ? 'Edit subject' : 'New subject'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="subject-form" loading={save.isPending}>Save</Button>
        </>
      }
    >
      <form id="subject-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field label="Name">
            <Input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
        </div>
        <Field label="Code">
          <Input required pattern="[A-Za-z0-9-]{1,20}" title="1–20 letters, digits or hyphens" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        </Field>
      </form>
    </Modal>
  );
}
