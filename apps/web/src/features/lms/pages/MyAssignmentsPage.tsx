import { CalendarClock, CheckCircle2, NotebookPen, Send } from 'lucide-react';
import { useAreaNavigate } from '@/app/router/area';
import { Badge, Card, EmptyState, PageHeader, Spinner, StatCard } from '@/components/ui';
import { useChildSwitch } from '@/features/lms/hooks/useChildSwitch';
import { useMyAssignments } from '@/features/lms/hooks/useLms';
import { formatDateTime, workState } from '@/features/lms/utils/lms.utils';

/** A student's assignments (student "Assignments", parent "Homework"). */
export function MyAssignmentsPage({ title = 'Assignments' }: { title?: string }) {
  const navigate = useAreaNavigate();
  const { childId, ready, switcher } = useChildSwitch();
  const list = useMyAssignments(childId, ready);
  const rows = list.data ?? [];
  const todo = rows.filter((a) => !a.submissions?.length);
  const overdue = todo.filter((a) => new Date(a.dueAt) < new Date());
  const graded = rows.filter((a) => a.submissions?.[0]?.status === 'graded');
  // Open work first (soonest due), then the rest newest first.
  const sorted = [...rows].sort((a, b) => {
    const ao = a.submissions?.length ? 1 : 0;
    const bo = b.submissions?.length ? 1 : 0;
    return ao !== bo ? ao - bo : ao === 0 ? a.dueAt.localeCompare(b.dueAt) : b.dueAt.localeCompare(a.dueAt);
  });
  return (
    <div>
      <PageHeader title={title} sub="Homework and assignments from every subject" icon={NotebookPen} tone="amber" />
      {switcher}
      <div className="stagger mb-5 grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="To do" value={list.isSuccess ? todo.length : '–'} icon={Send} tone="amber" />
        <StatCard label="Overdue" value={list.isSuccess ? overdue.length : '–'} icon={CalendarClock} tone="rose" />
        <StatCard label="Graded" value={list.isSuccess ? graded.length : '–'} icon={CheckCircle2} tone="emerald" />
      </div>
      {list.isLoading && <Spinner />}
      {list.isSuccess && rows.length === 0 && <Card><EmptyState icon={NotebookPen} title="No assignments yet" tone="amber" /></Card>}
      {rows.length > 0 && (
        <Card padded={false}>
          <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
            {sorted.map((a) => {
              const s = a.submissions?.[0];
              const [state, tone] = workState(a, s);
              return (
                <li key={a.id}>
                  <button onClick={() => navigate(`/lms/assignments/${a.id}${childId ? `?studentId=${childId}` : ''}`)} className="flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left hover:bg-primary-500/5">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{a.title}</div>
                      <div className="text-sm text-slate-500">{a.course?.subject.name} · due {formatDateTime(a.dueAt)}</div>
                    </div>
                    <Badge tone={tone}>{state}</Badge>
                    {s?.grade && <Badge tone="emerald">{Number(s.grade.marks)}/{Number(a.maxMarks)}</Badge>}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
