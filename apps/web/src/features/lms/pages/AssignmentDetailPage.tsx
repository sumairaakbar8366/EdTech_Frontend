import { ArrowLeft, CheckCircle2, Download, NotebookPen, Send, Star } from 'lucide-react';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { AreaLink } from '@/app/router/area';
import { Alert, Badge, Button, Card, Spinner, StatCard } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { GradeModal } from '@/features/lms/components/assignments/GradeModal';
import { StudentWork } from '@/features/lms/components/assignments/StudentWork';
import { useAssignment } from '@/features/lms/hooks/useLms';
import { lmsService } from '@/features/lms/services/lmsService';
import type { RosterRow } from '@/features/lms/types/lms.types';
import { formatDateTime, studentQuery, workState } from '@/features/lms/utils/lms.utils';
import { errorMessage } from '@/lib/errors';

/** An assignment: the teacher's grading roster, or the student's own hand-in (page 10). */
export function AssignmentDetailPage({ isStudent }: { isStudent: boolean }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const studentId = params.get('studentId') ?? undefined;
  const toast = useToast();
  const [grading, setGrading] = useState<RosterRow | null>(null);
  const a = useAssignment(id, studentId);
  if (a.isLoading) return <Spinner />;
  if (!a.data) return <Alert>{a.error ? errorMessage(a.error, 'Assignment not found.') : 'Assignment not found.'}</Alert>;
  const d = a.data;
  const fail = (e: unknown) => toast.error(errorMessage(e, 'Download failed'));
  const roster = d.roster ?? [];
  const submitted = roster.filter((r) => r.submission).length;
  const graded = roster.filter((r) => r.submission?.status === 'graded').length;

  return (
    <div className="space-y-5">
      <AreaLink to={`/lms/courses/${d.course.id}${studentQuery(studentId)}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600">
        <ArrowLeft size={15} /> {d.course.subject.name} · {d.course.section.schoolClass.name} {d.course.section.name}
      </AreaLink>
      <Card title={d.title} icon={NotebookPen} tone="amber">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge tone="amber">Due {formatDateTime(d.dueAt)}</Badge>
          <Badge tone="primary">{Number(d.maxMarks)} marks</Badge>
          <Badge tone="slate">{d.mode === 'file' ? 'File upload' : d.mode === 'text' ? 'Typed answer' : 'File or typed answer'}</Badge>
          {!d.allowLate && <Badge tone="rose">No late submissions</Badge>}
        </div>
        <p className="whitespace-pre-wrap text-base text-slate-700 dark:text-slate-200">{d.instructions}</p>
        {d.fileName && (
          <Button variant="secondary" icon={Download} className="mt-3" onClick={() => lmsService.downloadAssignment(d).catch(fail)}>
            {d.fileName}
          </Button>
        )}
      </Card>

      {d.canManage ? (
        <>
          <div className="stagger grid grid-cols-3 gap-3 sm:gap-4">
            <StatCard label="Students" value={roster.length} icon={NotebookPen} tone="sky" />
            <StatCard label="Submitted" value={submitted} icon={Send} tone="amber" />
            <StatCard label="Graded" value={graded} icon={CheckCircle2} tone="emerald" />
          </div>
          <Card padded={false} title="Submissions" icon={Send} tone="sky">
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Submitted</th>
                    <th className="px-5 py-3 text-right font-semibold">Marks</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
                  {roster.map((r) => {
                    const [state, tone] = workState(d, r.submission);
                    return (
                      <tr key={r.id}>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{r.firstName} {r.lastName}</div>
                          <div className="text-sm text-slate-500">{r.rollNo ? `Roll ${r.rollNo} · ` : ''}{r.admissionNo}</div>
                        </td>
                        <td className="px-5 py-3"><Badge tone={tone}>{state}</Badge></td>
                        <td className="px-5 py-3 text-sm text-slate-500">{r.submission ? formatDateTime(r.submission.submittedAt) : '—'}</td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums">{r.submission?.grade ? `${Number(r.submission.grade.marks)}/${Number(d.maxMarks)}` : '—'}</td>
                        <td className="px-3 py-3 text-right">
                          {r.submission && <Button variant="secondary" icon={Star} onClick={() => setGrading(r)}>{r.submission.grade ? 'Regrade' : 'Grade'}</Button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <GradeModal row={grading} maxMarks={d.maxMarks} onClose={() => setGrading(null)} />
        </>
      ) : (
        <StudentWork assignment={d} canSubmit={isStudent} />
      )}
    </div>
  );
}
