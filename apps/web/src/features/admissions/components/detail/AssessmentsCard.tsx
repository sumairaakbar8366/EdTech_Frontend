import { ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Select } from '@/components/ui';
import { useAdmissionsAction } from '@/features/admissions/hooks/useAdmissions';
import { admissionService } from '@/features/admissions/services/admissionService';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';
import { onSubmit } from '@/lib/forms';

type ResultForm = { id: string; score: string; result: string; notes: string };

/** Interviews / entrance tests: list, record a result, schedule a new one. */
export function AssessmentsCard({ application: a, canEdit, closed }: { application: AdmissionApplication; canEdit: boolean; closed: boolean }) {
  const blank = { kind: 'interview', scheduledAt: '', conductedBy: '' };
  const [assess, setAssess] = useState(blank);
  const [result, setResult] = useState<ResultForm | null>(null);
  const schedule = useAdmissionsAction(
    () => admissionService.schedule(a.id, { kind: assess.kind, scheduledAt: new Date(assess.scheduledAt).toISOString(), conductedBy: assess.conductedBy }),
    'Scheduled',
    () => setAssess(blank),
  );
  const record = useAdmissionsAction(
    () => admissionService.recordResult(result!.id, { score: result!.score ? Number(result!.score) : null, result: result!.result, notes: result!.notes || null }),
    'Result saved',
    () => setResult(null),
  );
  const canSchedule = canEdit && (a.status === 'documents_verified' || a.status === 'interview_scheduled');

  return (
    <Card title="Interview & entrance test" icon={ClipboardCheck} tone="magenta">
      {a.assessments?.length === 0 && <p className="text-base text-slate-400">Nothing scheduled yet.</p>}
      <ul className="space-y-2">
        {a.assessments?.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg p-3 ring-1 ring-slate-200 dark:ring-white/10">
            <Badge tone="magenta">{s.kind}</Badge>
            <span className="font-semibold">{new Date(s.scheduledAt).toLocaleString()}</span>
            <span className="text-slate-500">by {s.conductedBy}</span>
            <Badge tone={s.result === 'pass' ? 'emerald' : s.result === 'fail' ? 'rose' : 'slate'}>{s.result}{s.score !== null ? ` · ${s.score}/100` : ''}</Badge>
            {canEdit && !closed && (
              <Button variant="secondary" className="ml-auto px-3 py-1 text-sm" onClick={() => setResult({ id: s.id, score: s.score?.toString() ?? '', result: s.result, notes: s.notes ?? '' })}>Record result</Button>
            )}
            {s.notes && <p className="w-full text-base text-slate-600 dark:text-slate-300">{s.notes}</p>}
          </li>
        ))}
      </ul>
      {result && (
        <form onSubmit={onSubmit(() => record.mutate(undefined))} className="mt-3 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-4 dark:bg-white/[0.03]">
          <Field label="Score (0–100)"><Input type="number" min={0} max={100} value={result.score} onChange={(e) => setResult({ ...result, score: e.target.value })} /></Field>
          <Field label="Result"><Select value={result.result} onChange={(e) => setResult({ ...result, result: e.target.value })}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option></Select></Field>
          <div className="sm:col-span-2"><Field label="Notes"><Input maxLength={3000} value={result.notes} onChange={(e) => setResult({ ...result, notes: e.target.value })} /></Field></div>
          <div className="flex justify-end gap-2 sm:col-span-4"><Button variant="secondary" onClick={() => setResult(null)}>Cancel</Button><Button type="submit" loading={record.isPending}>Save</Button></div>
        </form>
      )}
      {canSchedule && (
        <form onSubmit={onSubmit(() => schedule.mutate(undefined))} className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Type"><Select value={assess.kind} onChange={(e) => setAssess({ ...assess, kind: e.target.value })}><option value="interview">Interview</option><option value="test">Entrance test</option></Select></Field>
          <Field label="Date & time"><Input type="datetime-local" required value={assess.scheduledAt} onChange={(e) => setAssess({ ...assess, scheduledAt: e.target.value })} /></Field>
          <Field label="Conducted by"><Input required maxLength={150} value={assess.conductedBy} onChange={(e) => setAssess({ ...assess, conductedBy: e.target.value })} /></Field>
          <div className="flex items-end"><Button type="submit" className="w-full" loading={schedule.isPending}>Schedule</Button></div>
        </form>
      )}
    </Card>
  );
}
