import { IdCard, KeyRound, LogOut, MailCheck, MailQuestion } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Alert, Button, Field, Input } from '@/components/ui';
import { authService } from '@/features/auth/authService';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { VerifyEmailForm } from '@/features/auth/components/VerifyEmailForm';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import type { Tenant } from '@/types/session';

/** "Forgot password": a reset link goes to the account's verified email. */
export function ForgotPasswordPage({ tenant }: { tenant: Tenant }) {
  const school = tenant.kind === 'school';
  const [identifier, setIdentifier] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await authService.forgotPassword(identifier.trim());
      setDone(true);
    } catch (e) {
      setError(errorMessage(e, 'Could not send the link.'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthCard icon={KeyRound} title="Forgot your password?" sub={school ? 'Enter your email (or User ID). We email a reset link to the verified address on your account.' : 'Enter your console email. We email you a reset link.'}>
      {done ? (
        <Alert tone="success">
          If that account exists and has a verified email, a reset link is on its way. It works once, for 30 minutes.
          {school && <> No email? Your school office can reset your password in Users &amp; Access.</>}
        </Alert>
      ) : (
        <form onSubmit={onSubmit(() => void submit())} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label={school ? 'Email or User ID' : 'Email'}>
            <Input required autoFocus type={school ? 'text' : 'email'} inputMode="email" autoComplete="username" maxLength={254} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@gmail.com" />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {school ? <Link to="/forgot-user-id" className="text-sm font-semibold text-orange-700 hover:underline dark:text-orange-300">Forgot your User ID?</Link> : <span />}
            <Button type="submit" loading={busy}>Send reset link</Button>
          </div>
        </form>
      )}
    </AuthCard>
  );
}

/** "Forgot User ID": every User ID at this school with that verified email is emailed. */
export function ForgotUserIdPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await authService.forgotUserId(email.trim());
      setDone(true);
    } catch (e) {
      setError(errorMessage(e, 'Could not send your User ID.'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthCard icon={IdCard} title="Forgot your User ID?" sub="Enter the email you verified. We send every User ID at this school that uses it.">
      {done ? (
        <Alert tone="success">If accounts use that email, their User IDs are on their way. Not received? Ask your school office: they can see your User ID in Users &amp; Access.</Alert>
      ) : (
        <form onSubmit={onSubmit(() => void submit())} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="Email"><Input type="email" required autoFocus maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
          <div className="flex justify-end"><Button type="submit" loading={busy}>Email my User ID</Button></div>
        </form>
      )}
    </AuthCard>
  );
}

/** The page a reset link opens: choose a new password. */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [valid, setValid] = useState<boolean | null>(null);
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (token.length < 20) return setValid(false);
    authService.checkResetToken(token).then((r) => setValid(r.valid), () => setValid(false));
  }, [token]);

  const ok = next.length >= 12 && /[A-Za-z]/.test(next) && /\d/.test(next) && next === confirm;
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await authService.resetPassword(token, next);
      setDone(true);
    } catch (e) {
      setError(errorMessage(e, 'Could not reset the password.'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthCard icon={KeyRound} title="Choose a new password" sub="At least 12 characters, with letters and numbers.">
      {valid === null ? (
        <p className="text-sm text-slate-500">Checking the link…</p>
      ) : !valid ? (
        <Alert>This reset link has expired or was already used. <Link to="/forgot-password" className="font-semibold underline">Ask for a new one</Link>.</Alert>
      ) : done ? (
        <div className="space-y-4">
          <Alert tone="success">Your password was changed and every device was signed out. Sign in with the new password.</Alert>
          <Button className="w-full" onClick={() => navigate('/login', { replace: true })}>Go to sign in</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit(() => void submit())} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="New password"><Input type="password" required minLength={12} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
          <Field label="Confirm new password"><Input type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
          {confirm && next !== confirm && <p className="text-sm text-rose-600">The passwords do not match.</p>}
          <div className="flex justify-end"><Button type="submit" loading={busy} disabled={!ok}>Save password</Button></div>
        </form>
      )}
    </AuthCard>
  );
}

/**
 * After the first password change: the person confirms their own email with a code, so they can
 * reset their password themselves later. Students without an email may skip it.
 */
export function VerifyEmailPage({ optional, onSkip }: { optional: boolean; onSkip: () => void }) {
  const { me, logout } = useAuth();
  const user = me?.scope === 'school' ? me.user : null;
  return (
    <AuthCard
      icon={MailQuestion}
      back={false}
      title="Confirm your email"
      sub={<>Confirm your own email with a code: you sign in with it, reset your password with it and receive school messages on it. (Your User ID: <strong className="font-mono">{user?.loginId}</strong>.)</>}
    >
      <VerifyEmailForm initialEmail={user?.email ?? null} />
      <div className="mt-5 flex items-center justify-between">
        <button onClick={() => void logout()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"><LogOut size={15} /> Sign out</button>
        {optional && <button onClick={onSkip} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"><MailCheck size={15} /> Skip for now</button>}
      </div>
    </AuthCard>
  );
}
