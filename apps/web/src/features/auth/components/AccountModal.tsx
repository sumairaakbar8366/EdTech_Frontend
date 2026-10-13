import { BadgeCheck, IdCard, KeyRound, MailWarning } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Modal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { VerifyEmailForm } from '@/features/auth/components/VerifyEmailForm';

type View = 'overview' | 'email' | 'password';

/** "My account": the User ID (fixed), the personal email (verify / change) and the password. */
export function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me } = useAuth();
  const toast = useToast();
  const [view, setView] = useState<View>('overview');
  if (me?.scope !== 'school') return null;
  const u = me.user;
  const close = () => { setView('overview'); onClose(); };
  return (
    <Modal open={open} title={view === 'password' ? 'Change password' : view === 'email' ? (u.emailVerified ? 'Change email' : 'Verify email') : 'My account'} onClose={close}>
      {view === 'overview' && (
        <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500"><IdCard size={13} /> User ID</dt>
              <dd className="font-mono text-lg font-bold tracking-wider">{u.loginId}</dd>
            </div>
            <span className="text-xs text-slate-500">Used to sign in · never changes</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span className="truncate">{u.email ?? 'No email yet'}</span>
                {u.email && (u.emailVerified ? <Badge tone="emerald"><BadgeCheck size={12} className="mr-1 inline" />Verified</Badge> : <Badge tone="amber"><MailWarning size={12} className="mr-1 inline" />Not verified</Badge>)}
              </dd>
            </div>
            <Button variant="secondary" onClick={() => setView('email')}>{u.emailVerified ? 'Change' : 'Verify'}</Button>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</dt>
              <dd className="text-sm text-slate-500">Forgot it later? Use “Forgot password” on the sign-in page{u.emailVerified ? '' : ' (needs a verified email)'}.</dd>
            </div>
            <Button variant="secondary" icon={KeyRound} onClick={() => setView('password')}>Change</Button>
          </div>
        </dl>
      )}
      {view === 'email' && (
        <VerifyEmailForm
          initialEmail={u.emailVerified ? null : u.email}
          onDone={(email) => { toast.success(`Email verified: ${email}`); setView('overview'); }}
        />
      )}
      {view === 'password' && <ChangePasswordForm onDone={() => { toast.success('Password changed. Other devices have been signed out.'); setView('overview'); }} />}
      {view !== 'overview' && <button onClick={() => setView('overview')} className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white">← Back</button>}
    </Modal>
  );
}
