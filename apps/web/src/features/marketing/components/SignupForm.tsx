import { ArrowRight, Check, CheckCircle2, Copy, MailCheck, Rocket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input } from '@/components/ui';
import { BASE_DOMAIN } from '@/config/site';
import { marketingService, type SignupDetails, type SignupResult, type SlugCheck } from '@/features/marketing/services/marketingService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

const EMPTY: SignupDetails = { schoolName: '', slug: '', city: '', firstName: '', lastName: '', designation: '', email: '', phone: '', password: '' };

/** "Greenfield High School, Lahore" → "greenfield-high-school-lahore" */
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

/**
 * Self-service sign-up: school + admin details, a 6-digit code to the admin's email, then the school
 * is created on a free trial and the admin continues to their school's site already signed in.
 */
export function SignupForm() {
  const [f, setF] = useState<SignupDetails>(EMPTY);
  const [confirm, setConfirm] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [slug, setSlug] = useState<SlugCheck | null>(null);
  const [step, setStep] = useState<'details' | 'code' | 'done'>('details');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [result, setResult] = useState<SignupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const set = (k: keyof SignupDetails) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  // The web address follows the school name until the person edits it.
  useEffect(() => {
    if (!slugEdited) setF((x) => ({ ...x, slug: slugify(x.schoolName) }));
  }, [f.schoolName, slugEdited]);
  useEffect(() => {
    if (f.slug.length < 3) return setSlug(null);
    const t = setTimeout(() => void marketingService.checkSlug(f.slug).then(setSlug, () => setSlug(null)), 350);
    return () => clearTimeout(t);
  }, [f.slug]);

  const pwOk = f.password.length >= 12 && /[A-Za-z]/.test(f.password) && /\d/.test(f.password);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e, 'Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };
  const sendCode = () =>
    run(async () => {
      if (slug && !slug.available) throw new Error(slug.reason ?? 'Choose another web address.');
      if (!pwOk) throw new Error('The password needs at least 12 characters with letters and numbers.');
      if (f.password !== confirm) throw new Error('The two passwords do not match.');
      const r = await marketingService.signupCode(f.email.trim());
      setVerificationId(r.verificationId);
      setCode('');
      setStep('code');
    });
  const create = () =>
    run(async () => {
      const r = await marketingService.signup({ ...f, city: f.city.trim() || undefined, verificationId, code });
      setResult(r);
      setStep('done');
    });

  if (step === 'done' && result) {
    return (
      <div className="mt-5 space-y-4">
        <Alert tone="success"><span className="inline-flex items-start gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /> {result.school.name} is ready. Your free trial includes every feature until {new Date(result.trialEndsAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}.</span></Alert>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">You sign in with {f.email} · your User ID</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="font-mono text-2xl font-bold tracking-wider">{result.loginId}</span>
            <Button variant="secondary" icon={copied ? Check : Copy} onClick={() => void navigator.clipboard.writeText(result.loginId).then(() => setCopied(true))}>{copied ? 'Copied' : 'Copy'}</Button>
          </div>
          <div className="mt-2 text-sm text-slate-500">Your school’s address: <strong>{result.signInUrl.replace(/\/login$/, '')}</strong>. We also emailed these details to {f.email}.</div>
        </div>
        <Button className="w-full py-3" icon={Rocket} onClick={() => window.location.assign(result.continueUrl)}>Open my school</Button>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <form onSubmit={onSubmit(() => void create())} className="mt-5 space-y-4">
        {error && <Alert>{error}</Alert>}
        <Alert tone="info">We sent a 6-digit code to <strong>{f.email}</strong>. Enter it to create {f.schoolName}.</Alert>
        <Field label="Verification code">
          <Input required autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="font-mono text-2xl tracking-[0.4em]" />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300" onClick={() => setStep('details')}>← Change details</button>
          <Button type="submit" icon={MailCheck} loading={busy} disabled={code.length !== 6}>Verify &amp; create my school</Button>
        </div>
        <p className="text-sm text-slate-500">No code? Check spam, or go back and resend in a minute.</p>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit(() => void sendCode())} className="mt-5 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">Create your school in two minutes. You start with a <strong>free trial of every feature</strong>, no card needed.</p>
      {error && <Alert>{error}</Alert>}
      <Field label="School name"><Input required maxLength={150} value={f.schoolName} onChange={set('schoolName')} placeholder="Greenfield High School" /></Field>
      <Field label="Your school’s web address" hint={slug ? (slug.available ? 'Available' : `${slug.reason}${slug.suggestion ? ` Try “${slug.suggestion}”.` : ''}`) : undefined}>
        <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-white/10 dark:bg-[#0e1626]">
          <input required aria-label="Web address" pattern="[a-z0-9][a-z0-9-]{1,61}[a-z0-9]" value={f.slug} onChange={(e) => { setSlugEdited(true); setF({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }); }} className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 font-mono text-base outline-none" />
          <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5">.{BASE_DOMAIN}</span>
        </div>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={set('firstName')} /></Field>
        <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={set('lastName')} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your role" hint="e.g. Principal, Owner"><Input required maxLength={100} value={f.designation} onChange={set('designation')} /></Field>
        <Field label="City (optional)"><Input maxLength={120} value={f.city} onChange={set('city')} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your email" hint="We send a code to confirm it"><Input required type="email" maxLength={254} autoComplete="email" value={f.email} onChange={set('email')} /></Field>
        <Field label="Mobile number"><Input required type="tel" maxLength={25} autoComplete="tel" value={f.phone} onChange={set('phone')} placeholder="0300 1234567" /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Password" hint="12+ characters, letters and numbers"><Input required type="password" minLength={12} autoComplete="new-password" value={f.password} onChange={set('password')} /></Field>
        <Field label="Confirm password"><Input required type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
      </div>
      <Button type="submit" icon={ArrowRight} loading={busy} className="w-full" disabled={!!slug && !slug.available}>Start free trial</Button>
      <p className="text-center text-xs text-slate-500">You will sign in with this email and password. We also give you a permanent User ID (e.g. ADM-2026-0001).</p>
    </form>
  );
}
