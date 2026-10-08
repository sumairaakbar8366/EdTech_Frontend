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

/** Shows a new or reset temporary password once, with copy actions to hand it over. */
export function CredentialsModal({ credentials, title, onClose }: { credentials: LoginHandover | null; title: string; onClose: () => void }) {
  const me = useSchoolUser();
  if (!credentials) return null;
  const message = loginMessage(credentials, me.school?.name ?? 'school');
  return (
    <Modal open title={title} onClose={onClose} footer={<><CopyButton text={message} label="Copy login details" /><Button onClick={onClose}>Done</Button></>}>
      <div className="space-y-4">
        <Alert tone="info">
          <span className="inline-flex items-start gap-2"><ShieldAlert size={16} className="mt-0.5 shrink-0" /> This password is shown only once. Share it with {credentials.user.firstName} now; they will choose their own password at first sign-in. If it is lost, use “Reset password”.</span>
        </Alert>
        <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</dt><dd className="truncate font-semibold">{credentials.user.firstName} {credentials.user.lastName}</dd></div>
            <dd className="text-sm text-slate-500">{credentials.user.roles.map((r) => r.name).join(', ')}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Email (sign-in)</dt><dd className="truncate font-mono text-base">{credentials.user.email}</dd></div>
            <CopyButton text={credentials.user.email} label="Copy" />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Temporary password</dt><dd className="select-all font-mono text-xl font-bold tracking-wider">{credentials.temporaryPassword}</dd></div>
            <CopyButton text={credentials.temporaryPassword} label="Copy" />
          </div>
        </dl>
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">{message}</pre>
      </div>
    </Modal>
  );
}
