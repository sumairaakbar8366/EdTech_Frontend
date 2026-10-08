import { Award, CalendarDays, CheckCircle2, FileText, Plus, Ruler } from 'lucide-react';
import { useState } from 'react';
import { AreaLink } from '@/app/router/area';
import { Badge, Button, Card, EmptyState, PageHeader, Spinner, Tilt } from '@/components/ui';
import { ExamModal } from '@/features/exams/components/exams/ExamModal';
import { GradingScaleModal } from '@/features/exams/components/exams/GradingScaleModal';
import { useExams } from '@/features/exams/hooks/useExams';
import { formatDate } from '@/lib/format';

/** Exams & results (page 10). Admins create exams; teachers enter marks; everyone sees the schedule. */
export function ExamsPage({ canEdit, title = 'Exams & Results' }: { canEdit: boolean; title?: string }) {
  const [creating, setCreating] = useState(false);
  const [editingScale, setEditingScale] = useState(false);
  const exams = useExams();
  return (
    <div>
      <PageHeader
        title={title}
        sub="Exams, marks, grading and report cards"
        icon={Award}
        tone="fuchsia"
        actions={
          canEdit && (
            <>
              <Button variant="secondary" icon={Ruler} onClick={() => setEditingScale(true)}>Grading scale</Button>
              <Button icon={Plus} onClick={() => setCreating(true)}>New exam</Button>
            </>
          )
        }
      />
      {exams.isLoading && <Spinner />}
      {exams.data?.length === 0 && <Card><EmptyState icon={Award} title="No exams this year" tone="fuchsia">{canEdit && 'Create an exam, add papers for each class, then teachers enter marks.'}</EmptyState></Card>}
      <div className="stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exams.data?.map((e) => (
          <Tilt key={e.id} max={5} className="rounded-xl">
            <AreaLink to={`/exams/${e.id}`} data-tone={e.status === 'published' ? 'emerald' : 'fuchsia'} className="surface tone-card focus-ring block rounded-xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{e.name}</div>
                  <div className="text-sm text-slate-500">{e.term?.name ?? e.academicYear.name}</div>
                </div>
                <Badge tone={e.status === 'published' ? 'emerald' : 'amber'}>{e.status === 'published' ? 'Results published' : 'In progress'}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {formatDate(e.startDate)} – {formatDate(e.endDate)}</span>
                <span className="inline-flex items-center gap-1"><FileText size={14} /> {e._count.subjects} papers</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> {e._count.reportCards} report cards</span>
              </div>
            </AreaLink>
          </Tilt>
        ))}
      </div>
      {canEdit && <ExamModal open={creating} onClose={() => setCreating(false)} />}
      {canEdit && <GradingScaleModal open={editingScale} onClose={() => setEditingScale(false)} />}
    </div>
  );
}
