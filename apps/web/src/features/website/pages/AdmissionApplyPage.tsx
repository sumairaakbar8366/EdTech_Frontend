import { ArrowLeft, Building2, CheckCircle2, FileUp, Loader2, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Alert, Button, Field, FullPageMessage, Input, Select, TextArea } from '@/components/ui';
import { useForcedLightTheme } from '@/app/providers/ThemeProvider';
import { PhotoPicker } from '@/features/photos/PhotoPicker';
import { useTenant } from '@/features/tenancy/useTenant';
import { admissionFormService, builtinLabel, checkAnswer, fieldsForClass, SECTION_LABEL, type AdmissionForm, type FormField, type FormSection } from '@/features/website/admissionForm';
import { paletteVars, sitePalette } from '@/features/website/sitePalette';
import { ClassFees } from '@/features/website/components/SiteFees';
import { usePublicSite, websiteService, type PublicSite } from '@/features/website/website';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { ApiError, apiAsset } from '@/services/api/http';
import '@/features/website/school-site.css';

const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-md border border-(--site-line) border-t-(--site-accent) border-t-[3px] bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_-12px_rgb(15_23_42/0.12)] ${className}`}>{children}</div>
);

const heading = (text: string) => <h2 className="mt-2 border-b border-(--site-line) pb-2 text-sm font-bold uppercase tracking-[0.14em] text-slate-500 sm:col-span-2">{text}</h2>;
const MAX_FILE = 5 * 1024 * 1024;

/** A document answer: uploaded as soon as it is chosen; the form sends the returned id. */
function FileAnswer({ value, onChange, invalid }: { value: { fileId: string; fileName: string } | undefined; onChange: (v: { fileId: string; fileName: string } | undefined) => void; invalid: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const choose = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!/\.(pdf|docx|jpe?g|png)$/i.test(file.name)) return setError('Choose a PDF, Word (.docx), JPG or PNG file.');
    if (file.size > MAX_FILE) return setError('The file must be at most 5 MB.');
    setBusy(true);
    try {
      onChange(await admissionFormService.stageFile(file));
    } catch (e) {
      onChange(undefined);
      setError(errorMessage(e, 'Could not upload the file.'));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  return (
    <div>
      <input ref={input} type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => void choose(e.target.files?.[0])} />
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm">
          <Paperclip size={16} className="shrink-0 text-emerald-700" />
          <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{value.fileName}</span>
          <button type="button" onClick={() => onChange(undefined)} className="rounded p-1 text-slate-500 hover:bg-white hover:text-rose-600" aria-label="Remove file"><X size={16} /></button>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-3 text-sm font-semibold text-slate-600 hover:border-(--site-accent) hover:text-(--site-accent) ${invalid ? 'border-rose-400' : 'border-slate-300'}`}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />} {busy ? 'Uploading…' : 'Choose file (PDF, Word, JPG or PNG, up to 5 MB)'}
        </button>
      )}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </div>
  );
}

/** One of the school's own fields. */
function CustomField({ field: f, value, error, onChange }: { field: FormField; value: unknown; error?: string; onChange: (v: unknown) => void }) {
  const wide = f.type === 'textarea' || f.type === 'multiselect' || f.type === 'checkbox' || f.type === 'file';
  const str = typeof value === 'string' ? value : '';
  let control: ReactNode;
  switch (f.type) {
    case 'textarea': control = <TextArea rows={3} required={f.required} maxLength={f.maxLength ?? 3000} value={str} onChange={(e) => onChange(e.target.value)} />; break;
    case 'number': control = <Input type="number" step="any" required={f.required} min={f.min ?? undefined} max={f.max ?? undefined} value={str} onChange={(e) => onChange(e.target.value)} />; break;
    case 'email': control = <Input type="email" required={f.required} maxLength={254} value={str} onChange={(e) => onChange(e.target.value)} />; break;
    case 'phone': control = <Input type="tel" required={f.required} maxLength={24} value={str} onChange={(e) => onChange(e.target.value)} />; break;
    case 'date': control = <Input type="date" required={f.required} value={str} onChange={(e) => onChange(e.target.value)} />; break;
    case 'select':
      control = <Select required={f.required} value={str} onChange={(e) => onChange(e.target.value)}><option value="">Choose…</option>{f.options.map((o) => <option key={o} value={o}>{o}</option>)}</Select>;
      break;
    case 'multiselect': {
      const list = Array.isArray(value) ? (value as string[]) : [];
      control = (
        <div className="grid gap-2 sm:grid-cols-2">
          {f.options.map((o) => (
            <label key={o} className="inline-flex cursor-pointer items-center gap-2 text-slate-700">
              <input type="checkbox" className="h-4 w-4 accent-(--site-accent)" checked={list.includes(o)} onChange={(e) => onChange(e.target.checked ? [...list, o] : list.filter((x) => x !== o))} /> {o}
            </label>
          ))}
        </div>
      );
      break;
    }
    case 'checkbox':
      return (
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-(--site-line) p-3 text-slate-700">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-(--site-accent)" required={f.required} checked={value === true} onChange={(e) => onChange(e.target.checked)} />
            <span><span className="font-semibold">{f.label}{f.required && <span className="text-rose-600"> *</span>}</span>{f.help && <span className="block text-sm text-slate-500">{f.help}</span>}</span>
          </label>
          {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
        </div>
      );
    case 'file': control = <FileAnswer value={value as { fileId: string; fileName: string } | undefined} onChange={onChange} invalid={!!error} />; break;
    default: control = <Input required={f.required} maxLength={f.maxLength ?? 200} value={str} onChange={(e) => onChange(e.target.value)} />;
  }
  return <div className={wide ? 'sm:col-span-2' : ''} data-field={f.id}><Field label={f.label} hint={f.help ?? undefined} error={error} required={f.required}>{control}</Field></div>;
}

function ApplicationForm({ site, form }: { site: PublicSite; form: AdmissionForm }) {
  const blank = { academicYearId: site.sessions.find((s) => !s.isCurrent)?.id ?? site.sessions[0]?.id ?? '', classId: '', campusId: site.campuses[0]?.id ?? '', firstName: '', lastName: '', gender: '', dateOfBirth: '', previousSchool: '', guardianFirstName: '', guardianLastName: '', guardianRelation: 'father', guardianPhone: '', guardianEmail: '', address: '', notes: '', website: '' };
  const [f, setF] = useState(blank);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const b = form.builtins;
  const asked = useMemo(() => (f.classId ? fieldsForClass(form, f.classId) : form.fields.filter((x) => !x.classIds.length)), [form, f.classId]);
  const inSection = (s: FormSection) => asked.filter((x) => x.section === s);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF({ ...f, [k]: e.target.value }); setErrors(({ [k]: _, ...rest }) => rest); };
  const answer = (id: string) => (v: unknown) => { setAnswers((a) => ({ ...a, [id]: v })); setErrors(({ [id]: _, ...rest }) => rest); };
  const custom = (s: FormSection) => inSection(s).map((x) => <CustomField key={x.id} field={x} value={answers[x.id]} error={errors[x.id]} onChange={answer(x.id)} />);

  const showErrors = (e: Record<string, string>) => {
    setErrors(e);
    setError(`Please correct the ${Object.keys(e).length === 1 ? 'highlighted field' : `${Object.keys(e).length} highlighted fields`}.`);
    requestAnimationFrame(() => document.querySelector('[aria-invalid="true"], .text-rose-600')?.closest('.field, [data-field]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const submit = async () => {
    // The same checks as the server, so most mistakes show at once.
    const e: Record<string, string> = {};
    const builtinValue = { photoId, gender: f.gender, previousSchool: f.previousSchool, guardianEmail: f.guardianEmail, address: f.address, notes: f.notes };
    const builtinKeys = { photo: 'photoId', gender: 'gender', previousSchool: 'previousSchool', guardianEmail: 'guardianEmail', address: 'address', notes: 'notes' } as const;
    for (const [k, key] of Object.entries(builtinKeys) as [keyof typeof builtinKeys, (typeof builtinKeys)[keyof typeof builtinKeys]][]) {
      if (b[k].enabled && b[k].required && !builtinValue[key]?.trim()) e[key] = `${builtinLabel(form, k)} is required`;
    }
    for (const x of asked) {
      const v = x.type === 'file' ? (answers[x.id] as { fileId: string } | undefined)?.fileId : answers[x.id];
      const msg = checkAnswer(x, v);
      if (msg) e[x.id] = msg;
    }
    if (Object.keys(e).length) return showErrors(e);

    setBusy(true);
    setError(null);
    try {
      const sent = Object.fromEntries(
        asked.flatMap((x) => {
          const v = answers[x.id];
          if (x.type === 'file') return v ? [[x.id, (v as { fileId: string }).fileId]] : [];
          if (v === undefined || v === '' || v === false || (Array.isArray(v) && !v.length)) return [];
          return [[x.id, typeof v === 'string' ? v.trim() : v]];
        }),
      );
      const optional = (on: boolean, v: string) => (on && v.trim() ? v.trim() : null);
      const r = await websiteService.applyAdmission({
        academicYearId: f.academicYearId || null,
        classId: f.classId,
        campusId: f.campusId,
        firstName: f.firstName,
        lastName: f.lastName,
        dateOfBirth: f.dateOfBirth,
        guardianFirstName: f.guardianFirstName,
        guardianLastName: f.guardianLastName,
        guardianRelation: f.guardianRelation,
        guardianPhone: f.guardianPhone,
        gender: optional(b.gender.enabled, f.gender),
        previousSchool: optional(b.previousSchool.enabled, f.previousSchool),
        guardianEmail: optional(b.guardianEmail.enabled, f.guardianEmail),
        address: optional(b.address.enabled, f.address),
        notes: optional(b.notes.enabled, f.notes),
        ...(b.photo.enabled && photoId && { photoId }),
        answers: sent,
        website: f.website,
      });
      setDone(r.applicationNo);
      setF(blank);
      setPhotoId(null);
      setAnswers({});
      top.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      const fieldErrors = err instanceof ApiError ? (err.body as { fieldErrors?: Record<string, string> } | undefined)?.fieldErrors : undefined;
      if (fieldErrors) showErrors(fieldErrors);
      else setError(errorMessage(err, 'Could not send the application. Please check the form and try again.'));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Panel className="p-8 text-center sm:p-10">
        <CheckCircle2 size={44} className="mx-auto text-emerald-600" />
        <h2 className="site-serif mt-3 text-2xl font-semibold text-slate-900">Application received</h2>
        <p className="mt-2 text-slate-600">Your application number is <strong className="font-mono">{done}</strong>. Please note it down. The school office will contact you on the phone number you gave.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => setDone(null)}>Apply for another child</Button>
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-(--site-accent) px-4 py-2 font-bold uppercase tracking-wide text-white">Back to website</Link>
        </div>
      </Panel>
    );
  }

  const documents = inSection('documents');
  return (
    <Panel>
      <div ref={top} className="scroll-mt-24" />
      <form onSubmit={onSubmit(() => void submit())} className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
        {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
        <input type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} className="hidden" aria-hidden />

        {heading(SECTION_LABEL.student)}
        {b.photo.enabled && (
          <div className="sm:col-span-2" data-field="photoId">
            <PhotoPicker publicForm required={b.photo.required} value={photoId} onChange={(v) => { setPhotoId(v); setErrors(({ photoId: _, ...rest }) => rest); }} name={`${f.firstName} ${f.lastName}`.trim()} label={builtinLabel(form, 'photo')} hint="A clear, recent photo of the child's face. JPG or PNG, up to 3 MB." />
            {errors.photoId && <span className="mt-1 block text-xs text-rose-600">{errors.photoId}</span>}
          </div>
        )}
        {site.sessions.length > 1 && (
          <Field label="Session"><Select required value={f.academicYearId} onChange={set('academicYearId')}>{site.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}{s.isCurrent ? ' (current)' : ''}</option>)}</Select></Field>
        )}
        <Field label="Class applying for"><Select required value={f.classId} onChange={set('classId')}><option value="">Choose a class</option>{site.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        {f.classId && <ClassFees fees={site.fees} classId={f.classId} sessionId={f.academicYearId} className={site.classes.find((c) => c.id === f.classId)?.name ?? 'this class'} />}
        {site.campuses.length > 1 && <Field label="Campus"><Select required value={f.campusId} onChange={set('campusId')}>{site.campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>}
        <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={set('firstName')} /></Field>
        <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={set('lastName')} /></Field>
        <Field label="Date of birth"><Input type="date" required value={f.dateOfBirth} onChange={set('dateOfBirth')} /></Field>
        {b.gender.enabled && (
          <Field label={builtinLabel(form, 'gender')} error={errors.gender}>
            <Select required={b.gender.required} value={f.gender} onChange={set('gender')}><option value="">{b.gender.required ? 'Choose…' : 'Prefer not to say'}</option><option value="male">Male</option><option value="female">Female</option></Select>
          </Field>
        )}
        {b.previousSchool.enabled && <div className="sm:col-span-2"><Field label={builtinLabel(form, 'previousSchool')} error={errors.previousSchool}><Input required={b.previousSchool.required} maxLength={150} value={f.previousSchool} onChange={set('previousSchool')} /></Field></div>}
        {custom('student')}

        {heading(SECTION_LABEL.guardian)}
        <Field label="First name"><Input required maxLength={100} value={f.guardianFirstName} onChange={set('guardianFirstName')} /></Field>
        <Field label="Last name"><Input required maxLength={100} value={f.guardianLastName} onChange={set('guardianLastName')} /></Field>
        <Field label="Relationship"><Select value={f.guardianRelation} onChange={set('guardianRelation')}><option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option><option value="grandparent">Grandparent</option><option value="other">Other</option></Select></Field>
        <Field label="Mobile number"><Input required type="tel" maxLength={32} pattern="[+0-9 \(\)\-]{10,}" title="e.g. 0300 1234567" value={f.guardianPhone} onChange={set('guardianPhone')} /></Field>
        {b.guardianEmail.enabled && <Field label={builtinLabel(form, 'guardianEmail')} error={errors.guardianEmail}><Input type="email" required={b.guardianEmail.required} maxLength={254} value={f.guardianEmail} onChange={set('guardianEmail')} /></Field>}
        {b.address.enabled && <Field label={builtinLabel(form, 'address')} error={errors.address}><Input required={b.address.required} maxLength={500} value={f.address} onChange={set('address')} /></Field>}
        {custom('guardian')}

        {(b.notes.enabled || inSection('additional').length > 0) && heading(SECTION_LABEL.additional)}
        {custom('additional')}
        {b.notes.enabled && <div className="sm:col-span-2"><Field label={builtinLabel(form, 'notes')} error={errors.notes}><TextArea rows={3} required={b.notes.required} maxLength={3000} value={f.notes} onChange={set('notes')} /></Field></div>}

        {documents.length > 0 && heading(SECTION_LABEL.documents)}
        {custom('documents')}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--site-line) pt-5 sm:col-span-2">
          <p className="max-w-md text-sm text-slate-500">Fields marked <span className="text-rose-600">*</span> are mandatory. The office reviews every application and contacts you.</p>
          <Button type="submit" icon={Send} loading={busy} className="bg-(--site-accent)!">Send application</Button>
        </div>
      </form>
    </Panel>
  );
}

/** The school's online admission form (website: "Apply now"), as the school designed it. */
export function AdmissionApplyPage() {
  useForcedLightTheme();
  const site = usePublicSite();
  const tenant = useTenant();
  const branding = tenant.data?.kind === 'school' ? tenant.data.school.branding : null;
  const primary = site.data?.school.primaryColor ?? branding?.primaryColor ?? null;
  const palette = useMemo(() => sitePalette(primary, branding?.secondaryColor), [primary, branding?.secondaryColor]);
  useEffect(() => {
    if (site.data) document.title = `Apply for admission | ${site.data.school.name}`;
  }, [site.data]);

  if (site.isLoading) return <FullPageMessage title="Loading…" />;
  if (!site.data) return <FullPageMessage title="This page is not available" icon={Building2}>Please try again later.</FullPageMessage>;
  const s = site.data;
  const closed = !s.published || !s.admissionsOpen;
  const currentSession = s.sessions.find((x) => x.isCurrent);

  return (
    <div className="school-site min-h-screen bg-(--site-page) text-slate-700 antialiased" style={paletteVars(palette) as CSSProperties}>
      <header className="sticky top-0 z-30 border-b border-(--site-line) bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3.5 sm:px-6">
          {s.school.logoUrl && <img src={apiAsset(s.school.logoUrl)} alt="" className="h-10 w-10 shrink-0 rounded object-contain" />}
          <span className="site-serif min-w-0 flex-1 truncate text-lg font-semibold text-slate-900">{s.school.name}</span>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-(--site-accent)"><ArrowLeft size={15} /> Website</Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="site-kicker text-xs font-bold uppercase tracking-[0.2em] text-(--site-accent)">Admissions{currentSession ? ` · Session ${currentSession.name}` : ''}</p>
        <h1 className="site-serif mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Apply for admission</h1>
        {closed ? (
          <Panel className="mt-8 p-8 text-center">
            <p className="text-lg text-slate-600">Online admissions are closed at the moment. Please contact the school office{s.contact.phone ? ` on ${s.contact.phone}` : ''}.</p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 font-semibold text-(--site-accent) hover:underline"><ArrowLeft size={16} /> Back to the website</Link>
          </Panel>
        ) : (
          <>
            {s.admissionForm.intro && <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-slate-600">{s.admissionForm.intro}</p>}
            <div className="mt-8"><ApplicationForm site={s} form={s.admissionForm} /></div>
          </>
        )}
      </main>
    </div>
  );
}
