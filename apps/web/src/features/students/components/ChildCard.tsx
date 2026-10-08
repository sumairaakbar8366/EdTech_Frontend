import { ArrowRight } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import { Badge, StatusBadge } from '@/components/ui';
import { RELATION_LABEL, STUDENT_STATUS_LABEL, STUDENT_STATUS_TONE } from '@/features/students/constants';
import type { Child } from '@/features/students/types/student.types';

/** A parent's child: name, class and status, linking to the child's record. */
export function ChildCard({ child: c }: { child: Child }) {
  const e = c.enrollments[0];
  return (
    <AreaLink to={`/my-children/${c.id}`} className="surface group block rounded-xl p-5 transition-shadow hover:shadow-depth-3">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 font-display text-xl font-bold text-white">{c.firstName[0]}{c.lastName[0]}</span>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{c.firstName} {c.lastName}</div>
          <div className="text-base text-slate-500 dark:text-slate-400">{c.admissionNo} · {RELATION_LABEL[c.relationship]}</div>
        </div>
        <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-500" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {e ? <Badge tone="primary">{e.section.schoolClass.name} – {e.section.name}{e.rollNo ? ` · Roll ${e.rollNo}` : ''}</Badge> : <Badge tone="amber">Not enrolled</Badge>}
        <StatusBadge status={c.status} tones={STUDENT_STATUS_TONE} labels={STUDENT_STATUS_LABEL} />
      </div>
    </AreaLink>
  );
}
