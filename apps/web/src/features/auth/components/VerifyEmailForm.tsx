import { MailCheck, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input } from '@/components/ui';
import { authService, type CodeSent } from '@/features/auth/authService';
import { useAuth } from '@/features/auth/AuthProvider';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/**
 * Email + 6-digit code. Step 1 sends a code to the address (which may be changed); step 2 confirms
 * it, and the address becomes the account's verified email (used for "forgot password").
 */
export function VerifyEmailForm({ initialEmail, onDone }: { initialEmail: string | null; onDone?: (email: string) => void }) {
  const { reload } = useAuth();
  const [email, setEmail] = useState(initialEmail ?? '');
  const [sent, setSent] = useState<CodeSent | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await authService.sendEmailCode(email.trim().toLowerCase() === (initialEmail ?? '') ? undefined : email.trim());
      setSent(r);
      setCode('');
      setWait(r.resendInSeconds);
    } catch (e) {
      setError(errorMessage(e, 'Could not send the code.'));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!sent) return;
    setBusy(true);
    setError(null);
    try {
      const r = await authService.verifyEmail(sent.verificationId, code.trim());
      await reload();
      onDone?.(r.email);
    } catch (e) {
      setError(errorMessage(e, 'Could not verify the code.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <Alert>{error}</Alert>}
      {!sent ? (
        <form onSubmit={onSubmit(() => void send())} className="space-y-4">
          <Field label="Your email" hint="We send a 6-digit code to this address. It is used for password reset and school messages.">
            <Input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <div className="flex justify-end"><Button type="submit" icon={Send} loading={busy}>Send code</Button></div>
        </form>
      ) : (
        <form onSubmit={onSubmit(() => void verify())} className="space-y-4">
          <Alert tone="info">We sent a code to <strong>{sent.email}</strong>. It expires in {Math.round(sent.expiresInSeconds / 60)} minutes.</Alert>
          <Field label="6-digit code">
            <Input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="font-mono text-2xl tracking-[0.4em]"
              autoFocus
            />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3 text-sm">
              <button type="button" disabled={wait > 0 || busy} onClick={() => void send()} className="font-semibold text-orange-700 hover:underline disabled:text-slate-400 disabled:no-underline dark:text-orange-300">
                {wait > 0 ? `Resend in ${wait}s` : 'Resend code'}
              </button>
              <button type="button" onClick={() => setSent(null)} className="font-semibold text-slate-600 hover:underline dark:text-slate-300">Use another email</button>
            </div>
            <Button type="submit" icon={MailCheck} loading={busy} disabled={code.length !== 6}>Verify</Button>
          </div>
        </form>
      )}
    </div>
  );
}
