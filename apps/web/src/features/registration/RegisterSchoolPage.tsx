import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Circle, Mail, MessageCircle, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Backdrop } from '@/components/effects/Backdrop';
import { BrandLockup } from '@/components/brand/BrandLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Alert, Button, Field, Input, Select, Spinner } from '@/components/ui';
import { OrDivider, SocialButtons } from '@/features/auth/components/SocialButtons';
import { startSso } from '@/features/auth/sso';
import { DynamicFields } from '@/features/forms/components/DynamicFields';
import { missingRequired, type Answers } from '@/features/forms/forms';
import { clearDraft, loadDraft, registrationService, saveDraft, takeGoogleReturn, trialFor, type CheckLine, type RegisterResult } from '@/features/registration/registration';
import { CityPicker } from './CityPicker';
import { PRODUCT_NAME } from '@/config/brand';
import { ApiError } from '@/services/api/http';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

interface Draft {
  step: number;
  email: string; emailProof: string; emailMethod: 'google' | 'email' | '';
  phone: string; phoneProof: string; phoneE164: string;
  ownerFirstName: string; ownerLastName: string; designation: string; nic: string;
  schoolName: string; schoolType: string; registrationNo: string; ntn: string;
  country: string; province: string; city: string; address: string; postalCode: string;
  studentCount: string; teacherCount: string; staffCount: string;
  answers: Answers; declaration: boolean;
}
const EMPTY: Draft = { step: 0, email: '', emailProof: '', emailMethod: '', phone: '', phoneProof: '', phoneE164: '', ownerFirstName: '', ownerLastName: '', designation: 'Owner', nic: '', schoolName: '', schoolType: '', registrationNo: '', ntn: '', country: 'Pakistan', province: '', city: '', address: '', postalCode: '', studentCount: '', teacherCount: '', staffCount: '0', answers: {}, declaration: false };
const STEPS = ['Verify you', 'About you', 'Your school', 'Review'];

/** Small 6-digit code box with a resend link. */
function CodeBox({ value, onChange, onResend, busy, resendIn }: { value: string; onChange: (v: string) => void; onResend: () => void; busy: boolean; resendIn: number }) {
  return (
    <div className="space-y-2">
      <Input required autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} className="font-mono text-2xl tracking-[0.4em]" placeholder="••••••" aria-label="6-digit code" />
      <button type="button" disabled={busy || resendIn > 0} onClick={onResend} className="text-sm font-semibold text-orange-700 hover:underline disabled:opacity-50 dark:text-orange-300">{resendIn > 0 ? `Send a new code in ${resendIn}s` : 'Send a new code'}</button>
    </div>
  );
}

function useCountdown(seconds: number | null) {
  const [left, setLeft] = useState(0);
  useEffect(() => { if (seconds) setLeft(seconds); }, [seconds]);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [left]);
  return [left, setLeft] as const;
}

/** The application is with the team: what happens next. */
function Done({ r, email }: { r: RegisterResult; email: string }) {
  return (
    <div className="space-y-4">
      <Alert tone="success"><span className="inline-flex items-start gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /> {r.message}</span></Alert>
      <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Your reference</div>
        <div className="mt-1 font-mono text-2xl font-bold tracking-wider">{r.reference}</div>
        <p className="mt-2 text-sm text-slate-500">A receipt was sent to <strong>{email}</strong>. Keep the reference if you need to contact us.</p>
      </div>
      <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {['Our team checks your CNIC, NTN and school details.', 'We may call or email you if something needs clarifying.', 'When approved, your school is created and your User ID and password are emailed to you, with a free trial sized to your school.'].map((t, i) => <li key={t} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-xs font-bold text-primary-700 dark:text-primary-200">{i + 1}</span>{t}</li>)}
      </ol>
    </div>
  );
}

/**
 * "Apply to join": the person proves their email (Google or a code) and their mobile (a WhatsApp
 * code) and gives their own and the school's details. Nothing is created: the application goes to the
 * owner's team, who verify it by hand; the school exists only once the owner approves it.
 */
export function RegisterSchoolPage() {
  const info = useQuery({ queryKey: ['registration-form'], queryFn: registrationService.form, staleTime: 60_000 });
  const [d, setD] = useState<Draft>(() => ({ ...EMPTY, ...(loadDraft<Draft>() ?? {}) }));
  const [error, setError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<{ reasons: string[]; checks: CheckLine[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [tried, setTried] = useState(false);
  // email code state
  const [emailVid, setEmailVid] = useState<string | null>(null); const [emailCode, setEmailCode] = useState('');
  const [phoneVid, setPhoneVid] = useState<string | null>(null); const [phoneCode, setPhoneCode] = useState('');
  const [emailWait, setEmailWait] = useCountdown(null); const [phoneWait, setPhoneWait] = useCountdown(null);

  const set = (p: Partial<Draft>) => setD((s) => ({ ...s, ...p }));
  useEffect(() => { saveDraft(d); }, [d]);
  // Back from Google: the proof is in the address fragment.
  useEffect(() => {
    const g = takeGoogleReturn();
    if (g) setD((s) => ({ ...s, email: g.email, emailProof: g.proof, emailMethod: 'google', ownerFirstName: s.ownerFirstName || (g.name ?? '').split(' ')[0] || '', ownerLastName: s.ownerLastName || (g.name ?? '').split(' ').slice(1).join(' ') }));
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError(null);
    try { await fn(); } catch (e) { setError(errorMessage(e, 'Something went wrong. Please try again.')); } finally { setBusy(false); }
  };
  const form = info.data;
  const people = (Number(d.studentCount) || 0) + (Number(d.teacherCount) || 0) + (Number(d.staffCount) || 0);
  const trial = form && people > 0 ? trialFor(form.trialBands, people) : null;
  const cities = useMemo(() => (form && d.province ? form.cities[d.province] ?? [] : []), [form, d.province]);
  const answerErrors = form ? missingRequired(form.form, d.answers) : {};
  const phoneNeeded = form?.requirePhoneCode ?? true;
  const verified = !!d.emailProof && (!phoneNeeded || !!d.phoneProof);

  const sendEmail = () => run(async () => { const r = await registrationService.emailCode(d.email.trim().toLowerCase()); setEmailVid(r.verificationId); setEmailCode(''); setEmailWait(r.resendInSeconds); });
  const checkEmail = () => run(async () => { const r = await registrationService.emailVerify({ email: d.email.trim().toLowerCase(), verificationId: emailVid!, code: emailCode }); set({ email: r.email, emailProof: r.proof, emailMethod: 'email' }); setEmailVid(null); });
  const sendPhone = () => run(async () => { const r = await registrationService.phoneCode(d.phone); setPhoneVid(r.verificationId); setPhoneCode(''); set({ phoneE164: r.phone }); setPhoneWait(r.resendInSeconds); });
  const checkPhone = () => run(async () => { const r = await registrationService.phoneVerify({ phone: d.phone, verificationId: phoneVid!, code: phoneCode }); set({ phoneProof: r.proof, phoneE164: r.phone }); setPhoneVid(null); });

  async function submit() {
    setBusy(true); setError(null); setRefusal(null);
    try {
      const r = await registrationService.register({
        schoolName: d.schoolName.trim(), schoolType: d.schoolType || undefined, registrationNo: d.registrationNo.trim() || undefined, ntn: d.ntn.trim(), country: d.country, province: d.province, city: d.city.trim(), address: d.address.trim(), postalCode: d.postalCode.trim() || undefined,
        studentCount: Number(d.studentCount), teacherCount: Number(d.teacherCount), staffCount: Number(d.staffCount || 0), ownerFirstName: d.ownerFirstName.trim(), ownerLastName: d.ownerLastName.trim(), designation: d.designation, nic: d.nic.trim(),
        email: d.email.trim().toLowerCase(), phone: d.phone.trim(), emailProof: d.emailProof, phoneProof: d.phoneProof || undefined, answers: d.answers, declaration: d.declaration,
      });
      clearDraft();
      setResult(r);
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) {
        const b = e.body as { reasons?: string[]; checks?: CheckLine[] };
        setRefusal({ reasons: b.reasons ?? [e.message], checks: b.checks ?? [] });
      } else setError(errorMessage(e, 'The registration could not be completed. Please try again.'));
    } finally { setBusy(false); }
  }

  const step = d.step;
  const next = () => { setTried(true); set({ step: step + 1 }); setTried(false); window.scrollTo({ top: 0 }); };
  const back = () => { setError(null); setRefusal(null); set({ step: Math.max(0, step - 1) }); };

  const aboutOk = d.ownerFirstName.trim() && d.ownerLastName.trim() && d.nic.trim().length >= 13 && d.designation;
  const schoolOk = d.schoolName.trim() && d.ntn.trim() && d.province && d.city.trim() && d.address.trim().length >= 8 && Number(d.studentCount) >= (form?.minStudents ?? 1) && Number(d.teacherCount) >= 1 && Object.keys(answerErrors).length === 0;

  return (
    <main className="relative min-h-dvh">
      <Backdrop />
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <Link to="/" aria-label={`${PRODUCT_NAME} home`}><BrandLockup /></Link>
        <div className="surface mt-6 rounded-2xl p-5 sm:p-8">
          <p className="text-xs font-bold uppercase text-magenta-600 dark:text-magenta-300">{PRODUCT_NAME}</p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase text-slate-900 dark:text-white">Apply to join</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Only genuine, registered schools get a free trial. Send your application: our team verifies your identity and your school by hand, then approves it.</p>

          {result ? <div className="mt-6"><Done r={result} email={d.email} /></div> : info.isLoading || !form ? <div className="mt-8"><Spinner /></div> : (
            <>
              <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Steps">
                {STEPS.map((s, i) => (
                  <li key={s} className={`rounded-lg px-2 py-2 text-center text-xs font-bold uppercase tracking-wide ${i === step ? 'bg-brand text-white' : i < step ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-slate-500/10 text-slate-500'}`}>{i < step ? '✓ ' : `${i + 1}. `}{s}</li>
                ))}
              </ol>
              <div className="mt-6 space-y-5">
                {error && <Alert>{error}</Alert>}
                {refusal && (
                  <div className="space-y-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4" role="alert">
                    <p className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300"><XCircle size={18} /> Your application could not be accepted.</p>
                    <ul className="list-disc space-y-1 pl-6 text-sm text-slate-700 dark:text-slate-200">{refusal.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                    {refusal.checks.length > 0 && (
                      <ul className="grid gap-1 text-sm sm:grid-cols-2">
                        {refusal.checks.map((c) => <li key={c.key} className={`flex items-center gap-2 ${c.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{c.passed ? <CheckCircle2 size={15} /> : <XCircle size={15} />} {c.label}</li>)}
                      </ul>
                    )}
                    <p className="text-sm text-slate-500">Correct the details and try again.</p>
                  </div>
                )}

                {step === 0 && (
                  <section className="space-y-6" aria-label="Verify you">
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                      <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Mail size={18} /> 1. Your email {d.emailProof && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><BadgeCheck size={16} /> verified {d.emailMethod === 'google' ? 'with Google' : 'with a code'}</span>}</h2>
                      {d.emailProof ? (
                        <div className="mt-3 flex items-center justify-between gap-3 text-slate-700 dark:text-slate-200"><span className="font-semibold">{d.email}</span><button type="button" className="text-sm font-semibold text-orange-700 hover:underline dark:text-orange-300" onClick={() => set({ emailProof: '', emailMethod: '' })}>Use another email</button></div>
                      ) : emailVid ? (
                        <form className="mt-3 space-y-3" onSubmit={onSubmit(() => void checkEmail())}>
                          <Alert tone="info">We sent a 6-digit code to <strong>{d.email}</strong>. It is valid for 10 minutes.</Alert>
                          <CodeBox value={emailCode} onChange={setEmailCode} onResend={() => void sendEmail()} busy={busy} resendIn={emailWait} />
                          <div className="flex gap-2"><Button type="submit" loading={busy} disabled={emailCode.length !== 6}>Verify email</Button><Button variant="ghost" onClick={() => setEmailVid(null)}>Change email</Button></div>
                        </form>
                      ) : (
                        <div className="mt-3 space-y-3">
                          <SocialButtons onProvider={(p) => { saveDraft(d); startSso({ provider: p, purpose: 'register' }); }} />
                          <OrDivider />
                          <form className="flex flex-wrap items-end gap-3" onSubmit={onSubmit(() => void sendEmail())}>
                            <div className="min-w-[14rem] flex-1"><Field label="Email address"><Input type="email" required autoComplete="email" value={d.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@school.edu.pk" /></Field></div>
                            <Button type="submit" loading={busy} disabled={!/^\S+@\S+\.\S+$/.test(d.email)}>Send code</Button>
                          </form>
                        </div>
                      )}
                    </div>

                    {phoneNeeded && (
                      <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                        <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><MessageCircle size={18} /> 2. Your WhatsApp / mobile number {d.phoneProof && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><BadgeCheck size={16} /> verified</span>}</h2>
                        {d.phoneProof ? (
                          <div className="mt-3 flex items-center justify-between gap-3 text-slate-700 dark:text-slate-200"><span className="font-semibold">{d.phoneE164 || d.phone}</span><button type="button" className="text-sm font-semibold text-orange-700 hover:underline dark:text-orange-300" onClick={() => set({ phoneProof: '' })}>Use another number</button></div>
                        ) : phoneVid ? (
                          <form className="mt-3 space-y-3" onSubmit={onSubmit(() => void checkPhone())}>
                            <Alert tone="info">We sent a 6-digit code on WhatsApp to <strong>{d.phoneE164}</strong>.</Alert>
                            <CodeBox value={phoneCode} onChange={setPhoneCode} onResend={() => void sendPhone()} busy={busy} resendIn={phoneWait} />
                            <div className="flex gap-2"><Button type="submit" loading={busy} disabled={phoneCode.length !== 6}>Verify number</Button><Button variant="ghost" onClick={() => setPhoneVid(null)}>Change number</Button></div>
                          </form>
                        ) : (
                          <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={onSubmit(() => void sendPhone())}>
                            <div className="min-w-[14rem] flex-1"><Field label="Mobile number (with WhatsApp)" hint="A Pakistani mobile number, e.g. 0300 1234567"><Input type="tel" required autoComplete="tel" value={d.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="0300 1234567" /></Field></div>
                            <Button type="submit" loading={busy} disabled={d.phone.replace(/\D/g, '').length < 10}>Send WhatsApp code</Button>
                          </form>
                        )}
                      </div>
                    )}
                    {!phoneNeeded && (
                      <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                        <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><MessageCircle size={18} /> 2. Your mobile number</h2>
                        <div className="mt-3"><Field label="Mobile number (with WhatsApp)" hint="A Pakistani mobile number, e.g. 0300 1234567. WhatsApp verification is not switched on yet, so we do not send a code." required><Input type="tel" required autoComplete="tel" value={d.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="0300 1234567" /></Field></div>
                      </div>
                    )}
                    <Button className="w-full py-3" icon={ArrowRight} disabled={!verified || (!phoneNeeded && d.phone.replace(/\D/g, '').length < 10)} onClick={next}>Continue</Button>
                  </section>
                )}

                {step === 1 && (
                  <form className="space-y-4" onSubmit={onSubmit(() => aboutOk && next())}>
                    <p className="text-sm text-slate-500">The person registering must be the school’s owner or its head. Your CNIC is used only to check you against the school’s record and to stop the same person registering twice; only a protected fingerprint of it is kept.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="First name" required><Input required value={d.ownerFirstName} onChange={(e) => set({ ownerFirstName: e.target.value })} /></Field>
                      <Field label="Last name" required><Input required value={d.ownerLastName} onChange={(e) => set({ ownerLastName: e.target.value })} /></Field>
                      <Field label="Your role at the school" required><Select value={d.designation} onChange={(e) => set({ designation: e.target.value })}>{form.designations.map((x) => <option key={x}>{x}</option>)}</Select></Field>
                      <Field label="Your CNIC (national ID)" hint="13 digits, e.g. 35202-1234567-1" required><Input required inputMode="numeric" maxLength={15} value={d.nic} onChange={(e) => set({ nic: e.target.value.replace(/[^\d-]/g, '') })} placeholder="35202-1234567-1" /></Field>
                    </div>
                    <div className="flex gap-3"><Button variant="secondary" icon={ArrowLeft} onClick={back}>Back</Button><Button type="submit" className="flex-1" icon={ArrowRight} disabled={!aboutOk}>Continue</Button></div>
                  </form>
                )}

                {step === 2 && (
                  <form className="space-y-5" onSubmit={onSubmit(() => { setTried(true); if (schoolOk) next(); })}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2"><Field label="School name (as registered)" required><Input required maxLength={150} value={d.schoolName} onChange={(e) => set({ schoolName: e.target.value })} /></Field></div>
                      <Field label="School type"><Select value={d.schoolType} onChange={(e) => set({ schoolType: e.target.value })}><option value="">Choose…</option>{form.schoolTypes.map((x) => <option key={x}>{x}</option>)}</Select></Field>
                      <Field label="Registration number" hint="From your education department / registration certificate"><Input value={d.registrationNo} onChange={(e) => set({ registrationNo: e.target.value })} /></Field>
                      <Field label="School’s NTN" hint="National Tax Number, e.g. 1234567-8" required><Input required value={d.ntn} maxLength={20} onChange={(e) => set({ ntn: e.target.value })} placeholder="1234567-8" /></Field>
                      <Field label="Country" required><Select value={d.country} onChange={(e) => set({ country: e.target.value })}>{form.countries.map((x) => <option key={x}>{x}</option>)}</Select></Field>
                      <Field label="Province" required><Select required value={d.province} onChange={(e) => set({ province: e.target.value, city: '' })}><option value="">Choose…</option>{form.provinces.map((x) => <option key={x}>{x}</option>)}</Select></Field>
                      <Field label="City" required><CityPicker value={d.city} cities={cities} disabled={!d.province} placeholder={d.province ? 'Start typing…' : 'Choose the province first'} onChange={(city) => set({ city })} /></Field>
                      <div className="sm:col-span-2"><Field label="Full address" required><Input required minLength={8} maxLength={300} value={d.address} onChange={(e) => set({ address: e.target.value })} placeholder="Street, area, city" /></Field></div>
                      <Field label="Students" hint={`At least ${form.minStudents}`} required><Input required type="number" min={form.minStudents} value={d.studentCount} onChange={(e) => set({ studentCount: e.target.value })} /></Field>
                      <Field label="Teachers" required><Input required type="number" min={1} value={d.teacherCount} onChange={(e) => set({ teacherCount: e.target.value })} /></Field>
                      <Field label="Other staff (admin, support…)"><Input type="number" min={0} value={d.staffCount} onChange={(e) => set({ staffCount: e.target.value })} /></Field>
                    </div>
                    {trial && <div className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900 dark:border-primary-400/20 dark:bg-primary-500/10 dark:text-primary-100"><ShieldCheck size={18} className="mt-0.5 shrink-0" /><p>For a school with about <strong>{people.toLocaleString()}</strong> people ({trial.label.toLowerCase()}), the free trial is <strong>{trial.days} days</strong> with every feature.</p></div>}
                    {form.form.fields.length > 0 && (
                      <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-white/10">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">A few more questions</h3>
                        {form.form.intro && <p className="text-sm text-slate-600 dark:text-slate-300">{form.form.intro}</p>}
                        <DynamicFields form={form.form} answers={d.answers} onChange={(answers) => set({ answers })} errors={tried ? answerErrors : {}} />
                      </section>
                    )}
                    <div className="flex gap-3"><Button variant="secondary" icon={ArrowLeft} onClick={back}>Back</Button><Button type="submit" className="flex-1" icon={ArrowRight} disabled={!schoolOk && tried}>Review</Button></div>
                  </form>
                )}

                {step === 3 && (
                  <form className="space-y-5" onSubmit={onSubmit(() => void submit())}>
                    <dl className="grid gap-x-6 gap-y-3 rounded-xl border border-slate-200 p-4 text-sm sm:grid-cols-2 dark:border-white/10">
                      {([['You', `${d.ownerFirstName} ${d.ownerLastName} · ${d.designation}`], ['CNIC', d.nic.replace(/\d(?=\d{4})/g, '•')], ['Email', `${d.email} (${d.emailMethod === 'google' ? 'Google' : 'code'})`], ['Mobile', d.phoneE164 || d.phone], ['School', `${d.schoolName}${d.schoolType ? ` · ${d.schoolType}` : ''}`], ['NTN / Reg. no.', `${d.ntn}${d.registrationNo ? ` · ${d.registrationNo}` : ''}`], ['Place', `${d.city}, ${d.province}, ${d.country}`], ['Address', d.address], ['People', `${d.studentCount} students · ${d.teacherCount} teachers · ${d.staffCount || 0} other staff`], ['Free trial after approval', trial ? `${trial.days} days, every feature` : '—']] as const).map(([k, v]) => (
                        <div key={k}><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{k}</dt><dd className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{v}</dd></div>
                      ))}
                    </dl>
                    <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                      {['Our team checks your CNIC and NTN with the authorities', 'The school’s name, place and registration are confirmed', 'You hear from us by email; nothing is created until the application is approved'].map((t) => <li key={t} className="flex items-start gap-2"><Circle size={8} className="mt-1.5 shrink-0" /> {t}</li>)}
                    </ul>
                    <label className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" className="mt-1 h-4 w-4" checked={d.declaration} onChange={(e) => set({ declaration: e.target.checked })} /> I confirm that these details are true, that I am authorised to register this school, and I accept the terms of service. I understand that false details are refused and recorded.</label>
                    <div className="flex gap-3"><Button variant="secondary" icon={ArrowLeft} onClick={back}>Back</Button><Button type="submit" className="flex-1" icon={ShieldCheck} loading={busy} disabled={!d.declaration || !verified}>Submit application</Button></div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-semibold text-primary-700 hover:underline dark:text-primary-300">Sign in</Link></p>
      </div>
    </main>
  );
}
