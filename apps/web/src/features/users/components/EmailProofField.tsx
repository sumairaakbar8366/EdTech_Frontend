import { BadgeCheck, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input } from '@/components/ui';
import { usersService, type EmailProof } from '@/features/users/users';
import { errorMessage } from '@/lib/errors';

/**
 * The person's own email plus an optional 6-digit code check: the admin presses "Send code", the
 * person reads the code from their inbox and the admin types it in. With a code the email is saved
 * as verified (and the welcome email carries the temporary password); without one it stays
 * unverified and the person confirms it after their first sign-in.
 */
export function EmailProofField({ email, onEmailChange, onProof, label = 'Personal email' }: {
  email: string;
  onEmailChange: (email: string) => void;
  onProof: (proof: EmailProof | null) => void;
  label?: string;
}) {
  const [sentTo, setSentTo] = useState<{ email: string; verificationId: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  // A different address voids the code that was sent.
  const stale = !!sentTo && sentTo.email !== email.trim().toLowerCase();
  useEffect(() => {
    onProof(sentTo && !stale && code.length === 6 ? { verificationId: sentTo.verificationId, code } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentTo, stale, code]);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await usersService.emailCode(email.trim());
      setSentTo({ email: r.email, verificationId: r.verificationId });
      setCode('');
      setWait(r.resendInSeconds);
    } catch (e) {
      setError(errorMessage(e, 'Could not send the code.'));
    } finally {
      setBusy(false);
    }
  };

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <Field label={label} hint="Their own address (e.g. Gmail): they sign in with it, and it gets the welcome email, password resets and school messages.">
            <Input type="email" maxLength={254} value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="name@example.com" />
          </Field>
        </div>
        <Button type="button" variant="secondary" icon={Send} loading={busy} disabled={!valid || wait > 0} onClick={() => void send()}>
          {wait > 0 ? `${wait}s` : sentTo && !stale ? 'Resend' : 'Send code'}
        </Button>
      </div>
      {error && <Alert>{error}</Alert>}
      {sentTo && !stale && (
        <Field label={`Code sent to ${sentTo.email}`} hint="Ask the person to read the 6-digit code from their inbox. Optional: without it the email is saved as unverified.">
          <div className="flex items-center gap-2">
            <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="max-w-[12rem] font-mono text-xl tracking-[0.35em]" />
            {code.length === 6 && <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><BadgeCheck size={16} /> Checked when you save</span>}
          </div>
        </Field>
      )}
    </div>
  );
}
