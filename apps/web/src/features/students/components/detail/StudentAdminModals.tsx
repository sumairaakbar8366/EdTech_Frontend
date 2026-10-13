import { useState } from 'react';
import { CredentialsModal } from '@/features/users/components/CredentialsModal';
import { handover, type LoginHandover } from '@/features/users/users';
import { Alert, Button, Field, Input, Modal, Select } from '@/components/ui';
import { SectionPicker } from '@/features/academics/components/SectionPicker';
import { STUDENT_STATUS_LABEL } from '@/features/students/constants';
import { useStudentsAction } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import type { StudentDetail, StudentStatus } from '@/features/students/types/student.types';
import { onSubmit } from '@/lib/forms';

type Props = { open: boolean; student: StudentDetail; onClose: () => void };

/** Change status; leaving statuses close the enrollment and disable the login. */
export function StudentStatusModal({ open, student, onClose }: Props) {
  const options = (Object.keys(STUDENT_STATUS_LABEL) as StudentStatus[]).filter((x) => x !== student.status);
  const [status, setStatus] = useState<StudentStatus>(options[0]!);
  const save = useStudentsAction(() => studentService.setStatus(student.id, status), 'Status updated', onClose);
  const leaving = status === 'withdrawn' || status === 'graduated';
  return (
    <Modal open={open} title="Change student status" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={leaving ? 'danger' : 'primary'} loading={save.isPending} onClick={() => save.mutate(undefined)}>Confirm</Button></>}>
      <div className="space-y-3">
        <Field label="New status"><Select value={status} onChange={(e) => setStatus(e.target.value as StudentStatus)}>{options.map((o) => <option key={o} value={o}>{STUDENT_STATUS_LABEL[o]}</option>)}</Select></Field>
        {leaving && <Alert tone="info">The current class enrollment is closed and the student’s login is disabled.</Alert>}
      </div>
    </Modal>
  );
}

/** Enroll in, or move to, a section of the current year. */
export function MoveSectionModal({ open, student, currentSectionId, currentRoll, onClose }: Props & { currentSectionId?: string; currentRoll: number | null }) {
  const [sectionId, setSectionId] = useState(currentSectionId ?? '');
  const [rollNo, setRollNo] = useState(currentRoll?.toString() ?? '');
  const save = useStudentsAction(() => studentService.enroll(student.id, { sectionId, rollNo: rollNo ? Number(rollNo) : null }), currentSectionId ? 'Section changed' : 'Student enrolled', onClose);
  return (
    <Modal open={open} title={currentSectionId ? 'Change section' : 'Enroll in a class'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!sectionId} loading={save.isPending} onClick={() => save.mutate(undefined)}>Save</Button></>}>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Field label="Class & section (current year)"><SectionPicker required value={sectionId} onChange={setSectionId} /></Field></div>
        <Field label="Roll no."><Input type="number" min={1} max={9999} value={rollNo} onChange={(e) => setRollNo(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

export function StudentLoginModal({ open, student, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState<LoginHandover | null>(null);
  const save = useStudentsAction(() => studentService.createLogin(student.id, email.trim() ? { email: email.trim() } : {}), 'Student login created', (r) => setLogin(handover(student.firstName, student.lastName, 'Student', r.credentials)));
  if (login) return <CredentialsModal title="Student login created" credentials={login} onClose={() => { setLogin(null); onClose(); }} />;
  return (
    <Modal open={open} title="Create student login" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="stu-login" loading={save.isPending}>Create login</Button></>}>
      <form id="stu-login" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-3">
        <p className="text-base text-slate-600 dark:text-slate-300">A User ID (STU-{student.admissionDate.slice(0, 4)}-…) and a temporary password are generated and shown once.</p>
        <Field label="Email (optional)" hint="The student's or a parent's. The User ID is emailed there."><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}
