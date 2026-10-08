import { ClipboardPen, Eye } from 'lucide-react';
import { useAreaNavigate } from '@/app/router/area';
import { Button, Card, EmptyState, Spinner } from '@/components/ui';
import { useMarksProgress } from '@/features/exams/hooks/useExams';
import type { ExamDetail } from '@/features/exams/types/exam.types';

/** Marks-entry progress per paper and section; opens the marksheet. */
export function MarksTab({ exam }: { exam: ExamDetail }) {
  const navigate = useAreaNavigate();
  const progress = useMarksProgress(exam.id);
  if (progress.isLoading) return <Spinner />;
  const rows = progress.data ?? [];
  if (rows.length === 0) return <Card><EmptyState icon={ClipboardPen} title="No marksheets for you" tone="fuchsia">Marksheets appear for the papers you teach once papers are defined.</EmptyState></Card>;
  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
              <th className="px-5 py-3 font-semibold">Class</th>
              <th className="px-5 py-3 font-semibold">Subject</th>
              <th className="px-5 py-3 font-semibold">Teacher</th>
              <th className="px-5 py-3 font-semibold">Entered</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
            {rows.map((r) => {
              const done = r.students > 0 && r.entered >= r.students;
              return (
                <tr key={`${r.sectionId}:${r.subjectId}`}>
                  <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">{r.className} · {r.sectionName}</td>
                  <td className="px-5 py-3">{r.subject}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{r.teacher ?? '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-500/15">
                        <div className={`h-full ${done ? 'bg-emerald-500' : 'bg-brand'}`} style={{ width: `${r.students ? Math.min(100, (r.entered / r.students) * 100) : 0}%` }} />
                      </div>
                      <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">{r.entered}/{r.students}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button variant="secondary" icon={exam.status === 'published' ? Eye : ClipboardPen} onClick={() => navigate(`/exams/${exam.id}/marks?sectionId=${r.sectionId}&subjectId=${r.subjectId}`)}>
                      {exam.status === 'published' ? 'View' : 'Enter marks'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
