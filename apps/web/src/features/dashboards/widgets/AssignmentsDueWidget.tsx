import { NotebookPen } from 'lucide-react';
import { Badge, Card, EmptyState, Spinner } from '@/components/ui';
import { AreaLink } from '@/app/router/area';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { useMyAssignments } from '@/features/lms/hooks/useLms';
import { formatDateTime, studentQuery, workState } from '@/features/lms/utils/lms.utils';
import { compactNumber } from '@/lib/format';

/** Work still to hand in, soonest due first (a parent passes the child's id). */
export function AssignmentsDueWidget({ studentId, ready = true, to, className = '' }: { studentId?: string; ready?: boolean; to: string; className?: string }) {
  const list = useMyAssignments(studentId, ready);
  const todo = (list.data ?? []).filter((a) => !a.submissions?.length).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  return (
    <Card title={`Assignments to do${todo.length ? ` · ${compactNumber(todo.length)}` : ''}`} icon={NotebookPen} tone="amber" className={className} actions={<ViewAll to={to} />}>
      {list.isLoading && <Spinner />}
      {list.isSuccess && todo.length === 0 && <EmptyState icon={NotebookPen} title="All caught up" tone="amber">Nothing is waiting to be handed in.</EmptyState>}
      <ul className="space-y-2">
        {todo.slice(0, 5).map((a) => {
          const [state, tone] = workState(a, null);
          return (
            <li key={a.id}>
              <AreaLink to={`/lms/assignments/${a.id}${studentQuery(studentId)}`} className="focus-ring flex items-center gap-3 rounded-xl bg-slate-500/5 px-3 py-2 transition-colors hover:bg-primary-500/10">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-slate-800 dark:text-slate-100">{a.title}</div>
                  <div className="text-sm text-slate-500">{a.course?.subject.name} · due {formatDateTime(a.dueAt)}</div>
                </div>
                <Badge tone={tone}>{state}</Badge>
              </AreaLink>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
