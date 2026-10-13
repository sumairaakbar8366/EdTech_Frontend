import { GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useAreaNavigate } from '@/app/router/area';
import { Button, Card, Field, Input } from '@/components/ui';
import { SectionPicker } from '@/features/academics/components/SectionPicker';
import { useAdmissionsAction } from '@/features/admissions/hooks/useAdmissions';
import { admissionService, type GeneratedLogin } from '@/features/admissions/services/admissionService';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';
import { todayIso } from '@/features/students/utils/student.utils';
import { CredentialsModal } from '@/features/users/components/CredentialsModal';
import { handover } from '@/features/users/users';
import { onSubmit } from '@/lib/forms';

/** Approved → enrolled: creates the student, generates the logins and opens their record. */
export function EnrollCard({ application: a }: { application: AdmissionApplication }) {
  const navigate = useAreaNavigate();
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

  return (
    <Card title="Enroll student" icon={GraduationCap} tone="emerald">
      <form onSubmit={onSubmit(() => enroll.mutate(undefined))} className="space-y-3">
        <Field label={`Section of ${a.schoolClass.name}`}><SectionPicker required classId={a.classId} value={e.sectionId} onChange={(sectionId) => setE({ ...e, sectionId })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Roll no."><Input type="number" min={1} max={9999} value={e.rollNo} onChange={(ev) => setE({ ...e, rollNo: ev.target.value })} /></Field>
          <Field label="Admission date"><Input type="date" required value={e.admissionDate} onChange={(ev) => setE({ ...e, admissionDate: ev.target.value })} /></Field>
        </div>
        <label className="flex items-center gap-2 text-base"><input type="checkbox" className="h-4 w-4 accent-orange-500" checked={e.parentLogin} onChange={(ev) => setE({ ...e, parentLogin: ev.target.checked })} /> Create parent login (User ID PAR-…{a.guardianEmail ? `, emailed to ${a.guardianEmail}` : ''})</label>
        <label className="flex items-center gap-2 text-base"><input type="checkbox" className="h-4 w-4 accent-orange-500" checked={e.studentLogin} onChange={(ev) => setE({ ...e, studentLogin: ev.target.checked })} /> Create student login (User ID STU-…)</label>
        <p className="text-sm text-slate-500">Passwords are generated automatically and shown once after enrolment; they must be changed at first sign-in.</p>
        <Button type="submit" icon={GraduationCap} className="w-full" loading={enroll.isPending}>Enroll student</Button>
        <p className="text-sm text-slate-500">If the parent’s email already exists (a sibling), the existing parent is linked instead of creating a duplicate.</p>
      </form>

      {done && (
        <CredentialsModal
          title="Student enrolled · login details"
          credentials={done.credentials.map((c) => {
            const [first = '', ...rest] = c.name.split(' ');
            return handover(first, rest.join(' '), c.who === 'parent' ? 'Parent' : 'Student', c);
          })}
          onClose={() => navigate(`/students/${done.studentId}`)}
        />
      )}
    </Card>
  );
}
