import { Award, FileText, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, EmptyState, IconButton, Input, Modal, SearchInput, Select, Spinner } from '@/components/ui';
import { ReportCardModal } from '@/features/exams/components/ReportCardModal';
import { useExamsAction, useReportCards } from '@/features/exams/hooks/useExams';
import { examService } from '@/features/exams/services/examService';
import type { ExamDetail, ReportCardRow } from '@/features/exams/types/exam.types';
import { compactNumber } from '@/lib/format';
import { matchesText } from '@/lib/textMatch';

/** Generated report cards ranked per section, with remarks and the printable card. */
export function ReportCardsTab({ exam, canEdit }: { exam: ExamDetail; canEdit: boolean }) {
  const [sectionId, setSectionId] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState<'' | 'pass' | 'fail'>('');
  const [viewing, setViewing] = useState<string | null>(null);
  const [remarksFor, setRemarksFor] = useState<ReportCardRow | null>(null);
  const [remarks, setRemarks] = useState('');
  const cards = useReportCards(exam.id);
  const saveRemarks = useExamsAction(() => examService.saveRemarks(remarksFor!.id, remarks || null), { success: 'Remarks saved', onDone: () => setRemarksFor(null) });
  const sections = [...new Map((cards.data ?? []).map((c) => [c.section.id, `${c.section.schoolClass.name} · ${c.section.name}`])).entries()];
  const inSection = (cards.data ?? []).filter((c) => !sectionId || c.section.id === sectionId);
  const passed = inSection.filter((c) => c.passed).length;
  const shown = inSection.filter((c) => (!result || c.passed === (result === 'pass')) && matchesText(text, c.student.firstName, c.student.lastName, c.student.admissionNo, c.grade));
  if (cards.isLoading) return <Spinner />;
  if (!cards.data?.length) return <Card><EmptyState icon={Award} title="No report cards yet" tone="fuchsia">{canEdit ? 'Enter marks, then use "Generate report cards".' : 'Report cards appear once the administrator generates them.'}</EmptyState></Card>;
  return (
    <Card
      padded={false}
      title={`${compactNumber(inSection.length)} report cards · ${compactNumber(passed)} passed`}
      icon={Award}
      tone="fuchsia"
      actions={
        <div className="w-56">
          <Select aria-label="Section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
            <option value="">All sections</option>
            {sections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </Select>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-white/5">
        <SearchInput label="Search report cards" value={text} onChange={setText} placeholder="Search student, admission no. or grade…" />
        <div className="w-36">
          <Select aria-label="Result" value={result} onChange={(e) => setResult(e.target.value as '' | 'pass' | 'fail')}>
            <option value="">Pass and fail</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
          </Select>
        </div>
      </div>
      {shown.length === 0 && <p className="px-5 py-4 text-sm text-slate-500">No report card matches.</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
              <th className="px-5 py-3 font-semibold">Rank</th>
              <th className="px-5 py-3 font-semibold">Student</th>
              <th className="px-5 py-3 font-semibold">Class</th>
              <th className="px-5 py-3 text-right font-semibold">Marks</th>
              <th className="px-5 py-3 text-right font-semibold">%</th>
              <th className="px-5 py-3 font-semibold">Grade</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
            {shown.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-display text-lg font-bold tabular-nums">{c.rank ?? '—'}</td>
                <td className="px-5 py-3">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{c.student.firstName} {c.student.lastName}</div>
                  <div className="text-sm text-slate-500">{c.student.admissionNo}{c.remarks && ` · ${c.remarks}`}</div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{c.section.schoolClass.name} · {c.section.name}</td>
                <td className="px-5 py-3 text-right tabular-nums">{Number(c.totalMarks)}/{Number(c.totalMax)}</td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">{Number(c.percentage)}</td>
                <td className="px-5 py-3"><Badge tone={c.passed ? 'emerald' : 'rose'}>{c.grade}{c.passed ? '' : ' · fail'}</Badge></td>
                <td className="px-3 py-3">
                  <div className="flex justify-end">
                    {canEdit && <IconButton icon={Pencil} label="Remarks" onClick={() => { setRemarksFor(c); setRemarks(c.remarks ?? ''); }} />}
                    <IconButton icon={FileText} label="View report card" onClick={() => setViewing(c.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReportCardModal cardId={viewing} onClose={() => setViewing(null)} />
      <Modal open={!!remarksFor} title="Report card remarks" onClose={() => setRemarksFor(null)} footer={<><Button variant="secondary" onClick={() => setRemarksFor(null)}>Cancel</Button><Button loading={saveRemarks.isPending} onClick={() => saveRemarks.mutate(undefined)}>Save</Button></>}>
        <Input aria-label="Remarks" maxLength={500} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Hard-working and attentive in class." />
      </Modal>
    </Card>
  );
}
