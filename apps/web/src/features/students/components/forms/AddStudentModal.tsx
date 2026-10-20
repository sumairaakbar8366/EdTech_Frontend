import { useEffect, useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { ClassAccessFields } from '@/features/students/components/forms/ClassAccessFields';
import { GuardianFields } from '@/features/students/components/forms/GuardianFields';
import { StudentInfoFields } from '@/features/students/components/forms/StudentInfoFields';
import { useStudentsAction } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import { emptyAddStudentForm, toCreatePayload, type AddStudentForm } from '@/features/students/utils/student.utils';
import { CredentialsModal } from '@/features/users/components/CredentialsModal';
import { handoversOf, type LoginHandover } from '@/features/users/users';
import { onSubmit } from '@/lib/forms';
import { PhotoPicker } from '@/features/photos/PhotoPicker';

/** Add a student with their first guardian, optional class and logins (page 5). */
export function AddStudentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const [form, setForm] = useState<AddStudentForm>(emptyAddStudentForm);
  const [photoId, setPhotoId] = useState<string | null>(null);
  useEffect(() => {
    if (open) { setForm(emptyAddStudentForm()); setPhotoId(null); }
  }, [open]);
  const set = (patch: Partial<AddStudentForm>) => setForm((f) => ({ ...f, ...patch }));
  const [logins, setLogins] = useState<{ id: string; list: LoginHandover[] } | null>(null);
  const save = useStudentsAction(() => studentService.create({ ...toCreatePayload(form), photoId: photoId ?? undefined }), 'Student added', (s) => {
    onClose();
    if (s.credentials?.length) setLogins({ id: s.id, list: handoversOf(s.credentials) });
    else onCreated(s.id);
  });
  if (logins) return <CredentialsModal title="Student added · login details" credentials={logins.list} onClose={() => { setLogins(null); onCreated(logins.id); }} />;
  return (
    <Modal
      open={open}
      size="xl"
      title="Add student"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="student-form" loading={save.isPending} disabled={!photoId || (form.guardianMode === 'existing' && !form.guardianId)} title={!photoId ? "Add the student's picture first" : undefined}>Add student</Button>
        </>
      }
    >
      <form id="student-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-6">
        <PhotoPicker value={photoId} onChange={setPhotoId} name={`${form.firstName} ${form.lastName}`.trim()} label="Student picture" required />
        <StudentInfoFields form={form} set={set} />
        <GuardianFields form={form} set={set} open={open} />
        <ClassAccessFields form={form} set={set} />
      </form>
    </Modal>
  );
}
