import { EyeOff, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Field, Input, Modal, Select, TextArea } from '@/components/ui';
import { AGAINST_LABEL, COMPLAINTS_KEY, complaintsService, useComplaintMeta, type AgainstKind, type PersonHit, type SendTo, type Severity } from '@/features/complaints/complaints';
import { useAction } from '@/lib/hooks/useAction';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { useAuth } from '@/features/auth/AuthProvider';

const SEVERITY_WORD: Record<Severity, string> = { low: 'Minor', normal: 'Normal', high: 'Serious', urgent: 'Urgent' };
const ORDER: Severity[] = ['low', 'normal', 'high', 'urgent'];

/** A name box that suggests matching people as soon as you type. */
function PersonSearch({ kind, value, onPick, placeholder }: { kind: AgainstKind; value: PersonHit | null; onPick: (p: PersonHit | null) => void; placeholder: string }) {
  const [text, setText] = useState('');
  const q = useDebouncedValue(text.trim(), 200);
  const hits = useQuery({ queryKey: [...COMPLAINTS_KEY, 'people', kind, q], queryFn: () => complaintsService.people(kind, q), enabled: !value && (['teacher', 'staff', 'principal', 'admin'].includes(kind) || q.length >= 2) });
  if (value) return <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-white/10"><span className="min-w-0 truncate"><strong>{value.name}</strong> <span className="text-sm text-slate-500">{value.detail}</span></span><button type="button" className="shrink-0 text-sm font-semibold text-orange-700 hover:underline" onClick={() => { onPick(null); setText(''); }}>Change</button></div>;
  return (
    <div className="relative">
      <Input value={text} autoComplete="off" onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
      {(hits.data?.length ?? 0) > 0 && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#0e1626]">
          {hits.data!.map((h, i) => <li key={i}><button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-primary-500/10" onClick={() => onPick(h)}><span className="font-semibold">{h.name}</span><span className="block text-xs text-slate-500">{h.detail}</span></button></li>)}
        </ul>
      )}
      {text.trim().length >= 2 && hits.data?.length === 0 && !hits.isLoading && <p className="mt-1 text-xs text-slate-500">No one found. You can still type their name below instead.</p>}
    </div>
  );
}

/**
 * Raise a complaint: choose who it goes to (the principal, the admin, both, or, for staff, the
 * parents of one student or of a whole class), what it is about, and whether to stay anonymous.
 */
export function NewComplaintModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const meta = useComplaintMeta().data;
  const groups = useQuery({ queryKey: [...COMPLAINTS_KEY, 'groups'], queryFn: complaintsService.groups, enabled: open, staleTime: 120_000 });
  const { me } = useAuth();
  const roles = me?.scope === 'school' ? me.roles.map((r) => r.key as string) : [];
  const isPrincipal = roles.includes('principal');
  const isAdmin = roles.includes('school_admin') || roles.some((r) => r.startsWith('delegate_'));
  // Options depend on who is writing: nobody writes to themselves, and only some roles may write to parents or teachers.
  const canParents = (groups.data?.length ?? 0) > 0;
  const options: { group: string; value: SendTo; label: string; note: string }[] = [
    ...(!isPrincipal && !isAdmin ? [{ group: 'School management', value: 'management' as SendTo, label: 'Principal and admin', note: 'The school’s management. Recommended.' }] : []),
    ...(!isPrincipal ? [{ group: 'School management', value: 'principal' as SendTo, label: 'Principal only', note: 'Only the principal sees it.' }] : []),
    ...(!isAdmin ? [{ group: 'School management', value: 'admin' as SendTo, label: 'Admin only', note: 'Only the school admin sees it.' }] : []),
    ...(canParents ? [{ group: 'Parents', value: 'student_parents' as SendTo, label: 'Parents of one student', note: 'Write to the parents of a particular child.' }, { group: 'Parents', value: 'class_parents' as SendTo, label: 'Parents of a class or section', note: 'Write to every parent in a class or section.' }] : []),
    ...(isPrincipal || isAdmin ? [{ group: 'Teachers', value: 'teacher' as SendTo, label: 'A teacher', note: 'For example about lateness, or a complaint received about them. They can reply.' }] : []),
  ];
  const [sendTo, setSendTo] = useState<SendTo>('management');
  const [teacher, setTeacher] = useState<PersonHit | null>(null);
  const first = options[0]?.value ?? 'management';
  const [student, setStudent] = useState<PersonHit | null>(null);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [against, setAgainst] = useState<AgainstKind>('school');
  const [person, setPerson] = useState<PersonHit | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open) { setSendTo(first); setTeacher(null); setStudent(null); setClassId(''); setSectionId(''); setCategory(''); setSeverity(''); setSubject(''); setBody(''); setAnonymous(false); setAgainst('school'); setPerson(null); setName(''); setError(null); } }, [open]);

  const toParents = sendTo === 'student_parents' || sendTo === 'class_parents' || sendTo === 'teacher';
  const cls = groups.data?.find((c) => c.id === classId);
  const groupsByCategory = useMemo(() => {
    const by = new Map<string, NonNullable<typeof meta>['categories']>();
    for (const c of meta?.categories ?? []) by.set(c.group, [...(by.get(c.group) ?? []), c]);
    return [...by.entries()];
  }, [meta]);
  const chosen = meta?.categories.find((c) => c.key === category);
  const eff: Severity = severity || chosen?.severity || 'normal';

  const againstKind: AgainstKind = sendTo === 'student_parents' ? 'student' : sendTo === 'class_parents' ? 'other' : sendTo === 'teacher' ? 'teacher' : against;
  const againstName = sendTo === 'student_parents' ? student?.name : sendTo === 'teacher' ? teacher?.name : sendTo === 'class_parents' ? `${cls?.name ?? ''}${sectionId ? ` ${cls?.sections.find((s) => s.id === sectionId)?.name ?? ''}` : ''}`.trim() : (person?.name ?? name.trim()) || undefined;
  const target = sendTo === 'teacher' ? !!teacher : sendTo === 'student_parents' ? !!student : sendTo === 'class_parents' ? !!classId && (!!sectionId || !!cls?.wholeClass) : true;
  const ok = category && subject.trim().length >= 4 && body.trim().length >= 10 && target && (againstKind !== 'other' || !!againstName);

  const create = useAction(() => complaintsService.create({
    category, severity: severity || undefined, subject: subject.trim(), body: body.trim(), anonymous: toParents ? false : anonymous, againstKind, againstName: againstName || undefined,
    againstUserId: !toParents ? person?.userId ?? undefined : sendTo === 'teacher' ? teacher?.userId ?? undefined : undefined, teacherUserId: sendTo === 'teacher' ? teacher?.userId ?? undefined : undefined, sendTo, studentId: student?.id, classId: sendTo === 'class_parents' && !sectionId ? classId : undefined, sectionId: sectionId || undefined,
  }), { success: (r) => `Sent (${r.ticketNo})`, invalidate: [COMPLAINTS_KEY], onDone: (r) => { onClose(); onCreated(r.id); }, toastErrors: false });

  return (
    <Modal open={open} size="lg" title="Raise a complaint" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="complaint-form" icon={ShieldAlert} loading={create.isPending} disabled={!ok}>Send</Button></>}>
      <form id="complaint-form" className="space-y-5" onSubmit={onSubmit(() => { setError(null); create.mutate(undefined, { onError: (e) => setError(errorMessage(e, 'It could not be sent.')) }); })}>
        {error && <Alert>{error}</Alert>}

        <section className="space-y-2" data-tour="complaint-sendto">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">1. Send to</h3>
          <Select aria-label="Send to" value={sendTo} onChange={(e) => setSendTo(e.target.value as SendTo)}>
            {[...new Set(options.map((o) => o.group))].map((g) => <optgroup key={g} label={g}>{options.filter((o) => o.group === g).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>)}
          </Select>
          <p className="text-sm text-slate-500">{options.find((o) => o.value === sendTo)?.note}</p>
          {sendTo === 'teacher' && <Field label="Teacher" required><PersonSearch kind="teacher" value={teacher} onPick={setTeacher} placeholder="Type the teacher’s name…" /></Field>}
          {sendTo === 'student_parents' && <Field label="Student" required><PersonSearch kind="student" value={student} onPick={setStudent} placeholder="Type the student’s name…" /></Field>}
          {sendTo === 'class_parents' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Class" required><Select value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}><option value="">Choose a class…</option>{groups.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
              <Field label="Section" required={!cls?.wholeClass}><Select value={sectionId} disabled={!cls} onChange={(e) => setSectionId(e.target.value)}>{cls?.wholeClass ? <option value="">Whole class (all sections)</option> : <option value="">Choose a section…</option>}{cls?.sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            </div>
          )}
          {toParents && <Alert tone="info">{sendTo === 'teacher' ? 'The teacher receives this and can reply. The principal and admin can also read it.' : 'Parents with a login receive this and can reply. The principal and admin can also read it. Only parents of children currently studying here are included.'}</Alert>}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">2. What is it about?</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Topic" required>
              <Select required value={category} onChange={(e) => { setCategory(e.target.value); setSeverity(''); }}>
                <option value="">Choose a topic…</option>
                {groupsByCategory.map(([g, list]) => <optgroup key={g} label={g}>{list.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</optgroup>)}
              </Select>
            </Field>
            <Field label="How serious?" hint={chosen ? `At least “${SEVERITY_WORD[chosen.severity]}” for this topic` : undefined}>
              <Select value={eff} onChange={(e) => setSeverity(e.target.value as Severity)}>
                {ORDER.map((s) => <option key={s} value={s} disabled={!!chosen && ORDER.indexOf(s) < ORDER.indexOf(chosen.severity)}>{SEVERITY_WORD[s]}</option>)}
              </Select>
            </Field>
          </div>
          {!toParents && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Who is it about?" required>
                <Select value={against} onChange={(e) => { setAgainst(e.target.value as AgainstKind); setPerson(null); setName(''); }}>
                  {(meta?.againstKinds ?? (['school'] as AgainstKind[])).map((k) => <option key={k} value={k}>{AGAINST_LABEL[k]}</option>)}
                </Select>
              </Field>
              {!['school', 'principal', 'admin'].includes(against) && (
                <Field label={against === 'other' ? 'Say who or what' : 'Their name'} required={against === 'other'}>
                  {against === 'other' ? <Input value={name} maxLength={150} onChange={(e) => setName(e.target.value)} /> : <PersonSearch kind={against} value={person} onPick={setPerson} placeholder="Type to search…" />}
                </Field>
              )}
            </div>
          )}
          <Field label="Short title" required><Input required minLength={4} maxLength={150} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Uncomfortable behaviour in the lab" /></Field>
          <Field label="Details" hint="What, when and where. The clearer it is, the faster it can be handled." required><TextArea required minLength={10} maxLength={5000} rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        </section>

        {!toParents && (
          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${anonymous ? 'border-primary-500 bg-primary-500/10' : 'border-slate-300 dark:border-white/10'}`}>
            <input type="checkbox" className="mt-1 h-4 w-4" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            <span className="text-sm text-slate-700 dark:text-slate-200"><strong className="inline-flex items-center gap-1.5"><EyeOff size={15} /> Send anonymously</strong><span className="mt-0.5 block">The school sees only what kind of person wrote this, never your name. You can still read the replies here.</span></span>
          </label>
        )}
        {(eff === 'urgent' || eff === 'high') && <Alert tone="info">This is treated as <strong>{SEVERITY_WORD[eff].toLowerCase()}</strong>: the people it goes to are told at once.</Alert>}
      </form>
    </Modal>
  );
}
