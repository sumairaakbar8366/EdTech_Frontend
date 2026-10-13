import { ArrowLeft, BookOpen, Eye, EyeOff, FilePlus2, FileText, MessageSquare, NotebookPen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { AreaLink, useAreaNavigate } from '@/app/router/area';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, IconButton, IconTile, Spinner, Tabs } from '@/components/ui';
import { AddAssignmentModal } from '@/features/lms/components/assignments/AddAssignmentModal';
import { AddMaterialModal } from '@/features/lms/components/materials/AddMaterialModal';
import { MaterialModal } from '@/features/lms/components/materials/MaterialModal';
import { MATERIAL_VISUAL } from '@/features/lms/constants';
import { useCourse, useLmsAction } from '@/features/lms/hooks/useLms';
import { lmsService } from '@/features/lms/services/lmsService';
import type { Material } from '@/features/lms/types/lms.types';
import { fileSize, formatDateTime, studentQuery, workState } from '@/features/lms/utils/lms.utils';
import { errorMessage } from '@/lib/errors';
import { compactNumber } from '@/lib/format';

/** One course: learning material (with discussion) and assignments. */
export function CourseDetailPage({ isStudent }: { isStudent: boolean }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const studentId = params.get('studentId') ?? undefined;
  const navigate = useAreaNavigate();
  const [tab, setTab] = useState<'materials' | 'assignments'>('materials');
  const [viewing, setViewing] = useState<Material | null>(null);
  const [adding, setAdding] = useState<'material' | 'assignment' | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);
  const course = useCourse(id, studentId);
  const publish = useLmsAction(lmsService.togglePublish);
  const remove = useLmsAction((m: Material) => lmsService.deleteMaterial(m.id), { success: 'Material deleted', onDone: () => setDeleting(null) });

  if (course.isLoading) return <Spinner />;
  if (!course.data) return <Alert>{course.error ? errorMessage(course.error, 'Course not found.') : 'Course not found.'}</Alert>;
  const c = course.data;
  const qs = studentQuery(studentId);

  return (
    <div className="space-y-5">
      <AreaLink to="/lms" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600"><ArrowLeft size={15} /> Courses</AreaLink>
      <section className="dashboard-hero relative overflow-hidden rounded-xl p-6 text-white shadow-depth-3">
        <div className="relative flex flex-wrap items-center gap-4">
          <IconTile icon={BookOpen} tone="magenta" size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide">{c.subject.name}</h1>
            <p className="text-primary-100/90">{c.section.schoolClass.name} · Section {c.section.name} · {c.academicYear.name}{c.teacher && ` · ${c.teacher}`}</p>
          </div>
          {c.canManage && (
            <div className="flex gap-2">
              <Button variant="secondary" icon={FilePlus2} onClick={() => setAdding('material')}>Add material</Button>
              <Button icon={NotebookPen} onClick={() => setAdding('assignment')}>New assignment</Button>
            </div>
          )}
        </div>
      </section>

      <Tabs
        tabs={[
          { id: 'materials' as const, label: `Material (${compactNumber(c.materials.length)})`, icon: FileText },
          { id: 'assignments' as const, label: `Assignments (${compactNumber(c.assignments.length)})`, icon: NotebookPen },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'materials' && (
        c.materials.length === 0 ? (
          <Card><EmptyState icon={FileText} title="No material yet" tone="magenta">{c.canManage ? 'Upload notes, worksheets, videos or links for your class.' : 'Your teacher has not posted anything yet.'}</EmptyState></Card>
        ) : (
          <div className="stagger grid gap-3 md:grid-cols-2">
            {c.materials.map((m) => {
              const [Icon, tone, label] = MATERIAL_VISUAL[m.type];
              return (
                <div key={m.id} className={`surface flex items-start gap-3 rounded-xl p-4 transition hover:shadow-depth-3 ${m.isPublished ? '' : 'opacity-70'}`}>
                  <IconTile icon={Icon} tone={tone} />
                  <button className="min-w-0 flex-1 text-left" onClick={() => setViewing(m)}>
                    <div className="truncate font-semibold text-slate-800 hover:text-primary-600 dark:text-slate-100">{m.title}</div>
                    <div className="text-sm text-slate-500">
                      {label}{m.fileSize ? ` · ${fileSize(m.fileSize)}` : ''} · {formatDateTime(m.createdAt)}
                    </div>
                    <div className="mt-1 flex gap-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1"><MessageSquare size={13} /> {m._count.comments}</span>
                      {!m.isPublished && <Badge tone="slate">hidden</Badge>}
                    </div>
                  </button>
                  {c.canManage && (
                    <div className="flex">
                      <IconButton icon={m.isPublished ? EyeOff : Eye} label={m.isPublished ? 'Hide from students' : 'Publish'} onClick={() => publish.mutate(m)} />
                      <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleting(m)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'assignments' && (
        c.assignments.length === 0 ? (
          <Card><EmptyState icon={NotebookPen} title="No assignments yet" tone="amber" /></Card>
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
              {c.assignments.map((a) => {
                const [state, tone] = workState(a, a.submissions?.[0]);
                return (
                  <li key={a.id}>
                    <button onClick={() => navigate(`/lms/assignments/${a.id}${qs}`)} className="flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left hover:bg-primary-500/5">
                      <IconTile icon={NotebookPen} tone="amber" size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{a.title} {a.isPublished === false && <Badge tone="slate">hidden</Badge>}</div>
                        <div className="text-sm text-slate-500">Due {formatDateTime(a.dueAt)} · {Number(a.maxMarks)} marks</div>
                      </div>
                      {c.canManage ? <Badge tone="sky">{a._count?.submissions ?? 0} submitted</Badge> : <Badge tone={tone}>{state}</Badge>}
                      {a.submissions?.[0]?.grade && <Badge tone="emerald">{Number(a.submissions[0].grade.marks)}/{Number(a.maxMarks)}</Badge>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )
      )}

      <MaterialModal material={viewing} canManage={c.canManage} canComment={c.canManage || isStudent} onClose={() => setViewing(null)} />
      {c.canManage && <AddMaterialModal open={adding === 'material'} courseId={c.id} onClose={() => setAdding(null)} />}
      {c.canManage && <AddAssignmentModal open={adding === 'assignment'} courseId={c.id} onClose={() => setAdding(null)} />}
      <ConfirmDialog
        open={!!deleting}
        title="Delete material"
        message={`Delete "${deleting?.title}" and its discussion?`}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
