import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { History, Pencil, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, DataTable, Field, FilterBar, FilterSlot, IconButton, Input, Modal, Pagination, SearchInput, Select, Spinner, TextArea, type Column } from '@/components/ui';
import { useExams } from '@/features/exams/hooks/useExams';
import { errorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { onSubmit } from '@/lib/forms';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';

interface Line { subject: string; maxMarks: number; passMarks: number; marks: number | null; isAbsent: boolean; grade: string; passed: boolean }
interface CardRow {
  id: string;
  percentage: string;
  grade: string;
  passed: boolean;
  passOverride: boolean | null;
  rank: number | null;
  totalMarks: string;
  totalMax: string;
  remarks: string | null;
  editedAt: string | null;
  editedByName: string | null;
  lines: Line[];
  student: { id: string; firstName: string; lastName: string; admissionNo: string };
  exam: { id: string; name: string; status: string; academicYear: { name: string } };
  section: { name: string; schoolClass: { name: string } };
  _count?: { changes: number };
}
interface Change { id: string; changedByName: string | null; reason: string; createdAt: string; before: { percentage: number; passed: boolean }; after: { percentage: number; passed: boolean } }

const KEY = ['exams', 'corrections'] as const;
const qs = (o: Record<string, string | number | undefined>) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString();

function CorrectionModal({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const detail = useQuery({ queryKey: [...KEY, 'one', cardId], queryFn: () => api<CardRow & { changes: Change[] }>(`/exams/report-cards/${cardId}/corrections`) });
  const c = detail.data;
  const [lines, setLines] = useState<Line[]>([]);
  const [result, setResult] = useState<'auto' | 'pass' | 'fail'>('auto');
  const [remarks, setRemarks] = useState('');
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (!c) return;
    setLines(c.lines);
    setResult(c.passOverride === true ? 'pass' : c.passOverride === false ? 'fail' : 'auto');
    setRemarks(c.remarks ?? '');
  }, [c]);
  const save = useAction(
    () => api(`/exams/report-cards/${cardId}/corrections`, {
      method: 'POST',
      body: {
        lines: lines.filter((l, i) => l.marks !== c!.lines[i]!.marks || l.isAbsent !== c!.lines[i]!.isAbsent).map((l) => ({ subject: l.subject, marks: l.isAbsent ? null : l.marks, isAbsent: l.isAbsent })),
        passOverride: result === 'auto' ? null : result === 'pass',
        remarks: remarks.trim() || null,
        reason: reason.trim(),
      },
    }),
    { success: 'Result saved', invalidate: [KEY, ['exams']], onDone: onClose, toastErrors: false },
  );
  const setLine = (i: number, patch: Partial<Line>) => setLines(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <Modal open size="xl" title={c ? `${c.student.firstName} ${c.student.lastName} · ${c.exam.name}` : 'Result'} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="correction" icon={Save} loading={save.isPending} disabled={!c || reason.trim().length < 3}>Save change</Button></>}>
      {!c ? <Spinner /> : (
        <form id="correction" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-5">
          {save.error && <Alert>{errorMessage(save.error)}</Alert>}
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {c.section.schoolClass.name} · Section {c.section.name} · {c.exam.academicYear.name} · admission no. {c.student.admissionNo}. Now: <strong>{Number(c.percentage)}%</strong>, grade {c.grade}, <strong>{c.passed ? 'Passed' : 'Failed'}</strong>{c.exam.status === 'published' && ' (published: the family is told about a change)'}.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50/60 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/5"><th className="px-4 py-2">Subject</th><th className="px-4 py-2 text-right">Max</th><th className="px-4 py-2 text-right">Pass</th><th className="px-4 py-2">Marks</th><th className="px-4 py-2">Absent</th></tr></thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={l.subject} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                    <td className="px-4 py-2 font-medium">{l.subject}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{l.maxMarks}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{l.passMarks}</td>
                    <td className="px-4 py-2"><Input type="number" min={0} max={l.maxMarks} step="0.5" disabled={l.isAbsent} value={l.marks ?? ''} onChange={(e) => setLine(i, { marks: e.target.value === '' ? null : Number(e.target.value) })} className="w-28" aria-label={`${l.subject} marks`} /></td>
                    <td className="px-4 py-2"><input type="checkbox" className="h-4 w-4 accent-orange-500" checked={l.isAbsent} onChange={(e) => setLine(i, { isAbsent: e.target.checked, marks: e.target.checked ? null : l.marks })} aria-label={`${l.subject} absent`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Result</legend>
            <div className="flex flex-wrap gap-2">
              {([['auto', 'From the marks'], ['pass', 'Pass'], ['fail', 'Fail']] as const).map(([v, label]) => (
                <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${result === v ? 'border-orange-500 bg-orange-500/5' : 'border-slate-200 dark:border-white/10'}`}>
                  <input type="radio" name="result" className="accent-orange-500" checked={result === v} onChange={() => setResult(v)} /> {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Remarks on the report card (optional)"><TextArea rows={2} maxLength={1000} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></Field>
            <Field label="Reason for this change" hint="Required; kept in the history"><TextArea rows={2} required minLength={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Re-checked the maths paper; promoted on the principal's decision" /></Field>
          </div>
          {c.changes.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-slate-500"><History size={14} /> Earlier changes</div>
              <ul className="space-y-2 text-sm">
                {c.changes.map((h) => (
                  <li key={h.id} className="rounded-lg bg-slate-500/5 px-3 py-2">
                    <span className="font-medium">{h.changedByName ?? 'Administrator'}</span> · {formatDate(h.createdAt)}: {h.before.percentage}% {h.before.passed ? 'pass' : 'fail'} → {h.after.percentage}% {h.after.passed ? 'pass' : 'fail'}
                    <div className="text-slate-500">{h.reason}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}

/** Admins: find any report card (any exam, any year, published or not) and correct marks or pass / fail. */
export function ResultCorrections() {
  const exams = useExams();
  const classes = useQuery({ queryKey: ['academics', 'classes'], queryFn: () => api<{ id: string; name: string }[]>('/academics/classes') });
  const [q, setQ] = useState('');
  const [examId, setExamId] = useState('');
  const [classId, setClassId] = useState('');
  const [passed, setPassed] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const list = useQuery({
    queryKey: [...KEY, { q, examId, classId, passed, page }],
    queryFn: () => api<{ items: CardRow[]; total: number; page: number; pageSize: number }>(`/exams/report-cards/search?${qs({ q: q.trim() || undefined, examId, classId, passed, page })}`),
    placeholderData: keepPreviousData,
  });
  const d = list.data;
  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(1); };
  const cols: Column<CardRow>[] = [
    { header: 'Student', cell: (c) => <div><div className="font-semibold text-slate-900 dark:text-white">{c.student.firstName} {c.student.lastName}</div><div className="font-mono text-xs text-slate-500">{c.student.admissionNo}</div></div> },
    { header: 'Exam', cell: (c) => <div className="text-sm"><div>{c.exam.name}</div><div className="text-slate-500">{c.exam.academicYear.name}{c.exam.status !== 'published' ? ' · not published' : ''}</div></div> },
    { header: 'Class', cell: (c) => <span className="text-sm">{c.section.schoolClass.name} {c.section.name}</span> },
    { header: 'Marks', align: 'right', cell: (c) => <span className="tabular-nums">{Number(c.totalMarks)}/{Number(c.totalMax)}</span> },
    { header: '%', align: 'right', cell: (c) => <span className="font-semibold tabular-nums">{Number(c.percentage)}</span> },
    { header: 'Grade', cell: (c) => c.grade },
    { header: 'Result', cell: (c) => <div><Badge tone={c.passed ? 'emerald' : 'rose'}>{c.passed ? 'Pass' : 'Fail'}</Badge>{c.passOverride !== null && <span className="ml-1 text-xs text-amber-600">set by admin</span>}{c.editedAt && <div className="text-xs text-slate-500">changed {formatDate(c.editedAt)}</div>}</div> },
    { header: '', align: 'right', cell: (c) => <IconButton icon={Pencil} label="Change result" onClick={() => setEditing(c.id)} /> },
  ];
  return (
    <Card padded={false} title="Results & corrections" icon={Pencil}>
      <FilterBar>
        <SearchInput label="Search students" placeholder="Student name or admission no." value={q} onChange={reset(setQ)} />
        <FilterSlot width="w-52"><Select aria-label="Exam" value={examId} onChange={(e) => reset(setExamId)(e.target.value)}><option value="">All exams (every year)</option>{exams.data?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</Select></FilterSlot>
        <FilterSlot width="w-40"><Select aria-label="Class" value={classId} onChange={(e) => reset(setClassId)(e.target.value)}><option value="">All classes</option>{classes.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FilterSlot>
        <FilterSlot width="w-36"><Select aria-label="Result" value={passed} onChange={(e) => reset(setPassed)(e.target.value)}><option value="">Pass & fail</option><option value="true">Passed</option><option value="false">Failed</option></Select></FilterSlot>
      </FilterBar>
      {list.isLoading && <div className="p-6"><Spinner /></div>}
      {d?.items.length === 0 && <p className="p-6 text-sm text-slate-500">No report cards match. Report cards appear after they are generated for an exam.</p>}
      {!!d?.items.length && <DataTable columns={cols} rows={d.items} rowKey={(c) => c.id} onRowClick={(c) => setEditing(c.id)} />}
      {d && <div className="p-4"><Pagination page={d.page} pageSize={d.pageSize} total={d.total} onChange={setPage} /></div>}
      {editing && <CorrectionModal cardId={editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}
