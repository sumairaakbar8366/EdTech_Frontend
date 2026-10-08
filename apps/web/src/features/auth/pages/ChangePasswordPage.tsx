import { KeyRound, LogOut } from 'lucide-react';
import { Backdrop } from '@/components/effects/Backdrop';
import { IconTile } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';

/**
 * Shown instead of the app while the user still has an administrator-issued password
 * (first sign-in, or after a reset). The API refuses every other request until it is changed.
 */
export function ChangePasswordPage() {
  const { me, logout } = useAuth();
  const name = me?.scope === 'school' ? `${me.user.firstName} ${me.user.lastName}` : '';
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <Backdrop variant="hero" />
      <div className="surface w-full max-w-md rounded-xl p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <IconTile icon={KeyRound} size="lg" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Set your own password</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome{name ? `, ${name}` : ''}. Your school gave you a temporary password; choose a new one to continue.</p>
          </div>
        </div>
        <ChangePasswordForm submitLabel="Save and continue" />
        <button onClick={() => void logout()} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}
