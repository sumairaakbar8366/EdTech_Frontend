import { ArrowRight, Building2, GraduationCap, IdCard, KeyRound, LogIn, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Alert, Button, Field, Input } from '@/components/ui';
import { normalizeSchoolSlug, schoolOrigin } from '@/config/site';
import { OrDivider, SocialButtons } from '@/features/auth/components/SocialButtons';
import { SchoolChoice } from '@/features/auth/components/SchoolChoice';
import { startSso } from '@/features/auth/sso';
import { marketingService, type SignInOutcome } from '@/features/marketing/services/marketingService';
import { ApiError } from '@/services/api/http';

type Choice = Extract<SignInOutcome, { choose: unknown }>['choose'];

/**
 * The single sign-in on the main domain, for the owner and every school: Google, or email / User
 * ID and password. One matching account continues straight to its dashboard; when the same User ID
 * or email exists at several schools, the person picks the school.
 */
export function MainLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [choices, setChoices] = useState<Choice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [school, setSchool] = useState('');

  const signIn = async (pick?: string) => {
    setBusy(true);
    setError(null);
    try {
      const r = await marketingService.login({ identifier: identifier.trim(), password, remember, ...(pick && { school: pick }) });
      if ('continueUrl' in r) return window.location.assign(r.continueUrl);
      setChoices(r.choose);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : e instanceof ApiError && e.status < 500 ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const openForgot = () => {
    const slug = normalizeSchoolSlug(school);
    if (!slug) return setError('Enter your school’s address, e.g. greenfield-high.');
    window.location.assign(`${schoolOrigin(slug)}/forgot-password`);
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-[var(--page-bg)] p-4 sm:p-8">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-display text-lg font-bold uppercase text-slate-900 dark:text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white"><GraduationCap size={21} /></span> SchoolERP
        </Link>
        <div className="surface rounded-2xl p-6 shadow-depth-3 sm:p-8">
          {choices ? (
            <SchoolChoice choices={choices} busy={busy} error={error} onPick={(s) => void signIn(s)} onBack={() => { setChoices(null); setError(null); }} />
          ) : forgot ? (
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reset your password</h1>
                <p className="mt-1 text-sm text-slate-500">Passwords are reset by your school. Enter its address to continue.</p>
              </div>
              {error && <Alert>{error}</Alert>}
              <Field label="Your school’s address" hint="The name after the domain, e.g. greenfield-high">
                <Input autoFocus value={school} onChange={(e) => setSchool(e.target.value)} placeholder="greenfield-high" />
              </Field>
              <Button className="w-full py-3" icon={ArrowRight} onClick={openForgot}>Continue</Button>
              <button type="button" onClick={() => { setForgot(false); setError(null); }} className="w-full text-center text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300">← Back to sign in</button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
                <p className="mt-1 text-sm text-slate-500">School staff, students, parents and the SchoolERP owner</p>
              </div>
              {error && <Alert>{error}</Alert>}
              <SocialButtons onProvider={(provider) => startSso({ provider, purpose: 'login' })} />
              <OrDivider />
              <form onSubmit={(e) => { e.preventDefault(); void signIn(); }} className="space-y-4">
                <Field label="Email or User ID" hint="Your email (e.g. Gmail) or User ID, e.g. STU-2026-0142">
                  <div className="relative">
                    {identifier && !identifier.includes('@') && /^[a-z]{3}-/i.test(identifier) ? <IdCard size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /> : <Mail size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
                    <Input required autoFocus autoComplete="username" autoCapitalize="none" spellCheck={false} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@gmail.com or STU-2026-0142" className="pl-10" />
                  </div>
                </Field>
                <Field label="Password">
                  <div className="relative">
                    <KeyRound size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="pl-10" />
                  </div>
                </Field>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-primary-600" /> Keep me signed in
                  </label>
                  <button type="button" onClick={() => { setForgot(true); setError(null); }} className="text-sm font-semibold text-orange-700 hover:underline dark:text-orange-300">Forgot password?</button>
                </div>
                <Button type="submit" icon={LogIn} loading={busy} className="w-full py-3">Sign in</Button>
              </form>
            </div>
          )}
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-sm text-slate-500">
          <Building2 size={15} /> New school? <Link to="/access?mode=signup" className="font-semibold text-primary-700 hover:underline dark:text-primary-300">Start a free trial</Link>
        </p>
      </div>
    </main>
  );
}
