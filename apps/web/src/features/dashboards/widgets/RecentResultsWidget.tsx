import { Award } from 'lucide-react';
import { Badge, Card, EmptyState, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { useMyReportCards } from '@/features/exams/hooks/useExams';

/** The latest published report cards (a parent passes the child's id). */
export function RecentResultsWidget({ studentId, ready = true, className = '' }: { studentId?: string; ready?: boolean; className?: string }) {
  const cards = useMyReportCards(studentId, ready);
  const latest = (cards.data ?? []).slice(0, 3);
  return (
    <Card title="Recent results" icon={Award} tone="emerald" className={className} actions={<ViewAll to="/results" />}>
      {cards.isLoading && <Spinner />}
      {cards.isSuccess && latest.length === 0 && <EmptyState icon={Award} title="No published results yet" tone="emerald" />}
      <ul className="space-y-2">
        {latest.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-xl bg-slate-500/5 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-slate-800 dark:text-slate-100">{c.exam.name}</div>
              <div className="text-sm text-slate-500">{c.exam.academicYear.name}{c.rank ? ` · rank ${c.rank}` : ''}</div>
            </div>
            <span className="font-display text-xl font-bold tabular-nums">{Number(c.percentage)}%</span>
            <Badge tone={c.passed ? 'emerald' : 'rose'}>{c.grade}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
