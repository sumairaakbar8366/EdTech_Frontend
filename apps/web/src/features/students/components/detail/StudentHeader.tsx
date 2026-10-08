import { ArrowRightLeft, KeyRound, Pencil, RefreshCcw } from 'lucide-react';
import { Badge, Button, StatusBadge } from '@/components/ui';
import { STUDENT_STATUS_LABEL, STUDENT_STATUS_TONE } from '@/features/students/constants';
import type { StudentDetail } from '@/features/students/types/student.types';

type Enrollment = StudentDetail['enrollments'][number];

interface Props {
  student: StudentDetail;
  current?: Enrollment;
  editable: boolean;
  onMove: () => void;
  onLogin: () => void;
  onStatus: () => void;
  onEdit: () => void;
}

/** Name, admission no., class and status, with the admin's actions. */
export function StudentHeader({ student: s, current, editable, onMove, onLogin, onStatus, onEdit }: Props) {
  return (
    <div className="surface mb-6 flex flex-wrap items-center gap-5 rounded-xl p-5 animate-fade-up">
      <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl font-display text-2xl font-bold text-white ${s.gender === 'female' ? 'bg-rose-500' : 'bg-emerald-600'}`}>{s.firstName[0]}{s.lastName[0]}</span>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{s.firstName} {s.lastName}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-base text-slate-600 dark:text-slate-300">
          <span className="tabular-nums">{s.admissionNo}</span>
          <span className="text-slate-300">•</span>
          <span>{current ? `${current.section.schoolClass.name} – ${current.section.name} (${current.section.campus.code})${current.rollNo ? ` · Roll ${current.rollNo}` : ''}` : 'Not enrolled this year'}</span>
          <StatusBadge status={s.status} tones={STUDENT_STATUS_TONE} labels={STUDENT_STATUS_LABEL} />
          {s.user && <Badge tone="teal"><KeyRound size={12} /> Login</Badge>}
        </div>
      </div>
      {editable && (
        <div className="flex flex-wrap gap-2">
          {s.status === 'active' && <Button variant="secondary" icon={ArrowRightLeft} onClick={onMove}>{current ? 'Change section' : 'Enroll'}</Button>}
          {!s.user && s.status === 'active' && <Button variant="secondary" icon={KeyRound} onClick={onLogin}>Student login</Button>}
          <Button variant="secondary" icon={RefreshCcw} onClick={onStatus}>Status</Button>
          <Button icon={Pencil} onClick={onEdit}>Edit</Button>
        </div>
      )}
    </div>
  );
}
