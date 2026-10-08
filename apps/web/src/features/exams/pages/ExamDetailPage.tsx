import { ArrowLeft, Award, BookOpen, CheckCircle2, ClipboardPen, Lock, Pencil, Send, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { useAreaNavigate } from '@/app/router/area';
import { Alert, Badge, Button, ConfirmDialog, Spinner, Tabs } from '@/components/ui';
import { MarksTab } from '@/features/exams/components/detail/MarksTab';
import { PapersTab } from '@/features/exams/components/detail/PapersTab';
import { ReportCardsTab } from '@/features/exams/components/detail/ReportCardsTab';
import { ExamModal } from '@/features/exams/components/exams/ExamModal';
import { useExam, useExamsAction } from '@/features/exams/hooks/useExams';
import { examService } from '@/features/exams/services/examService';
import type { ExamAction } from '@/features/exams/types/exam.types';
import { formatDate } from '@/lib/format';

type Tab = 'papers' | 'marks' | 'cards';

/** One exam: papers per class (admin), marks entry progress, and report cards. */
export function ExamDetailPage({ canEdit, canEnter, canPublish }: { canEdit: boolean; canEnter: boolean; canPublish: boolean }) {
  const { id } = useParams();
  const navigate = useAreaNavigate();
  const [tab, setTab] = useState<Tab>(canEdit ? 'papers' : canEnter ? 'marks' : 'papers');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const exam = useExam(id);
  const act = useExamsAction((action: ExamAction) => examService.act(id!, action).then((r) => ({ action, generated: r?.generated })), {
    success: ({ action, generated }) =>
      action === 'report-cards' ? `Report cards generated${generated !== undefined ? ` for ${generated} students` : ''}` : action === 'publish' ? 'Results published to students and parents' : 'Results unpublished',
  });
  const remove = useExamsAction(() => examService.remove(id!), { success: 'Exam deleted', onDone: () => navigate('/exams-and-results') });

  if (exam.isLoading) return <Spinner />;
  if (!exam.data) return <Alert>Exam not found.</Alert>;
  const e = exam.data;
  const published = e.status === 'published';

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600"><ArrowLeft size={15} /> Exams</button>
      <section className="dashboard-hero relative overflow-hidden rounded-xl p-6 text-white shadow-depth-3">
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-4xl font-bold uppercase tracking-wide">{e.name}</h1>
              {published ? <Badge tone="emerald"><Lock size={12} /> published</Badge> : <Badge tone="amber">in progress</Badge>}
            </div>
            <p className="text-primary-100/90">{e.academicYear.name}{e.term && ` · ${e.term.name}`} · {formatDate(e.startDate)} – {formatDate(e.endDate)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEdit && !published && <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>Edit</Button>}
            {canEdit && !published && <Button variant="secondary" icon={Trash2} onClick={() => setDeleting(true)}>Delete</Button>}
            {canPublish && !published && <Button variant="secondary" icon={CheckCircle2} loading={act.isPending && act.variables === 'report-cards'} onClick={() => act.mutate('report-cards')}>Generate report cards</Button>}
            {canPublish && !published && <Button icon={Send} onClick={() => act.mutate('publish')}>Publish results</Button>}
            {canPublish && published && <Button variant="secondary" icon={Undo2} onClick={() => act.mutate('unpublish')}>Unpublish</Button>}
          </div>
        </div>
      </section>

      <Tabs
        tabs={[
          { id: 'papers' as const, label: 'Papers', icon: BookOpen },
          ...(canEnter ? [{ id: 'marks' as const, label: 'Marks entry', icon: ClipboardPen }, { id: 'cards' as const, label: 'Report cards', icon: Award }] : []),
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'papers' && <PapersTab exam={e} canEdit={canEdit && !published} />}
      {tab === 'marks' && <MarksTab exam={e} />}
      {tab === 'cards' && <ReportCardsTab exam={e} canEdit={canPublish && !published} />}

      {canEdit && <ExamModal open={editing} exam={e} onClose={() => setEditing(false)} />}
      <ConfirmDialog open={deleting} title="Delete exam" message={`Delete "${e.name}" and its papers?`} loading={remove.isPending} onConfirm={() => remove.mutate(undefined)} onClose={() => setDeleting(false)} />
    </div>
  );
}
