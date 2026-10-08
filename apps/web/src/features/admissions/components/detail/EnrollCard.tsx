import { Check, Copy, GraduationCap, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useAreaNavigate } from '@/app/router/area';
import { Alert, Button, Card, Field, Input, Modal } from '@/components/ui';
import { SectionPicker } from '@/features/academics/components/SectionPicker';
import { useSchoolUser } from '@/features/auth/usePermissions';
import { useAdmissionsAction } from '@/features/admissions/hooks/useAdmissions';
import { admissionService, type GeneratedLogin } from '@/features/admissions/services/admissionService';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';
import { todayIso } from '@/features/students/utils/student.utils';
import { onSubmit } from '@/lib/forms';

function CopyText({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button type="button" variant="secondary" icon={done ? Check : Copy} onClick={() => void navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })}>
      {done ? 'Copied' : label}
    </Button>
  );
}

const emailPart = (first: string, last: string) => [first, last].map((s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')).filter(Boolean).join('.');

/** Approved → enrolled: creates the student, generates the logins and opens their record. */
export function EnrollCard({ application: a }: { application: AdmissionApplication }) {
  const navigate = useAreaNavigate();
  const me = useSchoolUser();
  const [e, setE] = useState({ sectionId: '', rollNo: '', admissionDate: todayIso(), parentLogin: true, studentLogin: true });
  const [done, setDone] = useState<{ studentId: string; credentials: GeneratedLogin[] } | null>(null);
  const enroll = useAdmissionsAction(
    () =>
      admissionService.enroll(a.id, {
        sectionId: e.sectionId,
        rollNo: e.rollNo ? Number(e.rollNo) : null,
        admissionDate: e.admissionDate,
        createParentLogin: e.parentLogin,
        createStudentLogin: e.studentLogin,
      }),
    'Student enrolled',
    (r) => (r.credentials.length ? setDone({ studentId: r.studentId, credentials: r.credentials }) : navigate(`/students/${r.studentId}`)),
  );
  const message = (c: GeneratedLogin) =>
    [`Assalam o Alaikum ${c.name},`, '', `Your ${me.school?.name ?? 'school'} ${c.who} account is ready.`, `Sign in at: ${window.location.origin}/login`, `Email: ${c.email}`, `Temporary password: ${c.password}`, '', 'You will choose your own password at first sign-in.'].join('\n');

  return (
    <Card title="Enroll student" icon={GraduationCap} tone="emerald">
      <form onSubmit={onSubmit(() => enroll.mutate(undefined))} className="space-y-3">
        <Field label={`Section of ${a.schoolClass.name}`}><SectionPicker required classId={a.classId} value={e.sectionId} onChange={(sectionId) => setE({ ...e, sectionId })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Roll no."><Input type="number" min={1} max={9999} value={e.rollNo} onChange={(ev) => setE({ ...e, rollNo: ev.target.value })} /></Field>
          <Field label="Admission date"><Input type="date" required value={e.admissionDate} onChange={(ev) => setE({ ...e, admissionDate: ev.target.value })} /></Field>
        </div>
        <label className="flex items-center gap-2 text-base"><input type="checkbox" className="h-4 w-4 accent-orange-500" checked={e.parentLogin} onChange={(ev) => setE({ ...e, parentLogin: ev.target.checked })} /> Create parent login (school email, e.g. {emailPart(a.guardianFirstName, a.guardianLastName)}.parent@…)</label>
        <label className="flex items-center gap-2 text-base"><input type="checkbox" className="h-4 w-4 accent-orange-500" checked={e.studentLogin} onChange={(ev) => setE({ ...e, studentLogin: ev.target.checked })} /> Create student login (school email, e.g. {emailPart(a.firstName, a.lastName)}.student@…)</label>
        <p className="text-sm text-slate-500">Passwords are generated automatically and shown once after enrolment; they must be changed at first sign-in.</p>
        <Button type="submit" icon={GraduationCap} className="w-full" loading={enroll.isPending}>Enroll student</Button>
        <p className="text-sm text-slate-500">If the parent’s email already exists (a sibling), the existing parent is linked instead of creating a duplicate.</p>
      </form>

      {done && (
        <Modal open title="Student enrolled · login details" size="lg" onClose={() => navigate(`/students/${done.studentId}`)} footer={<Button onClick={() => navigate(`/students/${done.studentId}`)}>Done</Button>}>
          <div className="space-y-4">
            <Alert tone="info">These passwords are shown only once. Share them now; each person chooses their own password at first sign-in. If one is lost, reset it in Users &amp; Access.</Alert>
            {done.credentials.map((c) => (
              <div key={c.email} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500"><KeyRound size={15} /> {c.who === 'parent' ? 'Parent' : 'Student'} · {c.name}</div>
                <div className="grid gap-1 font-mono text-base"><span>{c.email}</span><span className="text-xl font-bold tracking-wider">{c.password}</span></div>
                <div className="mt-3 flex flex-wrap gap-2"><CopyText text={c.password} label="Copy password" /><CopyText text={message(c)} label="Copy login details" /></div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </Card>
  );
}
