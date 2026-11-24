import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Alert, Badge, Button, Field, Input, Modal, Select } from '@/components/ui';
import { useAcademicsAction, useClasses } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { QuickSetupResult } from '@/features/academics/types/academics.types';
import { classPlan, COMMON_SUBJECTS, parseList, PRE_CLASSES, roomNamesFor, sectionNamesFor, SPECIAL_ROOMS, type SectionStyle } from '@/features/academics/utils/quickSetup';
import { useActiveCampuses } from '@/features/campuses/hooks/useCampuses';

const STEPS = ['Classes', 'Sections', 'Subjects', 'Rooms', 'Review'] as const;
const DEFAULT_SUBJECTS = ['English', 'Urdu', 'Mathematics', 'Science', 'Islamiat', 'Social Studies', 'Computer'];

const num = (v: string, min: number, max: number) => Math.max(min, Math.min(max, Math.floor(Number(v) || 0)));
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** A pick-many chip: "tap to add". */
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition ${on ? 'bg-primary-500/15 text-primary-700 ring-primary-500/40 dark:text-primary-300' : 'text-slate-600 ring-slate-300 hover:bg-slate-500/5 dark:text-slate-300 dark:ring-white/10'}`}
    >
      {on && <Check size={13} strokeWidth={3} />}
      {children}
    </button>
  );
}

const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/**
 * Quick setup for a new school: answer "how many?" once and every class, section, subject and room is
 * added together. Anything that already exists is skipped, so it is safe to run again.
 */
export function QuickSetupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const campuses = useActiveCampuses(open);
  const existing = useClasses(open);
  const existingCount = existing.data?.length ?? 0;
  const maxLevel = existing.data?.reduce((m, c) => Math.max(m, c.level), 0) ?? 0;

  const [step, setStep] = useState(0);
  // Classes
  const [prefix, setPrefix] = useState('Grade');
  const [from, setFrom] = useState('1');
  const [count, setCount] = useState('10');
  const [pre, setPre] = useState<string[]>([]);
  // Sections
  const [secStyle, setSecStyle] = useState<SectionStyle>('letters');
  const [secCount, setSecCount] = useState('2');
  const [secCustom, setSecCustom] = useState('');
  const [secCapacity, setSecCapacity] = useState('');
  const [campusPick, setCampusPick] = useState<string[] | null>(null); // null = all
  const [includeExisting, setIncludeExisting] = useState(false);
  // Subjects
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [customSubjects, setCustomSubjects] = useState('');
  const [link, setLink] = useState(true);
  // Rooms
  const [roomPrefix, setRoomPrefix] = useState('Room');
  const [roomFrom, setRoomFrom] = useState('1');
  const [roomCount, setRoomCount] = useState('10');
  const [specials, setSpecials] = useState<string[]>([]);
  const [roomCapacity, setRoomCapacity] = useState('');
  const [result, setResult] = useState<QuickSetupResult | null>(null);

  const activeCampuses = campuses.data ?? [];
  const campusIds = campusPick ?? activeCampuses.map((c) => c.id);
  const manyCampuses = activeCampuses.length > 1;

  const plan = useMemo(() => classPlan({ prefix, from: num(from, 0, 999), count: num(count, 0, 60), pre, firstLevel: maxLevel + 1 }), [prefix, from, count, pre, maxLevel]);
  const sectionNames = useMemo(() => sectionNamesFor(secStyle, num(secCount, 0, 26), secCustom), [secStyle, secCount, secCustom]);
  const subjectList = useMemo(() => [...new Set([...subjects, ...parseList(customSubjects)].map((s) => s.trim()).filter(Boolean))], [subjects, customSubjects]);
  const roomNames = useMemo(() => roomNamesFor(roomPrefix, num(roomFrom, 0, 999), num(roomCount, 0, 300), specials), [roomPrefix, roomFrom, roomCount, specials]);

  const classTargets = plan.length + (includeExisting ? existingCount : 0);
  const totals = {
    classes: plan.length,
    sections: sectionNames.length ? classTargets * sectionNames.length * campusIds.length : 0,
    subjects: subjectList.length,
    links: link ? classTargets * subjectList.length : 0,
    rooms: roomNames.length * campusIds.length,
  };
  const nothing = !totals.classes && !totals.sections && !totals.subjects && !totals.rooms;

  const reset = () => { setStep(0); setResult(null); };
  const close = () => { onClose(); reset(); };
  const save = useAcademicsAction(
    () =>
      academicsService.quickSetup({
        classes: plan,
        ...(sectionNames.length && { sectionNames, sectionCapacity: secCapacity ? num(secCapacity, 1, 1000) : undefined }),
        subjects: subjectList.map((name) => ({ name })),
        linkSubjects: link,
        roomNames,
        roomCapacity: roomCapacity ? num(roomCapacity, 1, 5000) : undefined,
        campusIds,
        includeExistingClasses: includeExisting,
      }),
    '',
  );
  const run = () => save.mutate(undefined, { onSuccess: (r) => setResult(r as QuickSetupResult) });

  const noCampus = (totals.sections > 0 || roomNames.length > 0) && campusIds.length === 0;

  const campusPicker = manyCampuses && (
    <div className="rounded-xl bg-slate-500/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Campuses (same setup at each)</span>
        <button type="button" className="text-xs font-semibold text-primary-600 hover:underline" onClick={() => setCampusPick(campusIds.length === activeCampuses.length ? [] : null)}>
          {campusIds.length === activeCampuses.length ? 'Clear all' : 'Select all'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeCampuses.map((c) => <Chip key={c.id} on={campusIds.includes(c.id)} onClick={() => setCampusPick(campusIds.includes(c.id) ? campusIds.filter((x) => x !== c.id) : [...campusIds, c.id])}>{c.name}</Chip>)}
      </div>
    </div>
  );

  const created = result && result.classes.created + result.sections.created + result.subjects.created + result.links.created + result.rooms.created;

  return (
    <Modal
      open={open}
      size="lg"
      title="Quick setup"
      onClose={close}
      footer={
        result ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" icon={ChevronLeft} disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Next<ChevronRight size={16} /></Button>
            ) : (
              <Button icon={Sparkles} loading={save.isPending} disabled={nothing || noCampus} onClick={run}>Create everything</Button>
            )}
          </>
        )
      }
    >
      {result ? (
        <div className="space-y-3">
          <Alert tone="success">{created ? 'Done! Your academic structure is ready.' : 'Everything you chose already existed, so nothing new was added.'}</Alert>
          <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
            {([['Classes', result.classes], ['Sections', result.sections], ['Subjects', result.subjects], ['Subjects taught in classes', result.links], ['Rooms', result.rooms]] as const).map(([label, t]) => (
              <li key={label} className="flex items-center justify-between rounded-lg bg-slate-500/5 px-3 py-2">
                <span>{label}</span>
                <span><b>{t.created}</b> added{t.skipped > 0 && <span className="text-slate-400"> · {t.skipped} already there</span>}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">You can still change anything one by one in the tabs. Running Quick setup again never changes or deletes what you already have.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button type="button" onClick={() => setStep(i)} className={`rounded-full px-3 py-1 ${i === step ? 'bg-primary-600 text-white' : i < step ? 'bg-primary-500/15 text-primary-700 dark:text-primary-300' : 'bg-slate-500/10 text-slate-500'}`}>{i + 1}. {s}</button>
              </li>
            ))}
          </ol>

          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">How many classes does your school have? Tell us once and we add them all.</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Name"><Input maxLength={40} value={prefix} onChange={(e) => setPrefix(e.target.value)} /></Field>
                <Field label="Starting at"><Input type="number" min={0} max={999} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
                <Field label="How many?"><Input type="number" min={0} max={60} value={count} onChange={(e) => setCount(e.target.value)} /></Field>
              </div>
              <div>
                <div className="mb-1.5 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Classes before Grade 1 (optional)</div>
                <div className="flex flex-wrap gap-2">{PRE_CLASSES.map((p) => <Chip key={p} on={pre.includes(p)} onClick={() => setPre(toggleIn(pre, p))}>{p}</Chip>)}</div>
              </div>
              <div className="rounded-xl bg-slate-500/5 p-3 text-sm">
                <div className="mb-1.5 font-semibold text-slate-600 dark:text-slate-300">You will get {plural(plan.length, 'class', 'classes')}:</div>
                <div className="flex flex-wrap gap-1.5">{plan.slice(0, 24).map((c) => <Badge key={c.name} tone="magenta">{c.name}</Badge>)}{plan.length > 24 && <span className="text-slate-400">+{plan.length - 24} more</span>}</div>
              </div>
              {existingCount > 0 && <p className="text-xs text-slate-500">You already have {plural(existingCount, 'class', 'classes')}. Classes with the same name are skipped.</p>}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Sections are added to every class at once (for example A and B).</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Naming">
                  <Select value={secStyle} onChange={(e) => setSecStyle(e.target.value as SectionStyle)}>
                    <option value="letters">A, B, C…</option>
                    <option value="numbers">1, 2, 3…</option>
                    <option value="custom">My own names</option>
                  </Select>
                </Field>
                {secStyle === 'custom' ? (
                  <div className="col-span-2"><Field label="Names" hint="Separate with commas, e.g. Blue, Green, Red"><Input value={secCustom} onChange={(e) => setSecCustom(e.target.value)} /></Field></div>
                ) : (
                  <Field label="Sections per class" hint="0 = skip"><Input type="number" min={0} max={26} value={secCount} onChange={(e) => setSecCount(e.target.value)} /></Field>
                )}
                {secStyle !== 'custom' && <Field label="Seats per section" hint="Optional"><Input type="number" min={1} max={1000} value={secCapacity} onChange={(e) => setSecCapacity(e.target.value)} /></Field>}
              </div>
              {secStyle === 'custom' && <div className="w-40"><Field label="Seats per section" hint="Optional"><Input type="number" min={1} max={1000} value={secCapacity} onChange={(e) => setSecCapacity(e.target.value)} /></Field></div>}
              {campusPicker}
              {existingCount > 0 && (
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={includeExisting} onChange={(e) => setIncludeExisting(e.target.checked)} />
                  Also add these to my {plural(existingCount, 'existing class', 'existing classes')}
                </label>
              )}
              <p className="text-sm text-slate-500">{sectionNames.length ? <>Each class gets <b>{sectionNames.join(', ')}</b>{manyCampuses && <> at {plural(campusIds.length, 'campus', 'campuses')}</>}.</> : 'No sections will be added.'}</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Tap the subjects your school teaches.</p>
                <button type="button" className="text-xs font-semibold text-primary-600 hover:underline" onClick={() => setSubjects(subjects.length === COMMON_SUBJECTS.length ? [] : COMMON_SUBJECTS)}>
                  {subjects.length === COMMON_SUBJECTS.length ? 'Clear all' : 'Select all'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">{COMMON_SUBJECTS.map((s) => <Chip key={s} on={subjects.includes(s)} onClick={() => setSubjects(toggleIn(subjects, s))}>{s}</Chip>)}</div>
              <Field label="Other subjects (optional)" hint="Separate with commas"><Input value={customSubjects} onChange={(e) => setCustomSubjects(e.target.value)} placeholder="e.g. Home Economics, Typing" /></Field>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={link} onChange={(e) => setLink(e.target.checked)} />
                Teach all these subjects in every class (you can remove some later, or use “Copy setup” on a class)
              </label>
              <p className="text-sm text-slate-500">{plural(subjectList.length, 'subject')} selected. Subject codes are made for you.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Rooms are used when building the timetable.</p>
              <div className="grid grid-cols-4 gap-3">
                <Field label="Name"><Input maxLength={40} value={roomPrefix} onChange={(e) => setRoomPrefix(e.target.value)} /></Field>
                <Field label="Starting at"><Input type="number" min={0} max={999} value={roomFrom} onChange={(e) => setRoomFrom(e.target.value)} /></Field>
                <Field label="How many?" hint="0 = skip"><Input type="number" min={0} max={300} value={roomCount} onChange={(e) => setRoomCount(e.target.value)} /></Field>
                <Field label="Seats" hint="Optional"><Input type="number" min={1} max={5000} value={roomCapacity} onChange={(e) => setRoomCapacity(e.target.value)} /></Field>
              </div>
              <div>
                <div className="mb-1.5 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Special rooms</div>
                <div className="flex flex-wrap gap-2">{SPECIAL_ROOMS.map((r) => <Chip key={r} on={specials.includes(r)} onClick={() => setSpecials(toggleIn(specials, r))}>{r}</Chip>)}</div>
              </div>
              {campusPicker}
              <p className="text-sm text-slate-500">{roomNames.length ? <>{plural(roomNames.length * campusIds.length, 'room')} will be added ({roomNames.slice(0, 3).join(', ')}{roomNames.length > 3 ? '…' : ''}).</> : 'No rooms will be added.'}</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Check this, then create. Anything that already exists is skipped; nothing is changed or deleted.</p>
              <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                {[['Classes', totals.classes], ['Sections', totals.sections], ['Subjects', totals.subjects], ['Subjects taught in classes', totals.links], ['Rooms', totals.rooms]].map(([label, n]) => (
                  <li key={label} className="flex items-center justify-between rounded-lg bg-slate-500/5 px-3 py-2"><span>{label}</span><b>{n}</b></li>
                ))}
              </ul>
              {nothing && <Alert tone="info">Nothing is selected yet. Go back and choose what to add.</Alert>}
              {noCampus && <Alert>Choose at least one campus for the sections and rooms.</Alert>}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
