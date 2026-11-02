import { Award, Check, GraduationCap, Medal, Send, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, EmptyState, Field, Input, PageHeader, SearchInput, Spinner, TextArea } from '@/components/ui';
import { pkr, schoolScholarshipService as svc, type SchoolProgram, type ShortlistRow } from '@/features/sponsorship/sponsorship';
import { errorMessage } from '@/lib/errors';
import { useAction } from '@/lib/hooks/useAction';

const KEY = ['school-scholarships'] as const;
const STATUS: Record<string, { label: string; tone: 'amber' | 'primary' | 'emerald' | 'slate' }> = { confirmed: { label: 'Put forward', tone: 'amber' }, selected: { label: 'Selected', tone: 'primary' }, awarded: { label: 'Awarded', tone: 'emerald' }, rejected: { label: 'Not this time', tone: 'slate' } };

/** One program: the students who qualify (from the school's own records), to review and confirm. */
function Shortlist({ program }: { program: SchoolProgram }) {
  const list = useQuery({ queryKey: [...KEY, 'shortlist', program.requestId], queryFn: () => svc.shortlist(program.requestId) });
  const history = useQuery({ queryKey: [...KEY, 'history', program.requestId], queryFn: () => svc.nominations(program.requestId) });
  const [show, setShow] = useState<'qualifying' | 'all'>('qualifying');
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [common, setCommon] = useState('');
  const [error, setError] = useState<string | null>(null);
  const confirm = useAction(() => svc.confirm(program.requestId, Object.entries(picked).map(([studentId, note]) => ({ studentId, needNote: note.trim() || common.trim() }))), {
    success: (r) => `${r.confirmed} student(s) put forward for ${r.period}`, invalidate: [KEY], onDone: () => setPicked({}), toastErrors: false,
  });
  const rows = useMemo(() => (list.data?.rows ?? []).filter((r) => (show === 'all' || r.eligible) && (!text.trim() || r.name.toLowerCase().includes(text.trim().toLowerCase()) || r.className.toLowerCase().includes(text.trim().toLowerCase()))), [list.data, show, text]);
  const free = (r: ShortlistRow) => r.eligible && !r.status;
  const ready = Object.keys(picked).length > 0 && (common.trim().length >= 10 || Object.values(picked).every((n) => n.trim().length >= 10));
  const toggle = (id: string) => setPicked((p) => { const n = { ...p }; if (id in n) delete n[id]; else n[id] = ''; return n; });
  const topN = () => { const n = program.slots > 0 ? Math.max(0, program.slots - program.confirmed) : 10; setPicked(Object.fromEntries((list.data?.rows ?? []).filter(free).slice(0, n).map((r) => [r.studentId, '']))); };

  return (
    <div className="space-y-4">
      <Card title={program.title} icon={Award} tone="emerald">
        <div className="flex flex-wrap gap-2">
          {program.sponsor && <Badge tone="primary">Sponsored by {program.sponsor}</Badge>}
          {program.awardAmount && <Badge tone="emerald">{pkr(program.awardAmount, program.currency)} per student</Badge>}
          <Badge tone="slate">{program.targetLevels.length ? `Class ${program.targetLevels.join(', ')}` : 'Every class'}{program.continuesToUndergrad ? ' · continues to undergraduate studies' : ''}</Badge>
          <Badge tone="slate">Cycle: {program.currentPeriod}</Badge>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Students qualify with an exam average of at least <strong>{program.minAverage}%</strong>, attendance of at least <strong>{program.minAttendance}%</strong>{program.needRequired ? ', and a sign of financial need in your fee records' : ''}. {program.criteria}</p>
      </Card>

      <Card title={`Students who qualify${list.data ? ` · ${list.data.eligible}` : ''}`} icon={GraduationCap} tone="primary" padded={false} actions={
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput label="Search students" value={text} onChange={setText} placeholder="Name or class…" />
          <div className="flex gap-1">{(['qualifying', 'all'] as const).map((k) => <button key={k} onClick={() => setShow(k)} className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-bold uppercase ${show === k ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'}`}>{k === 'qualifying' ? 'Qualifying' : 'All in these classes'}</button>)}</div>
          <Button variant="secondary" icon={Sparkles} onClick={topN}>Pick the top</Button>
        </div>
      }>
        {list.isLoading && <div className="p-5"><Spinner /></div>}
        {list.data && rows.length === 0 && <EmptyState icon={GraduationCap} title={show === 'qualifying' ? 'Nobody qualifies yet' : 'No students in these classes'} tone="primary">{show === 'qualifying' ? 'Students appear once they have published exam results, attendance and a sign of need in the fee records. Check “All in these classes” to see why each is not listed.' : 'Check the classes and enrolments.'}</EmptyState>}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
          {rows.map((r) => {
            const on = r.studentId in picked;
            return (
              <li key={r.studentId} className={`px-4 py-3 ${on ? 'bg-primary-500/5' : ''}`}>
                <div className="flex flex-wrap items-start gap-3">
                  <input type="checkbox" className="mt-1.5 h-4 w-4" aria-label={`Put forward ${r.name}`} disabled={!free(r)} checked={on} onChange={() => toggle(r.studentId)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{r.name}</span><span className="text-sm text-slate-500">{r.className}</span>
                      {r.excellent && <Badge tone="emerald"><Medal size={12} /> excellent</Badge>}
                      {r.status ? <Badge tone={STATUS[r.status]?.tone ?? 'slate'}>{STATUS[r.status]?.label ?? r.status}</Badge> : !r.eligible && <Badge tone="slate">not listed</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{r.eligible ? r.reasons.join(' · ') : r.blockers.join(' · ')}</p>
                    {on && <div className="mt-2"><Input aria-label={`Note on ${r.name}`} placeholder="Optional: a note about this family (otherwise the common note below is used)" value={picked[r.studentId] ?? ''} maxLength={1000} onChange={(e) => setPicked((p) => ({ ...p, [r.studentId]: e.target.value }))} /></div>}
                  </div>
                  <div className="flex shrink-0 gap-3 text-center text-xs text-slate-500">
                    <div><div className="font-display text-lg font-bold text-slate-800 dark:text-slate-100">{r.average === null ? '—' : `${Math.round(r.average)}%`}</div>average</div>
                    <div><div className="font-display text-lg font-bold text-slate-800 dark:text-slate-100">{r.attendance === null ? '—' : `${Math.round(r.attendance)}%`}</div>attendance</div>
                    <div><div className="font-display text-lg font-bold text-amber-600">{r.needScore}</div>need</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {Object.keys(picked).length > 0 && (
          <div className="space-y-3 border-t border-slate-200 p-4 dark:border-white/10">
            {error && <Alert>{error}</Alert>}
            <Field label="Why these families need support (confirmation by the school)" hint="Only you know the family’s situation. The note goes with the names; nothing is sent until you confirm." required><TextArea rows={3} maxLength={1000} value={common} onChange={(e) => setCommon(e.target.value)} placeholder="e.g. Father is a daily-wage worker; fees were paid late or waived this year." /></Field>
            <Button icon={Send} loading={confirm.isPending} disabled={!ready} onClick={() => { setError(null); confirm.mutate(undefined, { onError: (e) => setError(errorMessage(e)) }); }}>Confirm {Object.keys(picked).length} student(s) and send to Skool EdTech</Button>
          </div>
        )}
      </Card>

      {history.data && history.data.length > 0 && (
        <Card title="What you have put forward" icon={Check} tone="teal" padded={false}>
          <ul className="divide-y divide-slate-200/70 dark:divide-white/5">{history.data.map((h) => <li key={h.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm"><span><strong className="text-slate-900 dark:text-white">{h.studentName}</strong> <span className="text-slate-500">{h.className} · {h.periodLabel}</span></span><Badge tone={STATUS[h.status]?.tone ?? 'slate'}>{STATUS[h.status]?.label ?? h.status}</Badge></li>)}</ul>
        </Card>
      )}
    </div>
  );
}

/**
 * Scholarship candidates (principal and admin). For each scholarship the school is approved for, the
 * system lists the students who qualify from the school's own live data; the school reviews, confirms
 * with a note on need, and only then do the names go to Skool EdTech. Selected names come back here.
 */
export function SchoolScholarshipsPage() {
  const programs = useQuery({ queryKey: [...KEY, 'programs'], queryFn: svc.programs });
  const [open, setOpen] = useState<string | null>(null);
  const current = programs.data?.find((p) => p.requestId === (open ?? programs.data?.[0]?.requestId)) ?? null;
  return (
    <div>
      <PageHeader title="Scholarship candidates" sub="Students who qualify for the scholarships your school was approved for" icon={Award} tone="emerald" />
      {programs.isLoading && <Spinner />}
      {programs.data?.length === 0 && <Card><EmptyState icon={Award} title="No scholarship is open to your school yet" tone="emerald">When Skool EdTech offers your school a scholarship and approves your request, the students who qualify are listed here for you to review.</EmptyState></Card>}
      {programs.data && programs.data.length > 1 && <div role="tablist" className="surface mb-4 inline-flex flex-wrap gap-1 rounded-xl p-1">{programs.data.map((p) => <button key={p.requestId} role="tab" aria-selected={current?.requestId === p.requestId} onClick={() => setOpen(p.requestId)} className={`focus-ring rounded-lg px-4 py-2 text-base font-bold uppercase tracking-wide ${current?.requestId === p.requestId ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'}`}>{p.title}</button>)}</div>}
      {current && <Shortlist key={current.requestId} program={current} />}
    </div>
  );
}
