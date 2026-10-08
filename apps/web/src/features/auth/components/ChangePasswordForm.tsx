import { Check, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Field, Input } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

const MIN = 12;

/** Current + new + confirm password. Used on the forced first-sign-in screen and in the account dialog. */
export function ChangePasswordForm({ onDone, submitLabel = 'Change password' }: { onDone?: () => void; submitLabel?: string }) {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rules = [
    { ok: next.length >= MIN, label: `At least ${MIN} characters` },
    { ok: /[A-Za-z]/.test(next) && /\d/.test(next), label: 'Letters and numbers' },
    { ok: next.length > 0 && next !== current, label: 'Different from the current password' },
    { ok: next.length > 0 && next === confirm, label: 'Both new passwords match' },
  ];
  const valid = rules.every((r) => r.ok);

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await changePassword(current, next);
      onDone?.();
    } catch (e) {
      setError(errorMessage(e, 'Could not change the password.'));
    } finally {
      setBusy(false);
    }
  };

  const type = show ? 'text' : 'password';
  return (
    <form onSubmit={onSubmit(() => void submit())} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <Field label="Current password">
        <Input type={type} required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </Field>
      <Field label="New password">
        <Input type={type} required minLength={MIN} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      <Field label="Confirm new password">
        <Input type={type} required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      <ul className="space-y-1 text-sm">
        {rules.map((r) => (
          <li key={r.label} className={`flex items-center gap-2 ${r.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
            <Check size={14} className={r.ok ? '' : 'opacity-30'} /> {r.label}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300">
          {show ? <EyeOff size={15} /> : <Eye size={15} />} {show ? 'Hide passwords' : 'Show passwords'}
        </button>
        <Button type="submit" loading={busy} disabled={!valid}>{submitLabel}</Button>
      </div>
    </form>
  );
}
