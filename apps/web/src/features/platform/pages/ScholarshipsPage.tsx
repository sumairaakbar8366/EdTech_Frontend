import { Award, Building2, CalendarClock, Check, ClipboardList, FileText, GraduationCap, HandCoins, HandHeart, Landmark, LayoutDashboard, Mail, Pencil, Plus, Save, Send, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { Alert, Badge, Button, Card, CompactNumber, DataTable, EmptyState, Field, IconButton, Input, Modal, PageHeader, Select, Spinner, StatCard, TextArea, type Column, type Tone } from '@/components/ui';
import { FormDesigner } from '@/features/forms/components/FormDesigner';
import type { CustomForm } from '@/features/forms/forms';
import { pkr, sponsorshipService as svc, type CandidateRow, type Grant, type Offer, type Opportunity, type Program, type ProgramInput, type ProgramStatus, type SchoolRow, type ScholarshipRequest, type Sponsor, type SponsorInput } from '@/features/sponsorship/sponsorship';
import { formatDate } from '@/lib/format';
import { useAction } from '@/lib/hooks/useAction';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

type Tab = 'overview' | 'opportunities' | 'programs' | 'requests' | 'candidates' | 'children' | 'schools' | 'form';
const K = (name: string) => ['sponsorship', name] as const;
const ALL = [['sponsorship']] as const;
const STATUS_TONE: Record<ProgramStatus, Tone> = { draft: 'slate', recruiting: 'amber', live: 'emerald', closed: 'rose' };
const STATUS_HELP: Record<ProgramStatus, string> = { draft: 'Being prepared', recruiting: 'Looking for schools and students', live: 'Awards are running', closed: 'Finished' };

function Overview() {
  const o = useQuery({ queryKey: K('overview'), queryFn: svc.overview });
  const programs = useQuery({ queryKey: K('programs'), queryFn: svc.programs });
  const d = o.data;
  if (!d) return <Spinner />;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Live scholarships" value={d.programs.live} icon={Award} tone="emerald" hint="Awards are running" />
        <StatCard label="Recruiting now" value={d.programs.recruiting} icon={HandHeart} tone="amber" hint="Looking for schools and children" />
        <StatCard label="Children receiving" value={d.children.total} icon={GraduationCap} tone="primary" hint={`${d.children.disbursed} paid out · ${d.children.pledged} pledged`} />
        <StatCard label="Schools" value={d.activeSchools} icon={Building2} tone="sky" hint="Active on the platform" />
        <StatCard label="Committed" value={Number(d.money.committed)} icon={HandCoins} tone="primary" hint="Pledged and paid, PKR" />
        <StatCard label="Paid out" value={Number(d.money.disbursed)} icon={Landmark} tone="emerald" hint="PKR" />
        <StatCard label="Offers waiting for an answer" value={d.offers.sent + d.offers.viewed} icon={Mail} tone="amber" hint={`${d.offers.submitted} answered · ${d.offers.declined} declined`} />
        <StatCard label="New opportunities" value={d.newOpportunities} icon={CalendarClock} tone="rose" hint="Events and admissions to answer" />
      </div>
      <Card title="Programs" icon={Award} tone="emerald" padded={false}>
        {programs.data?.length === 0 ? <EmptyState icon={Award} title="No programs yet" tone="emerald">Create a program under Programs & sponsors.</EmptyState> : (
          <div className="overflow-x-auto"><table className="w-full text-base"><thead><tr className="border-b border-slate-200 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5"><th className="px-5 py-3">Program</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Children</th><th className="px-5 py-3 text-right">Slots left</th><th className="px-5 py-3 text-right">Committed</th><th className="px-5 py-3 text-right">Paid</th></tr></thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">{programs.data?.map((p) => <tr key={p.id}><td className="px-5 py-2.5"><div className="font-semibold">{p.title}</div><div className="text-xs text-slate-500">{p.sponsor?.name ?? 'No sponsor'}</div></td><td className="px-5 py-2.5"><Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge></td><td className="px-5 py-2.5 text-right tabular-nums">{p.students}</td><td className="px-5 py-2.5 text-right tabular-nums">{p.slots ? p.slotsLeft : '—'}</td><td className="px-5 py-2.5 text-right tabular-nums"><CompactNumber value={p.committed} /></td><td className="px-5 py-2.5 text-right tabular-nums"><CompactNumber value={p.disbursed} /></td></tr>)}</tbody></table></div>
        )}
      </Card>
    </div>
  );
}

function OfferModal({ title, schoolId, opportunityId, onClose }: { title: string; schoolId?: string; opportunityId?: string; onClose: () => void }) {
  const programs = useQuery({ queryKey: K('programs'), queryFn: svc.programs });
  const open = (programs.data ?? []).filter((p) => p.status === 'recruiting' || p.status === 'live');
  const [programId, setProgramId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!programId && open[0]) setProgramId(open[0].id); }, [open, programId]);
  const send = useAction(() => (opportunityId ? svc.offerFromOpportunity(opportunityId, { programId, message: message.trim() || undefined }) : svc.sendOffer({ schoolId: schoolId!, programId, message: message.trim() || undefined })), { success: (r) => `Offer sent to ${r.school}: ${r.emailedTo} email(s)`, invalidate: [...ALL], onDone: onClose, toastErrors: false });
  return (
    <Modal open title={title} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon={Send} loading={send.isPending} disabled={!programId} onClick={() => { setError(null); send.mutate(undefined, { onError: (e) => setError(errorMessage(e)) }); }}>Send offer</Button></>}>
      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {open.length === 0 ? <Alert tone="info">No program is recruiting or live. Create one under Programs &amp; sponsors, set to “recruiting”.</Alert> : (
          <Field label="Scholarship program"><Select value={programId} onChange={(e) => setProgramId(e.target.value)}>{open.map((p) => <option key={p.id} value={p.id}>{p.title}{p.sponsor ? ` · ${p.sponsor.name}` : ''}</option>)}</Select></Field>
        )}
        <Field label="Personal message (optional)" hint="Shown in the email and on the school’s private page."><TextArea rows={4} maxLength={1500} value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
        <p className="text-sm text-slate-500">The school’s administrator gets an email with a private link to the request form (the one under “Request form”). The link works for 30 days.</p>
      </div>
    </Modal>
  );
}

function Opportunities() {
  const [status, setStatus] = useState('');
  const list = useQuery({ queryKey: [...K('opps'), status], queryFn: () => svc.opportunities(status || undefined) });
  const [offering, setOffering] = useState<Opportunity | null>(null);
  const dismiss = useAction((id: string) => svc.dismiss(id), { success: 'Dismissed', invalidate: [...ALL] });
  const kinds = useQuery({ queryKey: K('kinds'), queryFn: svc.eventKinds, staleTime: Infinity });
  return (
    <Card title="Events and admissions at schools" icon={CalendarClock} tone="amber" padded={false} actions={<Select aria-label="Show" className="w-44" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">New &amp; offered</option><option value="new">New only</option><option value="offered">Offered</option><option value="dismissed">Dismissed</option></Select>}>
      {list.isLoading && <div className="p-5"><Spinner /></div>}
      {list.data?.length === 0 && <EmptyState icon={CalendarClock} title="Nothing new" tone="amber">When a school opens admissions or shares an event (a science fair, sports day…), it appears here so you can offer a scholarship with one click.</EmptyState>}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {list.data?.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900 dark:text-white">{o.school.name}</span><Badge tone="primary">{kinds.data?.find((k) => k.key === o.kind)?.label ?? o.kind}</Badge><Badge tone={o.status === 'new' ? 'amber' : o.status === 'offered' ? 'emerald' : 'slate'}>{o.status}</Badge></div>
              <div className="text-sm text-slate-700 dark:text-slate-200">{o.title}{o.startsOn ? ` · ${formatDate(o.startsOn)}` : ''}</div>{o.details && <div className="text-sm text-slate-500">{o.details}</div>}</div>
            {o.status !== 'dismissed' && <Button icon={HandHeart} onClick={() => setOffering(o)} data-tour="offer-btn">Offer scholarship</Button>}
            {o.status === 'new' && <IconButton icon={X} label="Dismiss" onClick={() => dismiss.mutate(o.id)} />}
          </li>
        ))}
      </ul>
      {offering && <OfferModal title={`Offer a scholarship to ${offering.school.name}`} opportunityId={offering.id} onClose={() => setOffering(null)} />}
    </Card>
  );
}

function ProgramModal({ program, sponsors, onClose }: { program: Program | null; sponsors: Sponsor[]; onClose: () => void }) {
  const [f, setF] = useState<ProgramInput>({ title: program?.title ?? '', sponsorId: program?.sponsorId ?? '', description: program?.description ?? '', criteria: program?.criteria ?? '', awardAmount: program?.awardAmount ?? null, budget: program?.budget ?? null, slots: program?.slots ?? 0, deadline: program?.deadline?.slice(0, 10) ?? '', status: program?.status ?? 'draft', targetLevels: program?.targetLevels ?? [], period: program?.period ?? 'yearly', currentPeriod: program?.currentPeriod ?? '', continuesToUndergrad: program?.continuesToUndergrad ?? false, minAverage: program?.minAverage ?? 70, minAttendance: program?.minAttendance ?? 85, needRequired: program?.needRequired ?? true });
  const save = useAction(() => svc.saveProgram(program?.id ?? null, { ...f, sponsorId: f.sponsorId || null, deadline: f.deadline || null, currentPeriod: f.currentPeriod?.trim() || null }), { success: 'Program saved', invalidate: [...ALL], onDone: onClose });
  const num = (v: string) => (v === '' ? null : Number(v));
  return (
    <Modal open size="lg" title={program ? 'Edit program' : 'New scholarship program'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="program-form" loading={save.isPending}>Save</Button></>}>
      <form id="program-form" className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit(() => save.mutate(undefined))}>
        <div className="sm:col-span-2"><Field label="Title" required><Input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field></div>
        <Field label="Sponsor"><Select value={f.sponsorId ?? ''} onChange={(e) => setF({ ...f, sponsorId: e.target.value })}><option value="">No sponsor yet</option>{sponsors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <Field label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ProgramStatus })}>{(Object.keys(STATUS_HELP) as ProgramStatus[]).map((s) => <option key={s} value={s}>{s} · {STATUS_HELP[s]}</option>)}</Select></Field>
        <Field label="Amount per student (PKR)"><Input type="number" min={0} value={f.awardAmount ?? ''} onChange={(e) => setF({ ...f, awardAmount: num(e.target.value) })} /></Field>
        <Field label="Total budget (PKR)"><Input type="number" min={0} value={f.budget ?? ''} onChange={(e) => setF({ ...f, budget: num(e.target.value) })} /></Field>
        <Field label="Number of students it can fund"><Input type="number" min={0} value={f.slots ?? 0} onChange={(e) => setF({ ...f, slots: Number(e.target.value) || 0 })} /></Field>
        <Field label="Apply by"><Input type="date" value={f.deadline ?? ''} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></Field>
        <div className="space-y-3 rounded-xl border border-slate-200 p-4 sm:col-span-2 dark:border-white/10">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Who it is for</p>
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {[['Class 9–12', [9, 10, 11, 12]], ['Class 11–12', [11, 12]], ['Class 12 only', [12]], ['Every class', []]].map(([label, lv]) => <button key={label as string} type="button" onClick={() => setF({ ...f, targetLevels: lv as number[] })} className="focus-ring rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-primary-500/10 dark:border-white/15 dark:text-slate-200">{label as string}</button>)}
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Classes">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => { const on = (f.targetLevels ?? []).includes(n); return <button key={n} type="button" aria-pressed={on} onClick={() => setF({ ...f, targetLevels: on ? (f.targetLevels ?? []).filter((x) => x !== n) : [...(f.targetLevels ?? []), n].sort((a, b) => a - b) })} className={`focus-ring h-9 w-9 rounded-lg text-sm font-bold ring-1 ring-inset ${on ? 'bg-primary-600 text-white ring-primary-600' : 'bg-white text-slate-700 ring-slate-300 dark:bg-white/5 dark:text-slate-200 dark:ring-white/15'}`}>{n}</button>; })}
            </div>
            <p className="mt-1 text-xs text-slate-500">{(f.targetLevels ?? []).length ? `Only students in class ${(f.targetLevels ?? []).join(', ')} are shortlisted.` : 'Every class is shortlisted.'}</p>
          </div>
          <label className="flex items-center gap-2 text-base font-semibold"><input type="checkbox" className="h-4 w-4" checked={!!f.continuesToUndergrad} onChange={(e) => setF({ ...f, continuesToUndergrad: e.target.checked })} /> Class 12 students continue into undergraduate studies (the award covers university)</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="List students"><Select value={f.period} onChange={(e) => setF({ ...f, period: e.target.value as 'yearly' | 'semester' })}><option value="yearly">Every year</option><option value="semester">Every semester</option></Select></Field>
            <Field label="Current cycle" hint="e.g. 2026 or 2026 · Semester 1"><Input value={f.currentPeriod ?? ''} maxLength={60} onChange={(e) => setF({ ...f, currentPeriod: e.target.value })} /></Field>
            <Field label="Lowest exam average (%)"><Input type="number" min={0} max={100} value={f.minAverage} onChange={(e) => setF({ ...f, minAverage: Number(e.target.value) })} /></Field>
            <Field label="Lowest attendance (%)"><Input type="number" min={0} max={100} value={f.minAttendance} onChange={(e) => setF({ ...f, minAttendance: Number(e.target.value) })} /></Field>
          </div>
          <label className="flex items-center gap-2 text-base font-semibold"><input type="checkbox" className="h-4 w-4" checked={!!f.needRequired} onChange={(e) => setF({ ...f, needRequired: e.target.checked })} /> Only students with a sign of financial need (from the school’s fee records)</label>
        </div>
        <div className="sm:col-span-2"><Field label="Description (shown to schools)"><TextArea value={f.description ?? ''} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field></div>
        <div className="sm:col-span-2"><Field label="Who can receive it"><TextArea value={f.criteria ?? ''} onChange={(e) => setF({ ...f, criteria: e.target.value })} /></Field></div>
      </form>
    </Modal>
  );
}

function SponsorModal({ sponsor, onClose }: { sponsor: Sponsor | null; onClose: () => void }) {
  const [f, setF] = useState<SponsorInput>({ name: sponsor?.name ?? '', kind: sponsor?.kind ?? 'company', contactName: sponsor?.contactName ?? '', email: sponsor?.email ?? '', phone: sponsor?.phone ?? '', notes: sponsor?.notes ?? '' });
  const save = useAction(() => svc.saveSponsor(sponsor?.id ?? null, Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '')) as SponsorInput), { success: 'Sponsor saved', invalidate: [...ALL], onDone: onClose });
  return (
    <Modal open title={sponsor ? 'Edit sponsor' : 'New sponsor'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="sponsor-form" loading={save.isPending}>Save</Button></>}>
      <form id="sponsor-form" className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit(() => save.mutate(undefined))}>
        <div className="sm:col-span-2"><Field label="Name" required><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
        <Field label="Kind"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{['company', 'foundation', 'individual', 'government'].map((k) => <option key={k}>{k}</option>)}</Select></Field>
        <Field label="Contact person"><Input value={f.contactName ?? ''} onChange={(e) => setF({ ...f, contactName: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" value={f.email ?? ''} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Phone"><Input value={f.phone ?? ''} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <div className="sm:col-span-2"><Field label="Notes"><TextArea value={f.notes ?? ''} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field></div>
      </form>
    </Modal>
  );
}

function Programs() {
  const programs = useQuery({ queryKey: K('programs'), queryFn: svc.programs });
  const sponsors = useQuery({ queryKey: K('sponsors'), queryFn: svc.sponsors });
  const [prog, setProg] = useState<Program | 'new' | null>(null);
  const [spon, setSpon] = useState<Sponsor | 'new' | null>(null);
  return (
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Card title="Scholarship programs" icon={Award} tone="emerald" padded={false} actions={<Button icon={Plus} onClick={() => setProg('new')}>New program</Button>}>
        {programs.data?.length === 0 && <EmptyState icon={Award} title="No programs yet" tone="emerald">A program is one scholarship: its sponsor, the amount per student, how many students and who can receive it.</EmptyState>}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">{programs.data?.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900 dark:text-white">{p.title}</span><Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge></div><div className="text-sm text-slate-500">{p.sponsor?.name ?? 'No sponsor'} · {p.awardAmount ? `${pkr(p.awardAmount, p.currency)} each` : 'amount not set'} · {p.students}/{p.slots || '∞'} students · {p.targetLevels.length ? `class ${p.targetLevels.join(', ')}${p.continuesToUndergrad ? ' + undergrad' : ''}` : 'every class'} · {p.period === 'semester' ? 'each semester' : 'each year'}{p.currentPeriod ? ` (${p.currentPeriod})` : ''} · {p.offersSent} offers, {p.offersAnswered} answered</div></div><IconButton icon={Pencil} label="Edit program" onClick={() => setProg(p)} /></li>
        ))}</ul>
      </Card>
      <Card title="Sponsors" icon={Users} tone="primary" padded={false} actions={<Button variant="secondary" icon={Plus} onClick={() => setSpon('new')}>Add</Button>}>
        {sponsors.data?.length === 0 && <EmptyState icon={Users} title="No sponsors yet" tone="primary">Companies, foundations or individuals who fund scholarships.</EmptyState>}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">{sponsors.data?.map((s) => <li key={s.id} className="flex items-center gap-3 px-5 py-3"><div className="min-w-0 flex-1"><div className="font-semibold text-slate-900 dark:text-white">{s.name} <Badge tone="slate">{s.kind}</Badge></div><div className="text-xs text-slate-500">{[s.contactName, s.email, s.phone].filter(Boolean).join(' · ') || 'No contact details'} · {s._count.programs} program(s)</div></div><IconButton icon={Pencil} label="Edit sponsor" onClick={() => setSpon(s)} /></li>)}</ul>
      </Card>
      {prog && <ProgramModal program={prog === 'new' ? null : prog} sponsors={sponsors.data ?? []} onClose={() => setProg(null)} />}
      {spon && <SponsorModal sponsor={spon === 'new' ? null : spon} onClose={() => setSpon(null)} />}
    </div>
  );
}

function ChildrenModal({ request, onClose }: { request: ScholarshipRequest; onClose: () => void }) {
  const amount = request.program.awardAmount ?? 0;
  const [rows, setRows] = useState([{ studentName: '', className: '', amount: String(amount || '') }]);
  const [error, setError] = useState<string | null>(null);
  const save = useAction(() => svc.addGrants(request.id, rows.filter((r) => r.studentName.trim()).map((r) => ({ studentName: r.studentName.trim(), className: r.className.trim() || undefined, amount: Number(r.amount) }))), { success: (r) => `${r.added} child(ren) recorded`, invalidate: [...ALL], onDone: onClose, toastErrors: false });
  return (
    <Modal open size="lg" title={`Children receiving it · ${request.school.name}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={save.isPending} disabled={!rows.some((r) => r.studentName.trim() && Number(r.amount) >= 0)} onClick={() => { setError(null); save.mutate(undefined, { onError: (e) => setError(errorMessage(e)) }); }}>Record</Button></>}>
      <div className="space-y-3">
        {error && <Alert>{error}</Alert>}
        <p className="text-sm text-slate-500">The school asked for {request.studentsRequested} student(s). Enter the children chosen (name and class are kept as text; the school’s own records are not touched).</p>
        {rows.map((r, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_8rem_9rem_auto]">
            <Input aria-label="Child’s name" placeholder="Child’s name" value={r.studentName} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, studentName: e.target.value } : x)))} />
            <Input aria-label="Class" placeholder="Class" value={r.className} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, className: e.target.value } : x)))} />
            <Input aria-label="Amount" type="number" min={0} placeholder="Amount" value={r.amount} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} />
            <IconButton icon={X} label="Remove row" disabled={rows.length < 2} onClick={() => setRows(rows.filter((_, j) => j !== i))} />
          </div>
        ))}
        <Button variant="secondary" icon={Plus} onClick={() => setRows([...rows, { studentName: '', className: '', amount: String(amount || '') }])}>Add a child</Button>
      </div>
    </Modal>
  );
}

function Requests() {
  const offers = useQuery({ queryKey: K('offers'), queryFn: svc.offers });
  const requests = useQuery({ queryKey: K('requests'), queryFn: svc.requests });
  const decide = useAction((v: { id: string; status: 'approved' | 'rejected' }) => svc.decide(v.id, v.status), { success: 'Decision saved', invalidate: [...ALL] });
  const withdraw = useAction((id: string) => svc.withdraw(id), { success: 'Offer withdrawn', invalidate: [...ALL] });
  const [naming, setNaming] = useState<ScholarshipRequest | null>(null);
  const offerCols: Column<Offer>[] = [
    { header: 'School', cell: (o) => <div><div className="font-semibold">{o.school.name}</div><div className="text-xs text-slate-500">{o.opportunity?.title ?? 'Sent directly'}</div></div> },
    { header: 'Program', cell: (o) => o.program.title },
    { header: 'Status', cell: (o) => <Badge tone={o.status === 'submitted' ? 'emerald' : o.status === 'declined' || o.status === 'withdrawn' ? 'slate' : 'amber'}>{o.status}</Badge> },
    { header: 'Sent', cell: (o) => formatDate(o.sentAt) },
    { header: '', align: 'right', cell: (o) => (o.status === 'sent' || o.status === 'viewed') ? <Button variant="ghost" onClick={() => withdraw.mutate(o.id)}>Withdraw</Button> : null },
  ];
  return (
    <div className="space-y-5">
      <Card title="Requests from schools" icon={ClipboardList} tone="teal" padded={false}>
        {requests.data?.length === 0 && <EmptyState icon={ClipboardList} title="No requests yet" tone="teal">Schools answer an offer with a request. It appears here.</EmptyState>}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">{requests.data?.map((r) => (
          <li key={r.id} className="px-5 py-4"><div className="flex flex-wrap items-start gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900 dark:text-white">{r.school.name}</span><Badge tone={r.status === 'approved' ? 'emerald' : r.status === 'rejected' ? 'rose' : 'amber'}>{r.status}</Badge></div><div className="text-sm text-slate-500">{r.program.title} · asks for {r.studentsRequested} student(s) · {r.contactName} ({r.contactEmail}) · {formatDate(r.createdAt)}</div>
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">{Object.entries(r.answers).map(([k, v]) => <div key={k}><dt className="inline font-semibold text-slate-500">{k}: </dt><dd className="inline text-slate-800 dark:text-slate-100">{Array.isArray(v) ? v.join(', ') : String(v)}</dd></div>)}</dl>
            {r.grants.length > 0 && <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Children: {r.grants.map((g) => `${g.studentName}${g.className ? ` (${g.className})` : ''}`).join(', ')}</div>}</div>
            <div className="flex flex-wrap gap-2">{r.status === 'submitted' && <><Button icon={Check} onClick={() => decide.mutate({ id: r.id, status: 'approved' })}>Approve</Button><Button variant="danger" icon={X} onClick={() => decide.mutate({ id: r.id, status: 'rejected' })}>Decline</Button></>}{r.status === 'approved' && <Button variant="secondary" icon={GraduationCap} onClick={() => setNaming(r)}>Record children</Button>}</div></div></li>
        ))}</ul>
      </Card>
      <Card title="Offers sent" icon={Mail} tone="amber" padded={false}><DataTable columns={offerCols} rows={offers.data ?? []} rowKey={(o) => o.id} searchText={(o) => [o.school.name, o.program.title, o.status]} searchPlaceholder="Search offers…" /></Card>
      {naming && <ChildrenModal request={naming} onClose={() => setNaming(null)} />}
    </div>
  );
}

const BADGE: Record<CandidateRow['status'], Tone> = { confirmed: 'amber', selected: 'primary', rejected: 'slate', awarded: 'emerald' };

/** The students the schools confirmed for a cycle: pick who is awarded, then send the names back to each school. */
function Candidates() {
  const programs = useQuery({ queryKey: K('programs'), queryFn: svc.programs });
  const [programId, setProgramId] = useState('');
  const [period, setPeriod] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => { if (!programId && programs.data?.[0]) setProgramId(programs.data[0].id); }, [programs.data, programId]);
  const list = useQuery({ queryKey: [...K('candidates'), programId, period], queryFn: () => svc.candidates(programId, period || undefined), enabled: !!programId });
  const decide = useAction((status: 'selected' | 'rejected' | 'confirmed') => svc.decideCandidates(picked, status), { success: 'Updated', invalidate: [...ALL], onDone: () => setPicked([]) });
  const award = useAction(() => svc.awardCandidates(programId, list.data!.period), { success: (r) => `Awarded ${r.awarded} student(s); ${r.schools} school(s) were told`, invalidate: [...ALL] });
  const [error, setError] = useState<string | null>(null);
  const d = list.data;
  const bySchool = [...new Map((d?.items ?? []).map((c) => [c.school.id, c.school.name])).entries()];
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const csv = () => {
    const rows = [['School', 'Student', 'Class', 'Average %', 'Attendance %', 'Need score', 'Status', 'Cycle'], ...(d?.items ?? []).filter((c) => c.status === 'selected' || c.status === 'awarded').map((c) => [c.school.name, c.studentName, c.className, c.average.toFixed(1), c.attendance.toFixed(1), String(c.needScore), c.status, c.periodLabel])];
    const blob = new Blob([rows.map((r) => r.map((x) => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `scholarship-${d?.program.title ?? 'list'}-${d?.period ?? ''}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };
  const selectedCount = (d?.items ?? []).filter((c) => c.status === 'selected').length;
  return (
    <div className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <Card title="Students put forward by schools" icon={Users} tone="primary" actions={
        <div className="flex flex-wrap gap-2">
          <Select aria-label="Program" className="w-60" value={programId} onChange={(e) => { setProgramId(e.target.value); setPeriod(''); setPicked([]); }}>{programs.data?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</Select>
          <Select aria-label="Cycle" className="w-44" value={period || d?.period || ''} onChange={(e) => { setPeriod(e.target.value); setPicked([]); }}>{[...new Set([d?.period, ...(d?.periods ?? [])].filter(Boolean) as string[])].map((p) => <option key={p}>{p}</option>)}</Select>
        </div>
      }>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Each school lists its students from its own results, attendance and fee records, then <strong>confirms</strong> them with a note on the family’s need. Only confirmed students appear here. Select who you award, then send the names back to the schools.{d?.program.targetLevels.length ? ` This program is for class ${d.program.targetLevels.join(', ')}${d.program.continuesToUndergrad ? ', continuing into undergraduate studies' : ''}.` : ''}</p>
        {list.isLoading && <Spinner />}
        {d && d.items.length === 0 && <EmptyState icon={Users} title="No students put forward yet" tone="primary">Once an approved school confirms students for {d.period}, they appear here.</EmptyState>}
        <div className="space-y-5">
          {bySchool.map(([sid, name]) => (
            <section key={sid}>
              <h3 className="mb-2 font-bold text-slate-900 dark:text-white">{name}</h3>
              <ul className="divide-y divide-slate-200/70 rounded-xl border border-slate-200 dark:divide-white/5 dark:border-white/10">
                {d!.items.filter((c) => c.school.id === sid).map((c) => (
                  <li key={c.id} className="flex flex-wrap items-start gap-3 p-3">
                    <input type="checkbox" className="mt-1.5 h-4 w-4" aria-label={`Select ${c.studentName}`} checked={picked.includes(c.id)} disabled={c.status === 'awarded'} onChange={() => toggle(c.id)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-slate-900 dark:text-white">{c.studentName}</span><span className="text-sm text-slate-500">{c.className}</span><Badge tone={BADGE[c.status]}>{c.status}</Badge><Badge tone="slate">Average {Math.round(c.average)}%</Badge><Badge tone="slate">Attendance {Math.round(c.attendance)}%</Badge><Badge tone="amber">Need {c.needScore}</Badge></div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">“{c.needNote}”</p>
                      <p className="text-xs text-slate-400">{c.reasons.join(' · ')}</p>
                    </div>
                    <span className="font-display text-lg font-bold tabular-nums text-slate-700 dark:text-slate-200" title="Rank score">{c.rankScore}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {d && d.items.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
            <Button icon={Check} disabled={!picked.length} loading={decide.isPending} onClick={() => decide.mutate('selected')}>Select ({picked.length})</Button>
            <Button variant="secondary" icon={X} disabled={!picked.length} onClick={() => decide.mutate('rejected')}>Not this time</Button>
            <span className="mx-2 hidden h-6 w-px bg-slate-300 sm:block dark:bg-white/15" />
            <Button icon={HandCoins} disabled={!selectedCount} loading={award.isPending} onClick={() => { setError(null); award.mutate(undefined, { onError: (e) => setError(errorMessage(e)) }); }}>Award {selectedCount} selected &amp; tell the schools</Button>
            <Button variant="ghost" icon={FileText} onClick={csv}>Download the awarded list</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Children() {
  const grants = useQuery({ queryKey: K('grants'), queryFn: svc.grants });
  const set = useAction((v: { id: string; status: 'pledged' | 'disbursed' | 'cancelled' }) => svc.grantStatus(v.id, v.status), { success: 'Updated', invalidate: [...ALL] });
  const cols: Column<Grant>[] = [
    { header: 'Child', cell: (g) => <div><div className="font-semibold">{g.studentName}</div><div className="text-xs text-slate-500">{g.className ? `Class ${g.className}` : ''}</div></div> },
    { header: 'School', cell: (g) => g.school.name }, { header: 'Program', cell: (g) => g.program.title },
    { header: 'Amount', align: 'right', cell: (g) => pkr(g.amount, g.program.currency) },
    { header: 'Status', cell: (g) => <Badge tone={g.status === 'disbursed' ? 'emerald' : g.status === 'cancelled' ? 'slate' : 'amber'}>{g.status}</Badge> },
    { header: 'Awarded', cell: (g) => formatDate(g.awardedOn) },
    { header: '', align: 'right', cell: (g) => g.status === 'pledged' ? <div className="flex justify-end gap-1"><Button variant="secondary" onClick={() => set.mutate({ id: g.id, status: 'disbursed' })}>Mark paid</Button><IconButton icon={X} label="Cancel" tone="danger" onClick={() => set.mutate({ id: g.id, status: 'cancelled' })} /></div> : null },
  ];
  return <Card title="Children receiving scholarships" icon={GraduationCap} tone="emerald" padded={false}>{grants.data?.length === 0 ? <EmptyState icon={GraduationCap} title="No children yet" tone="emerald">After you approve a school’s request, record the children who receive it.</EmptyState> : <DataTable columns={cols} rows={grants.data ?? []} rowKey={(g) => g.id} searchText={(g) => [g.studentName, g.school.name, g.program.title, g.status]} searchPlaceholder="Search children, schools…" />}</Card>;
}

function Schools() {
  const schools = useQuery({ queryKey: K('schools'), queryFn: svc.schools });
  const [offering, setOffering] = useState<SchoolRow | null>(null);
  const cols: Column<SchoolRow>[] = [
    { header: 'School', cell: (s) => <div><div className="font-semibold">{s.name}</div><div className="text-xs text-slate-500">{[s.city, s.province].filter(Boolean).join(', ') || s.slug}</div></div> },
    { header: 'Students', align: 'right', cell: (s) => s.students }, { header: 'Teachers', align: 'right', cell: (s) => s.teachers }, { header: 'Staff', align: 'right', cell: (s) => s.staff },
    { header: 'Attendance', align: 'right', cell: (s) => (s.attendancePercent === null ? '—' : `${s.attendancePercent}%`) },
    { header: 'Fees (this year)', align: 'right', cell: (s) => <CompactNumber value={s.collected} /> },
    { header: 'Owed', align: 'right', cell: (s) => <CompactNumber value={s.outstanding} /> },
    { header: 'Salaries', align: 'right', cell: (s) => <CompactNumber value={s.salaries} /> },
    { header: 'Scholarship', align: 'right', cell: (s) => (s.scholarshipChildren ? `${s.scholarshipChildren} · ${pkr(s.scholarshipAmount)}` : '—') },
    { header: '', align: 'right', cell: (s) => <Button variant="secondary" icon={HandHeart} onClick={() => setOffering(s)}>Offer</Button> },
  ];
  return (
    <Card title="Schools: size, finances and scholarships" icon={Building2} tone="sky" padded={false}>
      {schools.isLoading ? <div className="p-5"><Spinner /></div> : <DataTable columns={cols} rows={schools.data ?? []} rowKey={(s) => s.id} searchText={(s) => [s.name, s.city, s.province]} searchPlaceholder="Search schools…" />}
      {offering && <OfferModal title={`Offer a scholarship to ${offering.name}`} schoolId={offering.id} onClose={() => setOffering(null)} />}
    </Card>
  );
}

function RequestForm() {
  const q = useQuery({ queryKey: K('form'), queryFn: svc.form });
  const [form, setForm] = useState<CustomForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (q.data) setForm(q.data); }, [q.data]);
  const save = useAction(() => svc.saveForm({ intro: form!.intro, fields: form!.fields.filter((f) => f.label.trim()).map((f) => ({ ...f, options: f.options.map((o) => o.trim()).filter(Boolean) })) }), { success: 'Request form saved', invalidate: [K('form')], toastErrors: false });
  if (!form) return <Spinner />;
  return (
    <Card title="Request form sent to schools" icon={FileText} tone="teal" actions={<Button icon={Save} loading={save.isPending} onClick={() => { setError(null); save.mutate(undefined, { onError: (e) => setError(errorMessage(e)) }); }}>Save form</Button>}>
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      <FormDesigner value={form} onChange={setForm} introLabel="Introduction (shown above the form)" fixedNote="Every request always asks the school’s contact name, email and how many students would benefit. Add your own questions here: they are sent with every offer from now on." />
    </Card>
  );
}

/** Owner console: sponsorship and scholarships, from the chance (an event) to the child who receives it. */
export function ScholarshipsPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab | null) ?? 'overview';
  const tabs: { id: Tab; label: string; icon: typeof Award }[] = [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'opportunities', label: 'Opportunities', icon: CalendarClock }, { id: 'programs', label: 'Programs & sponsors', icon: Award }, { id: 'requests', label: 'Offers & requests', icon: ClipboardList }, { id: 'candidates', label: 'Candidates', icon: Users }, { id: 'children', label: 'Children', icon: GraduationCap }, { id: 'schools', label: 'Schools', icon: Building2 }, { id: 'form', label: 'Request form', icon: FileText }];
  return (
    <div>
      <PageHeader title="Scholarships & sponsorship" sub="Offer support to schools, and follow it to the child" icon={HandHeart} tone="emerald" />
      <div role="tablist" className="surface mb-5 inline-flex flex-wrap gap-1 rounded-xl p-1" data-tour="scholar-tabs">{tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setParams({ tab: t.id }, { replace: true })} className={`focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-base font-bold uppercase tracking-wide ${tab === t.id ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'}`}><t.icon size={16} /> {t.label}</button>)}</div>
      {tab === 'overview' && <Overview />}
      {tab === 'opportunities' && <Opportunities />}
      {tab === 'programs' && <Programs />}
      {tab === 'requests' && <Requests />}
      {tab === 'candidates' && <Candidates />}
      {tab === 'children' && <Children />}
      {tab === 'schools' && <Schools />}
      {tab === 'form' && <RequestForm />}
    </div>
  );
}
