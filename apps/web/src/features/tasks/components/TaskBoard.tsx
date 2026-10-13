import { CalendarClock, CheckCircle2, Circle, CircleDot, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Badge, CompactNumber, IconButton } from '@/components/ui';
import { isOverdue, TASK_PRIORITY_TONE, TASK_STATUS_LABEL, TASK_STATUS_TONE, type StaffTask, type TaskStatus } from '@/features/tasks/tasks';
import { formatDate } from '@/lib/format';

const COLUMNS: { status: TaskStatus; icon: typeof Circle }[] = [
  { status: 'todo', icon: Circle },
  { status: 'in_progress', icon: CircleDot },
  { status: 'done', icon: CheckCircle2 },
];
const NEXT: Record<TaskStatus, TaskStatus | null> = { todo: 'in_progress', in_progress: 'done', done: null };
const NEXT_LABEL: Record<TaskStatus, string> = { todo: 'Start', in_progress: 'Mark done', done: '' };

/** Three-column board (to do / in progress / done); cards glide between columns as they move. */
export function TaskBoard({ tasks, showAssignee = false, onMove, onDelete }: { tasks: StaffTask[]; showAssignee?: boolean; onMove: (t: StaffTask, s: TaskStatus) => void; onDelete?: (t: StaffTask) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map(({ status, icon: Icon }) => {
        const col = tasks.filter((t) => t.status === status);
        return (
          <section key={status} data-tone={TASK_STATUS_TONE[status]} className="surface tone-card rounded-xl p-3">
            <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Icon size={15} /> {TASK_STATUS_LABEL[status]} <span className="ml-auto tabular-nums text-slate-400"><CompactNumber value={col.length} /></span>
            </h2>
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {col.map((t) => (
                  <motion.li
                    key={t.id}
                    layout
                    layoutId={`task-${t.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-lg bg-white/80 p-3 shadow-depth-1 ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10"
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{t.title}</div>
                        {showAssignee && t.employee && <div className="text-sm text-slate-500">{t.employee.firstName} {t.employee.lastName} · {t.employee.designation}</div>}
                      </div>
                      {onDelete && <IconButton icon={Trash2} label="Delete task" tone="danger" onClick={() => onDelete(t)} />}
                    </div>
                    {t.details && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{t.details}</p>}
                    {t.note && <p className="mt-1 text-sm italic text-slate-500">“{t.note}”</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge tone={TASK_PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                      {t.dueDate && <Badge tone={isOverdue(t) ? 'rose' : 'slate'}><CalendarClock size={11} /> {isOverdue(t) ? 'overdue · ' : ''}{formatDate(t.dueDate)}</Badge>}
                      {NEXT[t.status] && (
                        <button onClick={() => onMove(t, NEXT[t.status]!)} className="ml-auto rounded-md bg-brand px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white transition">
                          {NEXT_LABEL[t.status]}
                        </button>
                      )}
                      {t.status === 'done' && (
                        <button onClick={() => onMove(t, 'todo')} className="ml-auto text-xs font-semibold text-slate-500 hover:underline">Reopen</button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              {col.length === 0 && <li className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-400 dark:border-white/10">Nothing here</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
