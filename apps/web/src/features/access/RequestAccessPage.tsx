import { BadgeCheck, CheckCircle2, KeyRound, Mail, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Field, Input, Spinner } from '@/components/ui';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { OrDivider, SocialButtons } from '@/features/auth/components/SocialButtons';
import { startSso } from '@/features/auth/sso';
import { accessService, ROLE_HELP, type RequestRole } from '@/features/access/access';
import { DynamicFields } from '@/features/forms/components/DynamicFields';
import { missingRequired, type Answers } from '@/features/forms/forms';
import { takeGoogleReturn } from '@/features/registration/registration';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/**
 * A school's "Request access" page. The person proves their email (Google or a code), says who they
 * are, and the school's administrator decides. Nothing is created and nothing is emailed until the
 * administrator approves; then the User ID and password arrive by email.
 */
export function RequestAccessPage({ slug }: { slug: string }) {
  const info = useQuery({ queryKey: ['access-form'], queryFn: accessService.form });
  const [email, setEmail] = useState('');
  const [proof, setProof] = useState('');
  const [vid, setVid] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [first, setFirst] = useState(''); const [last, setLast] = useState(''); const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RequestRole | ''>('');
  const [note, setNote] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const g = takeGoogleReturn();
    if (g) { setEmail(g.email); setProof(g.proof); setFirst((f) => f || (g.name ?? '').split(' ')[0] || ''); setLast((l) => l || (g.name ?? '').split(' ').slice(1).join(' ')); }
  }, []);

  const run = async (fn: () => Promise<void>) => { setBusy(true); setError(null); try { await fn(); } catch (e) { setError(errorMessage(e, 'Something went wrong. Please try again.')); } finally { setBusy(false); } };
  const form = info.data;
  const errors = form ? missingRequired(form.form, answers) : {};
  const ready = proof && first.trim() && last.trim() && role && note.trim() && Object.keys(errors).length === 0;

  if (done) {
    return (
      <AuthCard icon={CheckCircle2} title="Request sent" sub={info.data?.schoolName} back={false}>
        <Alert tone="success">{done}</Alert>
        <Link to="/" className="mt-5 inline-block text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white">← Back to the school’s website</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={KeyRound} title="Request access" sub={info.data ? `Ask ${info.data.schoolName} for a login` : undefined}>
      {info.isLoading || !form ? <Spinner /> : (
        <div className="space-y-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">First we confirm your email. Then the school’s administrator checks who you are. If they approve, your <strong>User ID and password are emailed to you</strong>; nobody gets in before that.</p>
          {error && <Alert>{error}</Alert>}

          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"><Mail size={16} /> 1. Confirm your email {proof && <span className="inline-flex items-center gap-1 normal-case text-emerald-600"><BadgeCheck size={15} /> {email}</span>}</h2>
            {proof ? (
              <button type="button" className="mt-2 text-sm font-semibold text-orange-700 hover:underline dark:text-orange-300" onClick={() => setProof('')}>Use another email</button>
            ) : vid ? (
              <form className="mt-3 space-y-3" onSubmit={onSubmit(() => void run(async () => { const r = await accessService.emailVerify({ email: email.trim().toLowerCase(), verificationId: vid, code }); setEmail(r.email); setProof(r.proof); setVid(null); }))}>
                <Alert tone="info">We sent a 6-digit code to <strong>{email}</strong>.</Alert>
                <Input required autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="font-mono text-2xl tracking-[0.4em]" aria-label="6-digit code" />
                <div className="flex gap-2"><Button type="submit" loading={busy} disabled={code.length !== 6}>Verify</Button><Button variant="ghost" onClick={() => setVid(null)}>Change email</Button></div>
              </form>
            ) : (
              <div className="mt-3 space-y-3">
                <SocialButtons onProvider={(p) => startSso({ provider: p, purpose: 'access', school: slug })} />
                <OrDivider />
                <form className="flex flex-wrap items-end gap-3" onSubmit={onSubmit(() => void run(async () => { const r = await accessService.emailCode(email.trim().toLowerCase()); setVid(r.verificationId); setCode(''); }))}>
                  <div className="min-w-[12rem] flex-1"><Field label="Email address"><Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field></div>
                  <Button type="submit" loading={busy} disabled={!/^\S+@\S+\.\S+$/.test(email)}>Send code</Button>
                </form>
              </div>
            )}
          </div>

          <form className={`space-y-4 ${proof ? '' : 'pointer-events-none opacity-50'}`} aria-disabled={!proof} onSubmit={onSubmit(() => {
            setTried(true);
            if (!ready) return;
            void run(async () => { const r = await accessService.submit({ firstName: first.trim(), lastName: last.trim(), phone: phone.trim() || undefined, role: role as RequestRole, note: note.trim(), email, emailProof: proof, answers }); setDone(r.message); });
          })}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">2. Who are you?</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" required><Input required value={first} onChange={(e) => setFirst(e.target.value)} /></Field>
              <Field label="Last name" required><Input required value={last} onChange={(e) => setLast(e.target.value)} /></Field>
              <Field label="Phone (optional)"><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            </div>
            <fieldset>
              <legend className="mb-1 block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">I am a…</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {form.roles.map((r) => (
                  <label key={r.key} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-base font-semibold transition ${role === r.key ? 'border-primary-500 bg-primary-500/10 text-primary-800 dark:text-primary-200' : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5'}`}>
                    <input type="radio" name="role" className="h-4 w-4" checked={role === r.key} onChange={() => setRole(r.key)} /> {ROLE_HELP[r.key]?.label ?? r.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {role && <Field label={ROLE_HELP[role].note} hint="So the administrator can recognise you" required><Input required maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} /></Field>}
            {form.form.fields.length > 0 && (
              <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-white/10">
                {form.form.intro && <p className="text-sm text-slate-600 dark:text-slate-300">{form.form.intro}</p>}
                <DynamicFields form={form.form} answers={answers} onChange={setAnswers} errors={tried ? errors : {}} />
              </div>
            )}
            <Button type="submit" className="w-full py-3" icon={Send} loading={busy} disabled={!proof}>Send request to the school</Button>
          </form>
        </div>
      )}
    </AuthCard>
  );
}
