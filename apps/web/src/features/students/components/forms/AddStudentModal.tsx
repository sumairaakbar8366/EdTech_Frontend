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
import { CustomFieldsSection, useCustomMissing } from '@/features/forms/components/CustomFieldsSection';
import { formsService, withUploadedFiles, useSchoolForms, type Answers, type PendingFiles } from '@/features/forms/forms';

/** Add a student with their first guardian, optional class and logins (page 5). */
export function AddStudentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const [form, setForm] = useState<AddStudentForm>(emptyAddStudentForm);
  const [photoId, setPhotoId] = useState<string | null>(null);
  useEffect(() => {
    if (open) { setForm(emptyAddStudentForm()); setPhotoId(null); }
  }, [open]);
  const set = (patch: Partial<AddStudentForm>) => setForm((f) => ({ ...f, ...patch }));
  const [custom, setCustom] = useState<Answers>({});
  const [files, setFiles] = useState<PendingFiles>({});
  const schoolForms = useSchoolForms();
  const [tried, setTried] = useState(false);
  const customMissing = useCustomMissing('student', custom, files);
  useEffect(() => { if (open) { setCustom({}); setFiles({}); setTried(false); } }, [open]);
  const [logins, setLogins] = useState<{ id: string; list: LoginHandover[] } | null>(null);
  const save = useStudentsAction(() => studentService.create({ ...toCreatePayload(form), photoId: photoId ?? undefined }).then(async (s) => {
    const form = schoolForms.data?.find((f) => f.kind === 'student')?.form;
    const answers = form ? await withUploadedFiles('student', s.id, form, custom, files) : custom;
    if (Object.keys(answers).length) await formsService.saveAnswers('student', s.id, answers);
    return s;
  }), 'Student added', (s) => {
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
      <form id="student-form" onSubmit={onSubmit(() => { if (customMissing) setTried(true); else save.mutate(undefined); })} className="space-y-6">
        <PhotoPicker value={photoId} onChange={setPhotoId} name={`${form.firstName} ${form.lastName}`.trim()} label="Student picture" required />
        <StudentInfoFields form={form} set={set} />
        <GuardianFields form={form} set={set} open={open} />
        <ClassAccessFields form={form} set={set} />
        <CustomFieldsSection kind="student" subject="student" value={custom} onChange={setCustom} showErrors={tried} files={files} onFiles={setFiles} />
      </form>
    </Modal>
  );
}
