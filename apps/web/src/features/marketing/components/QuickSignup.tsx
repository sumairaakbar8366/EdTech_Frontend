import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, LayoutDashboard, MailCheck, Rocket, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Field, Input } from '@/components/ui';
import { SocialButtons, useAuthConfig } from '@/features/auth/components/SocialButtons';
import { PROVIDER_LABEL, startSso } from '@/features/auth/sso';
import { marketingService, type QuickSignup as QuickSignupBody, type SignupResult, type SocialProvider } from '@/features/marketing/services/marketingService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** What the person gets: said before they choose how to sign up. */
export function AdminNotice() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900 dark:border-primary-400/20 dark:bg-primary-500/10 dark:text-primary-100">
      <LayoutDashboard size={18} className="mt-0.5 shrink-0" />
      <p>You will be signed in as your school’s <strong>administrator</strong> and taken straight to your <strong>admin dashboard</strong>. From there you add teachers, students and parents; each gets their own sign-in details by email.</p>
    </div>
  );
}

const Privacy = () => (
  <p className="flex items-start justify-center gap-1.5 text-center text-xs text-slate-500"><ShieldCheck size={14} className="mt-px shrink-0" /> We only use your name and email address. No card needed for the free trial.</p>
);

/** The school is ready: User ID, where the password went, and the way into the admin dashboard. */
export function SignupDone({ result }: { result: SignupResult }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-4">
      <Alert tone="success"><span className="inline-flex items-start gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /> {result.school.name} is ready. Your free trial includes every feature until {new Date(result.trialEndsAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}.</span></Alert>
      <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Your User ID (school administrator)</div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="font-mono text-2xl font-bold tracking-wider">{result.loginId}</span>
          <Button variant="secondary" icon={copied ? Check : Copy} onClick={() => void navigator.clipboard.writeText(result.loginId).then(() => setCopied(true))}>{copied ? 'Copied' : 'Copy'}</Button>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          School address: <strong>{result.signInUrl.replace(/\/login$/, '')}</strong>.
          {result.passwordSentTo && <> Your password was emailed to <strong>{result.passwordSentTo}</strong>.</>}
        </p>
      </div>
      <Button className="w-full py-3" icon={Rocket} onClick={() => window.location.assign(result.continueUrl)}>Open my admin dashboard</Button>
    </div>
  );
}

/**
 * After "Continue with Google": the school's name, then a 6-digit code emailed to that Google
 * address (Google proves the account is real; the code proves this person reads its inbox).
 */
export function ProviderSignupFinish({ provider, credential, nonce, email, name }: { provider: SocialProvider; credential: string; nonce: string; email?: string; name?: string }) {
  const config = useAuthConfig();
  const codeNeeded = config.data?.emailVerification !== 'off';
  const [schoolName, setSchoolName] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<SignupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (result) return <SignupDone result={result} />;
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e, 'Your school could not be created. Please try again.'));
    } finally {
      setBusy(false);
    }
  };
  const create = (extra: Partial<QuickSignupBody> = {}) => run(async () => setResult(await marketingService.quickSignup({ schoolName: schoolName.trim(), provider, credential, nonce, ...extra })));
  const sendCode = () =>
    run(async () => {
      if (!codeNeeded) return void (await create());
      if (!email) throw new Error('Your Google email could not be read. Please continue with Google again.');
      const r = await marketingService.signupCode(email.toLowerCase());
      if (r.skipped || !r.verificationId) return void (await create());
      setVerificationId(r.verificationId);
      setCode('');
    });

  const account = (
    <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-white/10">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Signed in with {PROVIDER_LABEL[provider]}</div>
      <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">{name ?? email}</div>
      {name && email && <div className="text-slate-500">{email}</div>}
    </div>
  );

  if (verificationId) {
    return (
      <form onSubmit={onSubmit(() => void create({ verificationId, code }))} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {account}
        <Alert tone="info">To confirm it is really you, we sent a 6-digit code to <strong>{email}</strong>. It is valid for 10 minutes.</Alert>
        <Field label="Verification code">
          <Input required autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="font-mono text-2xl tracking-[0.4em]" />
        </Field>
        <Button type="submit" icon={MailCheck} loading={busy} className="w-full py-3" disabled={code.length !== 6}>Verify &amp; create my school</Button>
        <div className="flex items-center justify-between gap-3 text-sm">
          <button type="button" onClick={() => { setError(null); setVerificationId(null); }} className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:underline dark:text-slate-300"><ArrowLeft size={15} /> Back</button>
          <button type="button" disabled={busy} onClick={() => void sendCode()} className="font-semibold text-orange-700 hover:underline disabled:opacity-50 dark:text-orange-300">Send a new code</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit(() => void sendCode())} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      {account}
      <AdminNotice />
      <Field label="Your school’s name"><Input required autoFocus maxLength={150} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Greenfield High School" /></Field>
      <Button type="submit" icon={ArrowRight} loading={busy} className="w-full py-3" disabled={!schoolName.trim()}>{codeNeeded ? 'Continue' : 'Create my school'}</Button>
      <Privacy />
    </form>
  );
}

type Step = 'choose' | 'email' | 'details' | 'code' | 'done';

/**
 * The free-trial sign-up in the familiar format: Continue with Google or with email. Google goes
 * through Google and comes back for the school's name; email asks for the address,
 * then the school and the person's name. A password is generated and emailed; the person lands on
 * their admin dashboard.
 */
export function QuickSignup() {
  const config = useAuthConfig();
  const codeNeeded = config.data?.emailVerification !== 'off';
  const [step, setStep] = useState<Step>('choose');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [result, setResult] = useState<SignupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
  const create = (extra: Partial<QuickSignupBody> = {}) =>
    run(async () => {
      setResult(await marketingService.quickSignup({ schoolName: schoolName.trim(), email: email.trim(), name: name.trim(), ...extra }));
      setStep('done');
    });
  const submitDetails = () =>
    run(async () => {
      if (!codeNeeded) return create();
      const r = await marketingService.signupCode(email.trim());
      if (r.skipped || !r.verificationId) return create();
      setVerificationId(r.verificationId);
      setCode('');
      setStep('code');
    });
  const back = (to: Step) => (
    <button type="button" onClick={() => { setError(null); setStep(to); }} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"><ArrowLeft size={15} /> Back</button>
  );

  if (step === 'done' && result) return <SignupDone result={result} />;

  if (step === 'code') {
    return (
      <form onSubmit={onSubmit(() => void create({ verificationId, code }))} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Alert tone="info">We sent a 6-digit code to <strong>{email}</strong>.</Alert>
        <Field label="Verification code">
          <Input required autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="font-mono text-2xl tracking-[0.4em]" />
        </Field>
        <div className="flex items-center justify-between gap-3">{back('details')}<Button type="submit" icon={MailCheck} loading={busy} disabled={code.length !== 6}>Verify &amp; create my school</Button></div>
      </form>
    );
  }

  if (step === 'details') {
    return (
      <form onSubmit={onSubmit(() => void submitDetails())} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-white/10">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Your email</div>
          <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">{email}</div>
        </div>
        <Field label="Your school’s name"><Input required autoFocus maxLength={150} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Greenfield High School" /></Field>
        <Field label="Your full name"><Input required maxLength={200} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ayesha Khan" /></Field>
        <Button type="submit" icon={ArrowRight} loading={busy} className="w-full py-3" disabled={!schoolName.trim() || !name.trim()}>Create my school</Button>
        <div className="flex justify-center">{back('email')}</div>
      </form>
    );
  }

  if (step === 'email') {
    return (
      <form onSubmit={onSubmit(() => setStep('details'))} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Email address"><Input required autoFocus type="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
        <Button type="submit" icon={ArrowRight} className="w-full py-3">Continue</Button>
        <div className="flex justify-center">{back('choose')}</div>
        <Privacy />
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-base font-semibold text-slate-900 dark:text-white">Create your school account</p>
        <p className="mt-1 text-sm text-slate-500">A free trial of every feature. Ready in a minute.</p>
      </div>
      {error && <Alert>{error}</Alert>}
      <AdminNotice />
      <SocialButtons onProvider={(provider) => startSso({ provider, purpose: 'signup' })} onEmail={() => setStep('email')} />
      <Privacy />
    </div>
  );
}
