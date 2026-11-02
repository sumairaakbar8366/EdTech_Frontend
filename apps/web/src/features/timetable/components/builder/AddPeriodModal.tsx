import { AlertTriangle, Building2, CheckCircle2, GraduationCap, Layers, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Field, Input, Modal, Select, SearchInput, Spinner } from '@/components/ui';
import { useRooms } from '@/features/academics/hooks/useAcademics';
import type { SchoolClass } from '@/features/academics/types/academics.types';
import { useTeacherOptions, useTimetableAction } from '@/features/timetable/hooks/useTimetable';
import { timetableService, type TeacherOption } from '@/features/timetable/services/timetableService';
import type { TimetableSlot } from '@/features/timetable/types/timetable.types';
import { DAY_NAMES } from '@/lib/format';
import { onSubmit } from '@/lib/forms';

/** Free teachers first: the section's teacher, then those who teach the subject, then the rest; busy last. */
function rank(t: TeacherOption) {
  return (t.busyWith ? 100 : 0) + (t.onLeave ? 50 : 0) + (t.assigned ? 0 : t.teachesSubject ? 1 : 2) + (t.sameCampus ? 0 : 5);
}

/** Where a new period goes when the admin clicked an empty block of the week grid. */
export interface PeriodPreset {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

/**
 * Adds a weekly period for one section, or edits one (`slot`): e.g. when a teacher is absent the admin
 * clicks the period in the grid and gives it to someone free, or moves it to another room or time.
 * The admin sees who is free at that time; a teacher who is already teaching elsewhere then is refused
 * with a warning, and choosing someone other than the section's subject teacher is confirmed first.
 */
export function AddPeriodModal({ open, sectionId, cls, onClose, slot = null, preset = null }: { open: boolean; sectionId: string; cls: SchoolClass; onClose: () => void; slot?: TimetableSlot | null; preset?: PeriodPreset | null }) {
  const rooms = useRooms(open);
  const section = cls.sections.find((s) => s.id === sectionId);
  const [f, setF] = useState({ dayOfWeek: '1', startTime: '08:00', endTime: '08:40', subjectId: '', roomId: '', employeeId: '' });
  const [search, setSearch] = useState('');
  const [clash, setClash] = useState<TeacherOption | null>(null);
  const [confirmOther, setConfirmOther] = useState(false);

  useEffect(() => {
    if (open) {
      setF(
        slot
          ? { dayOfWeek: String(slot.dayOfWeek), startTime: slot.startTime, endTime: slot.endTime, subjectId: slot.subjectId, roomId: slot.roomId ?? '', employeeId: slot.employeeId }
          : { dayOfWeek: String(preset?.dayOfWeek ?? 1), startTime: preset?.startTime ?? '08:00', endTime: preset?.endTime ?? '08:40', subjectId: '', roomId: '', employeeId: '' },
      );
      setSearch('');
    }
  }, [open, slot, preset]);

  const timeOk = f.startTime < f.endTime;
  const query = { sectionId, subjectId: f.subjectId, dayOfWeek: Number(f.dayOfWeek), startTime: f.startTime, endTime: f.endTime, ...(slot && { excludeSlotId: slot.id }) };
  const options = useTeacherOptions(query, open && !!f.subjectId && timeOk);
  const data = options.data;
  const teachers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...(data?.teachers ?? [])].filter((t) => !q || t.name.toLowerCase().includes(q) || t.employeeNo.toLowerCase().includes(q)).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  }, [data, search]);
  const picked = data?.teachers.find((t) => t.id === f.employeeId) ?? null;
  const assigned = data?.teachers.find((t) => t.assigned) ?? null;

  // Pre-select the section's subject teacher when free; drop a choice that became busy after a time change.
  useEffect(() => {
    if (!data) return;
    const current = data.teachers.find((t) => t.id === f.employeeId);
    if (current && !current.busyWith) return;
    const free = data.teachers.find((t) => t.assigned && !t.busyWith);
    setF((s) => ({ ...s, employeeId: free?.id ?? '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const save = useTimetableAction(
    () => {
      const body = { sectionId, subjectId: f.subjectId, employeeId: f.employeeId, roomId: f.roomId || null, dayOfWeek: Number(f.dayOfWeek), startTime: f.startTime, endTime: f.endTime };
      return slot ? timetableService.updateSlot(slot.id, body) : timetableService.addSlot(body);
    },
    slot ? 'Period updated' : 'Period added',
    onClose,
  );
  const verb = slot ? 'Save changes' : 'Add period';
  const choose = (t: TeacherOption) => (t.busyWith ? setClash(t) : setF({ ...f, employeeId: t.id }));
  const submit = () => {
    if (assigned && picked && !picked.assigned) setConfirmOther(true);
    else save.mutate(undefined);
  };
  const text = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const subjectName = cls.classSubjects.find((c) => c.subject.id === f.subjectId)?.subject.name ?? 'this subject';
  const free = data?.teachers.filter((t) => !t.busyWith && !t.onLeave).sort((a, b) => rank(a) - rank(b)) ?? [];
  const blocked = !!data?.sectionBusy || !timeOk || !f.employeeId;

  return (
    <>
      <Modal
        open={open && !clash && !confirmOther}
        size="xl"
        title={slot ? `Edit period · ${DAY_NAMES[slot.dayOfWeek]} ${slot.startTime}–${slot.endTime}` : 'Add period'}
        onClose={onClose}
        footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="period-form" disabled={blocked} loading={save.isPending}>{verb}</Button></>}
      >
        <form id="period-form" onSubmit={onSubmit(submit)} className="space-y-4">
          {/* Where this period goes: shown up front so it is never added to the wrong section. */}
          <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3 dark:border-white/10 dark:bg-white/5">
            <Context icon={Building2} label="Campus" value={section?.campus.name ?? '—'} />
            <Context icon={GraduationCap} label="Grade" value={cls.name} />
            <Context icon={Layers} label="Section" value={section?.name ?? '—'} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Day"><Select value={f.dayOfWeek} onChange={text('dayOfWeek')}>{[1, 2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}</Select></Field>
            <Field label="Starts"><Input type="time" required value={f.startTime} onChange={text('startTime')} /></Field>
            <Field label="Ends"><Input type="time" required value={f.endTime} onChange={text('endTime')} /></Field>
            <div className="sm:col-span-2">
              <Field label="Subject">
                <Select required value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value, employeeId: '' })}>
                  <option value="">Select…</option>
                  {cls.classSubjects.map(({ subject }) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Room (optional)">
              <Select value={f.roomId} onChange={text('roomId')}>
                <option value="">No room</option>
                {rooms.data?.filter((r) => r.campusId === section?.campusId).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </Field>
          </div>

          {slot && (
            <p className="text-sm text-slate-500">
              Currently <strong className="text-slate-700 dark:text-slate-200">{slot.subject.name}</strong> with <strong className="text-slate-700 dark:text-slate-200">{slot.employee.firstName} {slot.employee.lastName}</strong>{slot.room ? <> in {slot.room.name}</> : null}. Pick another teacher below if they are absent, or change the room, day or time.
            </p>
          )}
          {!timeOk && <Alert>The period must end after it starts.</Alert>}
          {data?.sectionBusy && <Alert>{cls.name}-{section?.name} already has {data.sectionBusy} at this time. Choose another time.</Alert>}

          {f.subjectId && timeOk && (
            <div>
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <span className="block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Teacher</span>
                  <span className="text-sm text-slate-500">Availability on {DAY_NAMES[Number(f.dayOfWeek)]}, {f.startTime}–{f.endTime}</span>
                </div>
                <div className="w-full sm:w-64"><SearchInput value={search} onChange={setSearch} placeholder="Search teachers…" label="Search teachers" /></div>
              </div>
              <div role="radiogroup" aria-label="Teacher" className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 dark:border-white/10">
                {options.isLoading && <div className="p-4"><Spinner /></div>}
                {data && teachers.length === 0 && <p className="p-4 text-sm text-slate-500">No teacher matches.</p>}
                <ul className="divide-y divide-slate-200 dark:divide-white/10">
                  {teachers.map((t) => {
                    const on = t.id === f.employeeId;
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => choose(t)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${on ? 'bg-primary-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'} ${t.busyWith ? 'opacity-70' : ''}`}
                        >
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-2 ${on ? 'ring-primary-600' : 'ring-slate-300'}`}>{on && <span className="h-2 w-2 rounded-full bg-primary-600" />}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold text-slate-800 dark:text-slate-100">{t.name} <span className="font-normal text-slate-400">· {t.employeeNo}</span></span>
                            <span className="block truncate text-sm text-slate-500">
                              {t.busyWith ? <span className="text-rose-600 dark:text-rose-400">Busy: {t.busyWith}</span> : `Free · ${t.periodsThatDay} period${t.periodsThatDay === 1 ? '' : 's'} that day`}
                            </span>
                          </span>
                          <span className="flex shrink-0 flex-wrap justify-end gap-1">
                            {t.assigned && <Badge tone="emerald">{subjectName} teacher</Badge>}
                            {!t.assigned && t.teachesSubject && <Badge tone="sky">Teaches {subjectName}</Badge>}
                            {!t.sameCampus && <Badge tone="amber">{t.campus}</Badge>}
                            {t.onLeave && <Badge tone="amber">On leave</Badge>}
                            {t.busyWith ? <Badge tone="rose">Busy</Badge> : <Badge tone="slate">Free</Badge>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {data && !data.assignedEmployeeId && picked && (
                <p className="mt-2 text-sm text-slate-500"><UserCheck size={14} className="inline" /> {cls.name}-{section?.name} has no {subjectName} teacher yet; {picked.name} will become its {subjectName} teacher.</p>
              )}
              {picked?.onLeave && <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{picked.name} is on leave at the moment.</p>}
            </div>
          )}
        </form>
      </Modal>

      {/* A teacher cannot be in two classes at once: warn, and offer who is free instead. */}
      <Modal open={!!clash} title="Teacher not available" onClose={() => setClash(null)} footer={<Button variant="secondary" onClick={() => setClash(null)}>Back</Button>}>
        {clash && (
          <div className="space-y-4">
            <Alert>
              <span className="inline-flex items-start gap-2"><AlertTriangle size={16} className="mt-0.5 shrink-0" /> <span><strong>{clash.name}</strong> is already teaching <strong>{clash.busyWith}</strong> on {DAY_NAMES[Number(f.dayOfWeek)]}. A teacher cannot take two classes at the same time, so this period cannot be given to them.</span></span>
            </Alert>
            {free.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Free at this time</p>
                <div className="flex flex-wrap gap-2">
                  {free.slice(0, 8).map((t) => (
                    <Button key={t.id} variant="secondary" icon={CheckCircle2} onClick={() => { setF({ ...f, employeeId: t.id }); setClash(null); }}>
                      {t.name}{t.assigned ? ` · ${subjectName} teacher` : t.teachesSubject ? ` · teaches ${subjectName}` : ''}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-base text-slate-600 dark:text-slate-300">No teacher is free at this time. Choose another time for this period.</p>
            )}
          </div>
        )}
      </Modal>

      {/* Someone other than the section's subject teacher: confirm before saving. */}
      <Modal
        open={confirmOther}
        title="Are you sure?"
        onClose={() => setConfirmOther(false)}
        footer={<><Button variant="secondary" onClick={() => setConfirmOther(false)}>Back</Button><Button loading={save.isPending} onClick={() => { setConfirmOther(false); save.mutate(undefined); }}>{slot ? 'Yes, save' : 'Yes, add period'}</Button></>}
      >
        <p className="text-base text-slate-700 dark:text-slate-200">
          <strong>{assigned?.name}</strong> is the {subjectName} teacher of {cls.name}-{section?.name}. Give this period to <strong>{picked?.name}</strong> instead? Only this period changes; {assigned?.name} stays the subject teacher.
        </p>
      </Modal>
    </>
  );
}

function Context({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="shrink-0 text-slate-400" />
      <div className="min-w-0"><div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div><div className="truncate font-semibold text-slate-800 dark:text-slate-100">{value}</div></div>
    </div>
  );
}
