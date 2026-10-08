import { ArrowLeft, ClipboardPen, Lock, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { AreaLink } from '@/app/router/area';
import { Alert, Badge, Button, Card, Spinner } from '@/components/ui';
import { useExamsAction, useMarksheet } from '@/features/exams/hooks/useExams';
import { examService } from '@/features/exams/services/examService';
import { errorMessage } from '@/lib/errors';

type Entry = { marks: string; isAbsent: boolean; remarks: string };

/** Marks entry for one paper and section (page 10: Student Results Entered). */
export function MarksheetPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const sectionId = params.get('sectionId')!;
  const subjectId = params.get('subjectId')!;
  const sheet = useMarksheet(id, sectionId, subjectId);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!sheet.data) return;
    setEntries(Object.fromEntries(sheet.data.rows.map((r) => [r.id, { marks: r.marks !== null ? String(Number(r.marks)) : '', isAbsent: r.isAbsent, remarks: r.remarks ?? '' }])));
    setDirty(false);
  }, [sheet.data]);
  const save = useExamsAction(
    () =>
      examService.saveMarks(id!, {
        sectionId,
        subjectId,
        entries: Object.entries(entries).map(([studentId, e]) => ({ studentId, isAbsent: e.isAbsent, marks: e.isAbsent || e.marks === '' ? null : e.marks, remarks: e.remarks || null })),
      }),
    { success: (r) => `${r.saved} marks saved`, onDone: () => setDirty(false) },
  );

  if (sheet.isLoading) return <Spinner />;
  if (!sheet.data) return <Alert>{sheet.error ? errorMessage(sheet.error, 'Marksheet not found.') : 'Marksheet not found.'}</Alert>;
  const s = sheet.data;
  const max = Number(s.paper.maxMarks);
  const pass = Number(s.paper.passMarks);
  const locked = s.exam.status === 'published';
  const set = (sid: string, patch: Partial<Entry>) => { setEntries((m) => ({ ...m, [sid]: { ...m[sid]!, ...patch } })); setDirty(true); };
  const invalid = Object.values(entries).some((e) => !e.isAbsent && e.marks !== '' && (!/^\d{1,4}(\.\d{1,2})?$/.test(e.marks) || Number(e.marks) > max));
  const filled = Object.values(entries).filter((e) => e.isAbsent || e.marks !== '').length;

  return (
    <div className="space-y-5">
      <AreaLink to={`/exams/${s.exam.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600"><ArrowLeft size={15} /> {s.exam.name}</AreaLink>
      <Card
        title={`${s.paper.subject.name} · ${s.section.schoolClass.name} ${s.section.name}`}
        icon={ClipboardPen}
        tone="fuchsia"
        padded={false}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="primary">Max {max} · pass {pass}</Badge>
            <Badge tone="sky">{filled}/{s.rows.length} entered</Badge>
            {locked ? <Badge tone="emerald"><Lock size={12} /> published</Badge> : <Button icon={Save} loading={save.isPending} disabled={!dirty || invalid} onClick={() => save.mutate()}>Save marks</Button>}
          </div>
        }
      >
        {invalid && <div className="p-4"><Alert>Marks must be numbers between 0 and {max}.</Alert></div>}
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Roll</th>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Marks</th>
                <th className="px-5 py-3 font-semibold">Absent</th>
                <th className="px-5 py-3 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
              {s.rows.map((r) => {
                const e = entries[r.id] ?? { marks: '', isAbsent: false, remarks: '' };
                const bad = !e.isAbsent && e.marks !== '' && (Number(e.marks) > max || !/^\d{1,4}(\.\d{1,2})?$/.test(e.marks));
                const failing = !e.isAbsent && e.marks !== '' && !bad && Number(e.marks) < pass;
                return (
                  <tr key={r.id}>
                    <td className="px-5 py-2 tabular-nums text-slate-500">{r.rollNo ?? '—'}</td>
                    <td className="px-5 py-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{r.firstName} {r.lastName}</div>
                      <div className="text-sm text-slate-500">{r.admissionNo}</div>
                    </td>
                    <td className="px-5 py-2">
                      <input
                        aria-label={`Marks for ${r.firstName} ${r.lastName}`}
                        inputMode="decimal"
                        disabled={locked || e.isAbsent}
                        value={e.isAbsent ? '' : e.marks}
                        onChange={(ev) => set(r.id, { marks: ev.target.value })}
                        className={`w-24 rounded-lg border px-3 py-1.5 text-right tabular-nums outline-none focus:ring-4 focus:ring-primary-500/15 dark:bg-[#0e1626] dark:text-white ${bad ? 'border-rose-500' : failing ? 'border-amber-400' : 'border-slate-300 dark:border-white/10'}`}
                      />
                    </td>
                    <td className="px-5 py-2">
                      <input type="checkbox" aria-label="Absent" className="h-4 w-4 accent-primary-600" disabled={locked} checked={e.isAbsent} onChange={(ev) => set(r.id, { isAbsent: ev.target.checked })} />
                    </td>
                    <td className="px-5 py-2">
                      <input aria-label="Remarks" maxLength={200} disabled={locked} value={e.remarks} onChange={(ev) => set(r.id, { remarks: ev.target.value })} className="w-full min-w-[10rem] rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:ring-4 focus:ring-primary-500/15 dark:border-white/10 dark:bg-[#0e1626] dark:text-white" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
