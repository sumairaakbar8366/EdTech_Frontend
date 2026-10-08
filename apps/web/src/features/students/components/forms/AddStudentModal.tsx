import { useEffect, useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { ClassAccessFields } from '@/features/students/components/forms/ClassAccessFields';
import { GuardianFields } from '@/features/students/components/forms/GuardianFields';
import { StudentInfoFields } from '@/features/students/components/forms/StudentInfoFields';
import { useStudentsAction } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import { emptyAddStudentForm, toCreatePayload, type AddStudentForm } from '@/features/students/utils/student.utils';
import { onSubmit } from '@/lib/forms';

/** Add a student with their first guardian, optional class and logins (page 5). */
export function AddStudentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const [form, setForm] = useState<AddStudentForm>(emptyAddStudentForm);
  useEffect(() => {
    if (open) setForm(emptyAddStudentForm());
  }, [open]);
  const set = (patch: Partial<AddStudentForm>) => setForm((f) => ({ ...f, ...patch }));
  const save = useStudentsAction(() => studentService.create(toCreatePayload(form)), 'Student added', (s) => {
    onClose();
    onCreated(s.id);
  });
  return (
    <Modal
      open={open}
      size="xl"
      title="Add student"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="student-form" loading={save.isPending} disabled={form.guardianMode === 'existing' && !form.guardianId}>Add student</Button>
        </>
      }
    >
      <form id="student-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-6">
        <StudentInfoFields form={form} set={set} />
        <GuardianFields form={form} set={set} open={open} />
        <ClassAccessFields form={form} set={set} />
      </form>
    </Modal>
  );
}
