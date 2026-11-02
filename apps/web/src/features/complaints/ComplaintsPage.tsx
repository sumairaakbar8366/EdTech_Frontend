import { AlertTriangle, CheckCircle2, Clock, EyeOff, Inbox, Plus, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { Badge, Button, Card, EmptyState, PageHeader, Pagination, SearchInput, Select, Spinner, StatCard } from '@/components/ui';
import { ComplaintThread } from '@/features/complaints/ComplaintThread';
import { NewComplaintModal } from '@/features/complaints/NewComplaintModal';
import { COMPLAINTS_KEY, complaintsService, SEVERITY_TONE, STATUS_LABEL, STATUS_TONE, useComplaintMeta, useComplaintSummary, useMyComplaints, useReceivedComplaints, type ComplaintRow, type ComplaintStatus } from '@/features/complaints/complaints';
import { timeAgo } from '@/features/communication/utils/notificationLinks';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

function Row({ c, active, onClick, showFrom }: { c: ComplaintRow; active: boolean; onClick: () => void; showFrom?: boolean }) {
  return (
    <li>
      <button onClick={onClick} className={`relative flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-primary-500/5 ${active ? 'bg-primary-500/10' : ''}`}>
        {active && <span className="absolute inset-y-0 left-0 w-1 bg-brand" />}
        <span className="flex items-center justify-between gap-2"><span className="truncate font-semibold text-slate-800 dark:text-slate-100">{c.subject}</span><span className="shrink-0 text-xs text-slate-400">{timeAgo(c.lastActivityAt)}</span></span>
        <span className="flex flex-wrap items-center gap-1.5 text-xs"><span className="font-mono text-slate-400">{c.ticketNo}</span><Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>{(c.severity === 'urgent' || c.severity === 'high') && <Badge tone={SEVERITY_TONE[c.severity]}>{c.severity}</Badge>}{c.anonymous && <span className="inline-flex items-center gap-1 text-slate-500"><EyeOff size={11} /> {showFrom ? `${c.complainantRole ?? 'someone'}, anonymous` : 'anonymous'}</span>}</span>
      </button>
    </li>
  );
}

/** The signed-in person's own complaints (all roles). Also shown under Communication → Complaints. */
export function MyComplaintsList({ active, onPick }: { active: string | null; onPick: (id: string) => void }) {
  const mine = useMyComplaints();
  if (mine.isLoading) return <div className="p-5"><Spinner /></div>;
  if (!mine.data?.length) return <EmptyState icon={ShieldQuestion} title="You have not raised a complaint" tone="rose">When something is wrong, tell the school here. You can stay anonymous.</EmptyState>;
  return <ul className="divide-y divide-slate-200/70 dark:divide-white/5">{mine.data.map((c) => <Row key={c.id} c={c} active={c.id === active} onClick={() => onPick(c.id)} />)}</ul>;
}

/** Notices and complaints the school sent to this person (parents of a child or class). */
function ReceivedList({ active, onPick }: { active: string | null; onPick: (id: string) => void }) {
  const r = useReceivedComplaints();
  if (r.isLoading) return <div className="p-5"><Spinner /></div>;
  if (!r.data?.length) return <EmptyState icon={Inbox} title="Nothing sent to you" tone="rose" />;
  return <ul className="divide-y divide-slate-200/70 dark:divide-white/5">{r.data.map((c) => <Row key={c.id} c={c} active={c.id === active} onClick={() => onPick(c.id)} />)}</ul>;
}

function Queue({ active, onPick }: { active: string | null; onPick: (id: string) => void }) {
  const meta = useComplaintMeta().data;
  const [status, setStatus] = useState<ComplaintStatus | ''>('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [text, setText] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebouncedValue(text.trim(), 300);
  const list = useQuery({ queryKey: [...COMPLAINTS_KEY, 'list', status, category, severity, q, page], queryFn: () => complaintsService.list({ status, category, severity, q, page }), refetchInterval: 45_000 });
  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(1); };
  return (
    <>
      <div className="space-y-2 border-b border-slate-200 p-3 dark:border-white/5" data-tour="complaint-filters">
        <SearchInput label="Search complaints" value={text} onChange={reset(setText)} placeholder="Search title, number, name…" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Select aria-label="Status" value={status} onChange={(e) => reset(setStatus)(e.target.value as ComplaintStatus | '')}><option value="">Any status</option>{meta?.statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</Select>
          <Select aria-label="Topic" value={category} onChange={(e) => reset(setCategory)(e.target.value)}><option value="">Any topic</option>{meta?.categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</Select>
          <Select aria-label="Severity" className="xl:col-span-2" value={severity} onChange={(e) => reset(setSeverity)(e.target.value)}><option value="">Any severity</option>{meta?.severities.map((s) => <option key={s} value={s}>{s}</option>)}</Select>
        </div>
      </div>
      {list.isLoading && <div className="p-5"><Spinner /></div>}
      {list.data?.items.length === 0 && <EmptyState icon={Inbox} title="No complaints match" tone="rose" />}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">{list.data?.items.map((c) => <Row key={c.id} c={c} active={c.id === active} onClick={() => onPick(c.id)} showFrom />)}</ul>
      {list.data && <Pagination page={page} pageSize={list.data.pageSize} total={list.data.total} onChange={setPage} />}
    </>
  );
}

/**
 * Complaints. Everyone can raise one and follow it; the principal and the admin see the queue of all
 * complaints sent to them, filter it, answer, add private notes, and resolve.
 */
export function ComplaintsPage({ handler }: { handler: boolean }) {
  const [params, setParams] = useSearchParams();
  const active = params.get('open');
  const received = useReceivedComplaints();
  const [tab, setTab] = useState<'queue' | 'mine' | 'received'>(handler ? 'queue' : 'mine');
  const [raising, setRaising] = useState(false);
  const summary = useComplaintSummary(handler).data;
  const open = (id: string | null) => setParams(id ? { open: id } : {}, { replace: true });
  const asHandler = handler && tab === 'queue';
  const hasReceived = (received.data?.length ?? 0) > 0;

  return (
    <div>
      <PageHeader title="Complaints" sub={handler ? 'Concerns sent to the principal and the admin' : 'Tell the school about any problem; you can stay anonymous'} icon={ShieldAlert} tone="rose" actions={<Button icon={Plus} onClick={() => setRaising(true)} data-tour="complaint-new">Raise a complaint</Button>} />
      {handler && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" data-tour="complaint-stats">
          <StatCard label="Open" value={summary?.open ?? '–'} icon={Inbox} tone="amber" />
          <StatCard label="Under review" value={summary?.inReview ?? '–'} icon={Clock} tone="sky" />
          <StatCard label="Serious / urgent, not resolved" value={summary?.urgentOpen ?? '–'} icon={AlertTriangle} tone="rose" />
          <StatCard label="Resolved" value={summary?.resolved ?? '–'} icon={CheckCircle2} tone="emerald" />
        </div>
      )}
      {(handler || hasReceived) && (
        <div role="tablist" className="surface mb-4 inline-flex flex-wrap gap-1 rounded-xl p-1">
          {([...(handler ? [['queue', 'School queue']] : []), ['mine', 'Sent by me'], ...(hasReceived ? [['received', `Sent to me (${received.data!.length})`]] : [])] as [typeof tab, string][]).map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); open(null); }} className={`focus-ring rounded-lg px-4 py-2 text-base font-bold uppercase tracking-wide ${tab === k ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'}`}>{label}</button>)}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[24rem_1fr]">
        <Card padded={false} className={active ? 'hidden lg:block' : ''}>{asHandler ? <Queue active={active} onPick={open} /> : tab === 'received' ? <ReceivedList active={active} onPick={open} /> : <MyComplaintsList active={active} onPick={open} />}</Card>
        <div className={active ? '' : 'hidden lg:block'}>
          {active ? <ComplaintThread key={`${tab}-${active}`} id={active} handler={asHandler} received={tab === 'received'} onBack={() => open(null)} /> : <Card><EmptyState icon={ShieldAlert} title="Choose a complaint" tone="rose">{asHandler ? 'Open one from the list to read it, answer, or resolve it.' : 'Open one to read the replies.'}</EmptyState></Card>}
        </div>
      </div>
      <NewComplaintModal open={raising} onClose={() => setRaising(false)} onCreated={(id) => { setTab('mine'); open(id); }} />
    </div>
  );
}
