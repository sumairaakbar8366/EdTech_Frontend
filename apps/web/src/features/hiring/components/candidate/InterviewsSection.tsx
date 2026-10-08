import { CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { Button, Field, IconTile, Input, Select } from '@/components/ui';
import { RECOMMENDATION_LABEL, isActiveCandidate } from '@/features/hiring/constants';
import { useHiringAction } from '@/features/hiring/hooks/useHiring';
import { hiringService } from '@/features/hiring/services/hiringService';
import type { JobApplication } from '@/features/hiring/types/hiring.types';
import { onSubmit } from '@/lib/forms';

type ResultForm = { id: string; score: string; recommendation: string; notes: string };

/** A candidate's interviews: list, record a result, schedule another. */
export function InterviewsSection({ app, canEdit }: { app: JobApplication; canEdit: boolean }) {
  const blank = { scheduledAt: '', mode: 'in_person', interviewer: '' };
  const [interview, setInterview] = useState(blank);
  const [result, setResult] = useState<ResultForm | null>(null);
  const schedule = useHiringAction(
    () => hiringService.scheduleInterview(app.id, { scheduledAt: new Date(interview.scheduledAt).toISOString(), mode: interview.mode, interviewer: interview.interviewer }),
    'Interview scheduled',
    () => setInterview(blank),
  );
  const record = useHiringAction(
    () => hiringService.recordInterview(result!.id, { score: result!.score ? Number(result!.score) : null, recommendation: result!.recommendation || null, notes: result!.notes || null }),
    'Interview result saved',
    () => setResult(null),
  );
  const active = isActiveCandidate(app.status);

  return (
    <div>
      <div className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Interviews</div>
      {app.interviews.length === 0 && <p className="text-base text-slate-400">No interviews yet.</p>}
      <div className="space-y-2">
        {app.interviews.map((i) => (
          <div key={i.id} className="flex flex-wrap items-center gap-3 rounded-lg p-3 ring-1 ring-slate-200 dark:ring-white/10">
            <IconTile icon={CalendarClock} tone="magenta" size="sm" />
            <div className="flex-1">
              <div className="font-semibold text-slate-800 dark:text-slate-100">{new Date(i.scheduledAt).toLocaleString()} · {i.mode.replace('_', ' ')} · {i.interviewer}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {i.score ? `Score ${i.score}/10` : 'Not scored'}{i.recommendation ? ` · ${RECOMMENDATION_LABEL[i.recommendation]}` : ''}{i.notes ? ` · ${i.notes}` : ''}
              </div>
            </div>
            {canEdit && active && (
              <Button variant="secondary" className="px-3 py-1 text-sm" onClick={() => setResult({ id: i.id, score: i.score?.toString() ?? '', recommendation: i.recommendation ?? '', notes: i.notes ?? '' })}>Record result</Button>
            )}
          </div>
        ))}
      </div>
      {result && (
        <form onSubmit={onSubmit(() => record.mutate(undefined))} className="mt-3 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-4 dark:bg-white/[0.03]">
          <Field label="Score (1–10)"><Input type="number" min={1} max={10} value={result.score} onChange={(e) => setResult({ ...result, score: e.target.value })} /></Field>
          <Field label="Recommendation">
            <Select value={result.recommendation} onChange={(e) => setResult({ ...result, recommendation: e.target.value })}>
              <option value="">—</option>{Object.entries(RECOMMENDATION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2"><Field label="Notes"><Input maxLength={3000} value={result.notes} onChange={(e) => setResult({ ...result, notes: e.target.value })} /></Field></div>
          <div className="flex justify-end gap-2 sm:col-span-4"><Button variant="secondary" onClick={() => setResult(null)}>Cancel</Button><Button type="submit" loading={record.isPending}>Save result</Button></div>
        </form>
      )}
      {canEdit && (app.status === 'shortlisted' || app.status === 'interview') && (
        <form onSubmit={onSubmit(() => schedule.mutate(undefined))} className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Date & time"><Input type="datetime-local" required value={interview.scheduledAt} onChange={(e) => setInterview({ ...interview, scheduledAt: e.target.value })} /></Field>
          <Field label="Mode"><Select value={interview.mode} onChange={(e) => setInterview({ ...interview, mode: e.target.value })}><option value="in_person">In person</option><option value="online">Online</option><option value="phone">Phone</option></Select></Field>
          <Field label="Interviewer"><Input required maxLength={150} value={interview.interviewer} onChange={(e) => setInterview({ ...interview, interviewer: e.target.value })} /></Field>
          <div className="flex items-end"><Button type="submit" icon={CalendarClock} className="w-full" loading={schedule.isPending}>Schedule</Button></div>
        </form>
      )}
    </div>
  );
}
