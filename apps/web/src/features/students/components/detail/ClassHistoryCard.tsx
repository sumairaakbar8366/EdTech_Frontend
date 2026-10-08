import { History, School } from 'lucide-react';
import { Badge, Card, EmptyState } from '@/components/ui';
import type { StudentDetail } from '@/features/students/types/student.types';
import { formatDate } from '@/lib/format';

/** Every enrollment of the student, newest first (as returned). */
export function ClassHistoryCard({ student: s }: { student: StudentDetail }) {
  return (
    <Card title="Class history" icon={History} tone="primary">
      {s.enrollments.length === 0 && <EmptyState icon={School} title="Not enrolled in any class yet" tone="primary" />}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {s.enrollments.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
            <Badge tone={e.academicYear.isCurrent ? 'primary' : 'slate'}>{e.academicYear.name}</Badge>
            <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">{e.section.schoolClass.name} – {e.section.name}</span>
            <span className="text-base text-slate-500">{e.section.campus.name}{e.rollNo ? ` · Roll ${e.rollNo}` : ''}</span>
            <span className="ml-auto flex items-center gap-2 text-sm text-slate-500">
              {formatDate(e.enrolledOn)}{e.endedOn ? ` – ${formatDate(e.endedOn)}` : ''}
              <Badge tone={e.status === 'enrolled' ? 'emerald' : e.status === 'promoted' ? 'magenta' : 'slate'}>{e.status}</Badge>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
