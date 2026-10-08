import { Printer } from 'lucide-react';
import { Alert, Badge, Button, Modal, Spinner } from '@/components/ui';
import { useReportCard } from '@/features/exams/hooks/useExams';
import { formatDate } from '@/lib/format';

/** Printable report card (page 10: Report Card Generated). */
export function ReportCardModal({ cardId, onClose }: { cardId: string | null; onClose: () => void }) {
  const q = useReportCard(cardId);
  const v = q.data;
  const c = v?.card;
  return (
    <Modal
      open={!!cardId}
      title="Report card"
      onClose={onClose}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button icon={Printer} disabled={!v} onClick={() => window.print()}>Print</Button></>}
    >
      {q.isLoading && <Spinner />}
      {q.error && <Alert>Could not load the report card.</Alert>}
      {v && c && (
        <div className="print-area space-y-5 text-slate-800 dark:text-slate-100">
          <div className="text-center">
            <div className="font-display text-3xl font-bold uppercase tracking-wide">{v.school}</div>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Report card · {c.exam.name} · {c.exam.academicYear.name}</div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 border-y border-dashed border-slate-300 py-3 text-base sm:grid-cols-4 dark:border-white/15">
            <dt className="text-slate-500">Student</dt><dd className="font-semibold">{c.student.firstName} {c.student.lastName}</dd>
            <dt className="text-slate-500">Admission no.</dt><dd className="tabular-nums">{c.student.admissionNo}</dd>
            <dt className="text-slate-500">Class</dt><dd>{c.section.schoolClass.name} · {c.section.name}</dd>
            <dt className="text-slate-500">Exam dates</dt><dd>{formatDate(c.exam.startDate)} – {formatDate(c.exam.endDate)}</dd>
          </dl>
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/10">
                <th className="py-2 font-semibold">Subject</th>
                <th className="py-2 text-right font-semibold">Max</th>
                <th className="py-2 text-right font-semibold">Pass</th>
                <th className="py-2 text-right font-semibold">Obtained</th>
                <th className="py-2 text-center font-semibold">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
              {c.lines.map((l) => (
                <tr key={l.subject}>
                  <td className="py-2">{l.subject}</td>
                  <td className="py-2 text-right tabular-nums">{l.maxMarks}</td>
                  <td className="py-2 text-right tabular-nums">{l.passMarks}</td>
                  <td className={`py-2 text-right font-semibold tabular-nums ${l.passed ? '' : 'text-rose-600'}`}>{l.isAbsent ? 'Absent' : l.marks ?? '—'}</td>
                  <td className="py-2 text-center"><Badge tone={l.passed ? 'emerald' : 'rose'}>{l.grade}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            {[
              ['Total', `${Number(c.totalMarks)} / ${Number(c.totalMax)}`],
              ['Percentage', `${Number(c.percentage)}%`],
              ['Grade', c.grade],
              ['Position', c.rank ? `${c.rank} of ${v.sectionSize}` : '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-primary-500/10 px-3 py-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
                <div className="font-display text-2xl font-bold tabular-nums">{value}</div>
              </div>
            ))}
          </div>
          <div className={`rounded-xl px-4 py-3 text-center font-display text-xl font-bold uppercase tracking-widest ${c.passed ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'}`}>
            {c.passed ? 'Passed' : 'Not passed'}
          </div>
          {c.remarks && <p className="whitespace-pre-wrap text-base"><strong>Remarks:</strong> {c.remarks}</p>}
          <div className="text-xs text-slate-400">
            Grading: {c.exam.gradingScale.bands.map((b) => `${b.grade} ≥ ${b.minPercent}%`).join(' · ')}. A student passes when every subject reaches its pass mark.
          </div>
        </div>
      )}
    </Modal>
  );
}
