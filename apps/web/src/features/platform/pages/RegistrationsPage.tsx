import { BadgeCheck, CheckCircle2, ChevronDown, ChevronUp, ClipboardCheck, Eye, Plus, Save, Settings2, ShieldX, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, EmptyState, Field, IconButton, Input, Modal, PageHeader, Pagination, SearchInput, Select, Spinner, StatCard, TextArea } from '@/components/ui';
import { FormDesigner } from '@/features/forms/components/FormDesigner';
import type { CustomForm } from '@/features/forms/forms';
import { registrationAdminService } from '@/features/platform/services/registrationAdminService';
import type { Application, Band, Policy } from '@/features/platform/types/registration.types';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { useAction } from '@/lib/hooks/useAction';
import { formatDate } from '@/lib/format';
import { errorMessage } from '@/lib/errors';

type Tab = 'applications' | 'rules';
const FORM_KEY = ['owner-registration-form'] as const;
const APPS_KEY = ['owner-applications'] as const;

const ITEMS: { key: 'cnic' | 'ntn' | 'school' | 'contact'; label: string; hint: string; required: boolean }[] = [
  { key: 'cnic', label: 'CNIC verified', hint: 'Checked on NADRA’s portal: the number exists and the name matches the owner.', required: true },
  { key: 'ntn', label: 'NTN verified', hint: 'Checked on FBR’s portal: the NTN is active and belongs to this school or its owner.', required: true },
  { key: 'school', label: 'School verified', hint: 'The school exists at this address and its registration is valid (education department, website, a visit or a call).', required: true },
  { key: 'contact', label: 'Owner contacted', hint: 'Optional: you called or emailed the owner to confirm.', required: false },
];

/** One application: everything the applicant gave, the team's checklist, and the decision. */
function ApplicationCard({ a }: { a: Application }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(a.status === 'pending');
  const [nic, setNic] = useState<string | null>(null);
  const [items, setItems] = useState({ cnic: a.verification?.items.cnic ?? false, ntn: a.verification?.items.ntn ?? false, school: a.verification?.items.school ?? false, contact: a.verification?.items.contact ?? false });
  const [note, setNote] = useState(a.verification?.note ?? '');
  const [days, setDays] = useState(String(a.suggestedTrialDays));
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pending = a.status === 'pending';
  const ready = items.cnic && items.ntn && items.school;
  const refresh = () => void qc.invalidateQueries({ queryKey: APPS_KEY });
  const showNic = useAction(() => registrationAdminService.nic(a.id), { onDone: (r) => setNic(r.nic), toastErrors: false });
  const save = useAction(() => registrationAdminService.saveChecklist(a.id, { ...items, note: note.trim() || undefined }), { success: 'Checklist saved', onDone: refresh });
  const approve = useAction(async () => { await registrationAdminService.saveChecklist(a.id, { ...items, note: note.trim() || undefined }); return registrationAdminService.approve(a.id, Number(days) || undefined); }, { success: (r) => `Approved: ${r.school.name} was created. Login details were emailed.`, onDone: refresh, toastErrors: false });
  const decline = useAction(() => registrationAdminService.reject(a.id, reason.trim()), { success: 'Application declined; the applicant was told', onDone: () => { setDeclining(false); refresh(); } });

  return (
    <li className="px-5 py-4">
      <button className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900 dark:text-white">{a.schoolName}</span><Badge tone={pending ? 'amber' : a.status === 'approved' ? 'emerald' : 'slate'}>{pending ? 'Waiting for verification' : a.status === 'approved' ? 'Approved' : 'Declined'}</Badge>{a.status === 'approved' && a.trialDays && <Badge tone="primary">{a.trialDays}-day trial</Badge>}</div>
          <div className="mt-0.5 text-sm text-slate-500">{a.ownerFirstName} {a.ownerLastName} ({a.designation}) · {a.email} · {a.city}, {a.province} · {a.studentCount + a.teacherCount + a.staffCount} people · {formatDate(a.createdAt)}</div>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="mt-4 space-y-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            {([['NTN', a.ntn], ['Registration no.', a.registrationNo ?? '—'], ['Type', a.schoolType ?? '—'], ['Phone', `${a.phone}${a.phoneMethod ? ' (verified)' : ''}`], ['Email', `${a.email} (${a.emailMethod === 'google' ? 'Google' : 'code'})`], ['Address', `${a.address}, ${a.city}, ${a.province}`], ['Size', `${a.studentCount} students · ${a.teacherCount} teachers · ${a.staffCount} staff`]] as const).map(([k, v]) => <div key={k}><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{k}</dt><dd className="font-semibold text-slate-800 dark:text-slate-100">{v}</dd></div>)}
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">CNIC</dt><dd className="flex flex-wrap items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">{nic ?? `•••••-•••••${a.ownerNicLast4}`}{pending && !nic && <Button variant="secondary" icon={Eye} loading={showNic.isPending} onClick={() => showNic.mutate(undefined, { onError: (e) => setError(errorMessage(e)) })}>Show to verify</Button>}{nic && <Button variant="ghost" onClick={() => void navigator.clipboard.writeText(nic)}>Copy</Button>}</dd></div>
          </dl>
          {a.answers && Object.keys(a.answers).length > 0 && <dl className="grid gap-2 rounded-lg bg-slate-500/5 p-3 text-sm sm:grid-cols-2">{Object.entries(a.answers).map(([k, v]) => <div key={k}><dt className="inline font-semibold text-slate-500">{k}: </dt><dd className="inline">{Array.isArray(v) ? v.join(', ') : String(v)}</dd></div>)}</dl>}
          {error && <Alert>{error}</Alert>}

          {pending ? (
            <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Verification checklist</h3>
              <ul className="space-y-2">
                {ITEMS.map((it) => (
                  <li key={it.key}><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4 accent-orange-500" checked={items[it.key]} onChange={(e) => setItems({ ...items, [it.key]: e.target.checked })} /><span><span className="font-semibold text-slate-900 dark:text-white">{it.label}{it.required ? <span className="text-rose-600"> *</span> : ''}</span><span className="block text-sm text-slate-500">{it.hint}</span></span></label></li>
                ))}
              </ul>
              <Field label="Team notes (private)"><TextArea rows={2} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
              {a.verification && <p className="text-xs text-slate-400">Last saved {formatDate(a.verification.at)}</p>}
              <div className="flex flex-wrap items-end gap-3">
                <Button variant="secondary" icon={Save} loading={save.isPending} onClick={() => save.mutate(undefined)}>Save checklist</Button>
                <div className="w-36"><Field label="Free trial (days)" hint={`Suggested for this size: ${a.suggestedTrialDays}`}><Input type="number" min={1} max={365} value={days} onChange={(e) => setDays(e.target.value)} /></Field></div>
                <Button icon={CheckCircle2} disabled={!ready} loading={approve.isPending} title={ready ? undefined : 'Tick CNIC, NTN and school verified first'} onClick={() => { setError(null); approve.mutate(undefined, { onError: (e) => setError(errorMessage(e)) }); }}>Approve &amp; create the school</Button>
                <Button variant="danger" icon={XCircle} onClick={() => setDeclining(true)}>Decline</Button>
              </div>
              <p className="text-xs text-slate-500">Approving creates the school and its admin, and emails the owner the User ID and password. The CNIC is then erased from the record; only its last 4 digits and a fingerprint stay.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-white/10">
              <p>{a.status === 'approved' ? 'Approved' : 'Declined'} {a.decidedAt ? formatDate(a.decidedAt) : ''}{a.decidedBy ? ' by the owner team' : ''}.{a.decisionNote ? ` Reason: ${a.decisionNote}` : ''}</p>
              {a.verification && <p className="mt-1 text-slate-500">Checked: {ITEMS.filter((i) => a.verification!.items[i.key]).map((i) => i.label).join(', ') || 'nothing ticked'}{a.verification.note ? ` · ${a.verification.note}` : ''}</p>}
              {a.schoolId && <a href={`/console/schools/${a.schoolId}`} className="mt-2 inline-block font-semibold text-primary-700 hover:underline dark:text-primary-300">Open the school →</a>}
            </div>
          )}
        </div>
      )}
      <Modal open={declining} title={`Decline ${a.schoolName}`} onClose={() => setDeclining(false)} footer={<><Button variant="secondary" onClick={() => setDeclining(false)}>Cancel</Button><Button variant="danger" loading={decline.isPending} disabled={!reason.trim()} onClick={() => decline.mutate(undefined)}>Decline and email the applicant</Button></>}>
        <Field label="Reason (sent to the applicant)" hint="Say what could not be verified so they can apply again with the right details." required><TextArea rows={4} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Modal>
    </li>
  );
}

function Applications() {
  const [status, setStatus] = useState('pending');
  const [text, setText] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebouncedValue(text.trim(), 300);
  const list = useQuery({ queryKey: [...APPS_KEY, status, q, page], queryFn: () => registrationAdminService.applications({ status, q, page }), refetchInterval: 60_000 });
  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Waiting for verification" value={list.data?.pending ?? '–'} icon={ClipboardCheck} tone="amber" hint="Check them, then approve or decline" />
        <StatCard label="Approved: schools created" value={list.data?.approved ?? '–'} icon={BadgeCheck} tone="emerald" />
        <StatCard label="Declined" value={list.data?.rejected ?? '–'} icon={ShieldX} tone="slate" />
      </div>
      <Card title="Applications" icon={ClipboardCheck} tone="teal" padded={false} actions={
        <div className="flex flex-wrap gap-2"><SearchInput label="Search applications" value={text} onChange={(v) => { setText(v); setPage(1); }} placeholder="School, email, NTN, city…" /><Select aria-label="Show" className="w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="pending">Waiting</option><option value="approved">Approved</option><option value="rejected">Declined</option><option value="">All</option></Select></div>
      }>
        {list.isLoading && <div className="p-5"><Spinner /></div>}
        {list.data?.items.length === 0 && <EmptyState icon={ClipboardCheck} title={status === 'pending' ? 'No applications waiting' : 'Nothing here'} tone="teal">New schools apply from the website. Each application appears here to be verified.</EmptyState>}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">{list.data?.items.map((a) => <ApplicationCard key={a.id} a={a} />)}</ul>
        {list.data && <Pagination page={page} pageSize={list.data.pageSize} total={list.data.total} onChange={setPage} />}
      </Card>
    </>
  );
}

function Rules() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: FORM_KEY, queryFn: registrationAdminService.form });
  const [form, setForm] = useState<CustomForm | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (q.data) { setForm(q.data.form); setPolicy(q.data.policy); } }, [q.data]);
  const save = useAction(() => registrationAdminService.saveForm({ intro: form!.intro, fields: form!.fields.filter((f) => f.label.trim()).map((f) => ({ ...f, options: f.options.map((o) => o.trim()).filter(Boolean) })) }, policy!), { success: 'Registration rules saved', onDone: (r) => { void qc.setQueryData(FORM_KEY, r); }, toastErrors: false });
  if (!form || !policy) return <Spinner />;
  const setBand = (i: number, p: Partial<Band>) => setPolicy({ ...policy, trialBands: policy.trialBands.map((b, j) => (j === i ? { ...b, ...p } : b)) });
  return (
    <div className="space-y-5">
      {error && <Alert>{error}</Alert>}
      <Card title="Free trial by school size" icon={Settings2} tone="amber" actions={<Button icon={Save} loading={save.isPending} onClick={() => { setError(null); save.mutate(undefined, { onError: (e) => setError(errorMessage(e)) }); }}>Save all</Button>}>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">The trial a school earns depends on its number of people (students + teachers + staff). The last band has no upper limit.</p>
        <div className="space-y-2">
          {policy.trialBands.map((b, i) => (
            <div key={i} className="grid items-end gap-3 sm:grid-cols-[1fr_9rem_9rem_auto]">
              <Field label={i === 0 ? 'Label' : ''}><Input value={b.label} maxLength={80} onChange={(e) => setBand(i, { label: e.target.value })} /></Field>
              <Field label={i === 0 ? 'Up to (people)' : ''}><Input type="number" min={1} disabled={b.upTo === null} value={b.upTo ?? ''} placeholder="no limit" onChange={(e) => setBand(i, { upTo: Number(e.target.value) || 1 })} /></Field>
              <Field label={i === 0 ? 'Trial days' : ''}><Input type="number" min={1} max={365} value={b.days} onChange={(e) => setBand(i, { days: Number(e.target.value) || 1 })} /></Field>
              <IconButton icon={Trash2} label="Remove band" disabled={policy.trialBands.length < 2} onClick={() => setPolicy({ ...policy, trialBands: policy.trialBands.filter((_, j) => j !== i) })} />
            </div>
          ))}
        </div>
        <Button className="mt-3" variant="secondary" icon={Plus} onClick={() => setPolicy({ ...policy, trialBands: [...policy.trialBands.slice(0, -1), { upTo: (policy.trialBands.at(-2)?.upTo ?? 100) * 2, days: 30, label: 'New band' }, policy.trialBands.at(-1)!] })}>Add a band</Button>
      </Card>
      <Card title="Checks" icon={ShieldX} tone="rose">
        {!q.data?.phoneChannelReady && <div className="mb-4"><Alert tone="info">WhatsApp / SMS is <strong>not connected</strong> on this server, so a code cannot reach a real phone. Until it is connected (WHATSAPP_DRIVER=cloud or SMS_DRIVER=twilio), the WhatsApp check is skipped: applicants prove their email (Google or code) and your team verifies everything else by hand.</Alert></div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-base font-semibold"><input type="checkbox" className="h-4 w-4" checked={policy.requirePhoneCode} onChange={(e) => setPolicy({ ...policy, requirePhoneCode: e.target.checked })} /> Require the WhatsApp code for the owner’s mobile</label>
          <Field label="Fewest students accepted"><Input type="number" min={1} value={policy.minStudents} onChange={(e) => setPolicy({ ...policy, minStudents: Number(e.target.value) || 1 })} /></Field>
          <Field label="Most students accepted online"><Input type="number" min={10} value={policy.maxStudents} onChange={(e) => setPolicy({ ...policy, maxStudents: Number(e.target.value) || 10 })} /></Field>
          <Field label="Countries open (one per line)"><TextArea rows={2} value={policy.allowedCountries.join('\n')} onChange={(e) => setPolicy({ ...policy, allowedCountries: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} /></Field>
          <Field label="School types offered (one per line)"><TextArea rows={4} value={policy.schoolTypes.join('\n')} onChange={(e) => setPolicy({ ...policy, schoolTypes: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} /></Field>
        </div>
      </Card>
      <Card title="Extra questions on the registration form" icon={ClipboardCheck} tone="teal">
        <FormDesigner value={form} onChange={setForm} introLabel="Introduction (shown above the extra questions)" fixedNote="Always asked: email and WhatsApp proof, the owner’s name and CNIC, the school’s name, NTN, registration number, place, address and number of students and staff (your team verifies them by hand). Add anything else you want to know about a school here, for example its board, medium of instruction or number of campuses." />
      </Card>
    </div>
  );
}

/** Owner console: school applications. The team verifies each one by hand, then the owner approves it (the school is created) or declines it. */
export function RegistrationsPage() {
  const [tab, setTab] = useState<Tab>('applications');
  const tabs: { id: Tab; label: string; icon: typeof BadgeCheck }[] = [{ id: 'applications', label: 'Applications', icon: ClipboardCheck }, { id: 'rules', label: 'Form & trial rules', icon: Settings2 }];
  return (
    <div>
      <PageHeader title="School applications" sub="A school is created only after your team verifies it and you approve" icon={BadgeCheck} tone="teal" />
      <div role="tablist" className="surface mb-5 inline-flex flex-wrap gap-1 rounded-xl p-1">{tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`focus-ring inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base font-bold uppercase tracking-wide ${tab === t.id ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'}`}><t.icon size={16} /> {t.label}</button>)}</div>
      {tab === 'applications' && <Applications />}
      {tab === 'rules' && <Rules />}
    </div>
  );
}
