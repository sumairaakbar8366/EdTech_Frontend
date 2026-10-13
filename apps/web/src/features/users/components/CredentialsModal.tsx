import { Check, Copy, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Modal } from '@/components/ui';
import { useSchoolUser } from '@/features/auth/usePermissions';
import { loginMessage, type LoginHandover } from '@/features/users/users';

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      icon={done ? Check : Copy}
      onClick={() => void navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1800); })}
    >
      {done ? 'Copied' : label}
    </Button>
  );
}

function LoginCard({ c, schoolName }: { c: LoginHandover; schoolName: string }) {
  return (
    <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</dt><dd className="truncate font-semibold">{c.user.firstName} {c.user.lastName}</dd></div>
        <dd className="text-sm text-slate-500">{c.user.roles.map((r) => r.name).join(', ')}</dd>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Signs in with</dt>
          <dd className="truncate text-lg font-bold">{c.user.email ?? c.user.loginId}</dd>
          <dd className="text-sm text-slate-500">User ID <span className="font-mono">{c.user.loginId}</span></dd>
        </div>
        <CopyButton text={c.user.email ?? c.user.loginId} label="Copy" />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Temporary password</dt><dd className="select-all font-mono text-xl font-bold tracking-wider">{c.temporaryPassword}</dd></div>
        <CopyButton text={c.temporaryPassword} label="Copy" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="min-w-0">
          {!c.user.email
            ? 'No email on file: they sign in with the User ID. Hand these details over in person.'
            : c.user.emailVerified
              ? <>Also emailed to <strong>{c.user.email}</strong> (verified), with the temporary password.</>
              : <>The account details were emailed to <strong>{c.user.email}</strong>; they confirm that email with a code after first sign-in.</>}
        </span>
        <CopyButton text={loginMessage(c, schoolName)} label="Copy login details" />
      </div>
    </dl>
  );
}

/**
 * Shows new (or reset) logins once, with copy actions to hand them over: the User ID they sign in
 * with and the temporary password they must replace at first sign-in.
 */
export function CredentialsModal({ credentials, title, onClose }: { credentials: LoginHandover | LoginHandover[] | null; title: string; onClose: () => void }) {
  const me = useSchoolUser();
  const list = credentials ? (Array.isArray(credentials) ? credentials : [credentials]) : [];
  if (!list.length) return null;
  const schoolName = me.school?.name ?? 'school';
  return (
    <Modal open size={list.length > 1 ? 'lg' : 'md'} title={title} onClose={onClose} footer={<Button onClick={onClose}>Done</Button>}>
      <div className="space-y-4">
        <Alert tone="info">
          <span className="inline-flex items-start gap-2">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            {list.length > 1 ? 'These passwords are' : 'This password is'} shown only once. Share {list.length > 1 ? 'them' : 'it'} now; each person chooses their own password at first sign-in. If one is lost, use “Reset password” in Users &amp; Access.
          </span>
        </Alert>
        {list.map((c) => <LoginCard key={c.user.loginId} c={c} schoolName={schoolName} />)}
      </div>
    </Modal>
  );
}
