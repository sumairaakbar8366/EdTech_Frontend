import { KeyRound } from 'lucide-react';
import { Avatar, Badge, DataTable, StatusBadge, type Column } from '@/components/ui';
import { STUDENT_STATUS_LABEL, STUDENT_STATUS_TONE } from '@/features/students/constants';
import type { StudentListItem } from '@/features/students/types/student.types';
import { age } from '@/features/students/utils/student.utils';

const COLUMNS: Column<StudentListItem>[] = [
  {
    header: 'Student',
    cell: (s) => (
      <div className="flex items-center gap-3">
        <Avatar photoKey={s.photoKey} name={`${s.firstName} ${s.lastName}`} />
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
            {s.firstName} {s.lastName}
            {s.userId && <KeyRound size={13} className="text-primary-500" aria-label="Has login" />}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{age(s.dateOfBirth)} years</div>
        </div>
      </div>
    ),
  },
  { header: 'Adm. no.', cell: (s) => s.admissionNo, className: 'tabular-nums text-slate-600 dark:text-slate-300' },
  {
    header: 'Class',
    cell: (s) => {
      const e = s.enrollments[0];
      return e ? (
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {e.section.schoolClass.name} – {e.section.name} <span className="text-sm font-normal text-slate-500">({e.section.campus.code})</span>
        </span>
      ) : (
        <Badge tone="amber">Not enrolled</Badge>
      );
    },
  },
  { header: 'Roll', cell: (s) => s.enrollments[0]?.rollNo ?? '—', className: 'tabular-nums text-slate-600 dark:text-slate-300' },
  {
    header: 'Parent',
    cell: (s) => {
      const g = s.guardians[0];
      return g ? <>{g.guardian.firstName} {g.guardian.lastName}<div className="text-sm text-slate-500">{g.guardian.phone}</div></> : '—';
    },
    className: 'text-slate-600 dark:text-slate-300',
  },
  { header: 'Status', cell: (s) => <StatusBadge status={s.status} tones={STUDENT_STATUS_TONE} labels={STUDENT_STATUS_LABEL} /> },
];

export function StudentTable({ students, onOpen }: { students: StudentListItem[]; onOpen: (s: StudentListItem) => void }) {
  return <DataTable columns={COLUMNS} rows={students} rowKey={(s) => s.id} onRowClick={onOpen} />;
}
