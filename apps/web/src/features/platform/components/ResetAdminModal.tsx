import { useQuery } from '@tanstack/react-query';
import { Check, Copy, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, EmptyState, Modal, Spinner } from '@/components/ui';
import type { SchoolSummary } from '@/features/platform/types/platform.types';
import { schoolUrl } from '@/features/platform/utils/platform.utils';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';

interface SchoolAdmin { id: string; loginId: string; firstName: string; lastName: string; email: string | null; status: string; lastLoginAt: string | null }

/** Account recovery for a locked-out school admin: a one-time temporary password. */
export function ResetAdminModal({ school, onClose }: { school: SchoolSummary | null; onClose: () => void }) {
  const admins = useQuery({ queryKey: ['platform', 'school-admins', school?.id], queryFn: () => api<SchoolAdmin[]>(`/platform/schools/${school!.id}/admins`), enabled: !!school });
  const [result, setResult] = useState<{ loginId: string; password: string; emailedTo: string | null } | null>(null);
  const [copied, setCopied] = useState(false);
  const reset = useAction((userId: string) => api<{ user: SchoolAdmin; temporaryPassword: string; emailedTo: string | null }>(`/platform/schools/${school!.id}/admins/${userId}/reset-password`, { method: 'POST' }), {
    onDone: (r) => setResult({ loginId: r.user.loginId, password: r.temporaryPassword, emailedTo: r.emailedTo }),
  });
  const close = () => { setResult(null); setCopied(false); onClose(); };
  if (!school) return null;
  const message = result ? `Your ${school.name} admin password has been reset.\nSign in at: ${schoolUrl(school.slug)}/login\nUser ID: ${result.loginId}\nTemporary password: ${result.password}\nYou will choose a new password when you sign in.` : '';
  return (
    <Modal open title={`Reset admin password · ${school.name}`} onClose={close} footer={<Button onClick={close}>Done</Button>}>
      {result ? (
        <div className="space-y-4">
          <Alert tone="info">
            {result.emailedTo ? <>The new sign-in details were emailed to <strong>{result.emailedTo}</strong>. </> : 'Not emailed (no email on file or sending failed): copy the details below and send them yourself. '}
            Shown only once. The admin must choose a new password at sign-in; their other sessions were signed out.
          </Alert>
          <div className="rounded-lg border border-slate-200 p-4 font-mono dark:border-white/10"><div>{result.loginId}</div><div className="text-xl font-bold tracking-wider">{result.password}</div></div>
          <Button variant="secondary" icon={copied ? Check : Copy} onClick={() => void navigator.clipboard.writeText(message).then(() => setCopied(true))}>{copied ? 'Copied' : 'Copy login details'}</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">Use this when a school admin has forgotten their password. Verify who is asking first (call the school’s registered number).</p>
          {admins.isLoading && <Spinner />}
          {admins.data?.length === 0 && <EmptyState icon={KeyRound} title="No admin logins" />}
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
            {admins.data?.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0"><div className="font-semibold">{a.firstName} {a.lastName}</div><div className="truncate text-sm text-slate-500"><span className="font-mono">{a.loginId}</span>{a.email ? ` · ${a.email}` : ''}{a.status !== 'active' ? ' · disabled' : ''}</div></div>
                <Button variant="secondary" icon={KeyRound} disabled={a.status !== 'active'} loading={reset.isPending && reset.variables === a.id} onClick={() => reset.mutate(a.id)}>Reset</Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
