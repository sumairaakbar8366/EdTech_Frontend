import { Lock, LogOut, ShieldCheck } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import { Button } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import type { SubscriptionState } from '@/features/billing/billing';

/**
 * Shown on every page once the trial (or plan) and its grace days have ended. The school is locked:
 * nothing is deleted, and the admin can pay to unlock everything at once.
 */
export function SubscriptionEnded({ state, isAdmin }: { state: SubscriptionState; isAdmin: boolean }) {
  const { logout } = useAuth();
  const trial = state.status === 'trialing';
  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="surface rounded-2xl p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400"><Lock size={28} /></span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{trial ? 'Your free trial has ended' : 'Your subscription has ended'}</h1>
        {isAdmin ? (
          <>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              The school is locked until a plan is chosen. Your data is safe: nothing has been deleted, and paying unlocks everything immediately for every user.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <AreaLink to="/billing" className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-base font-bold text-white hover:bg-orange-700">Choose a plan &amp; pay</AreaLink>
              <Button variant="secondary" icon={LogOut} onClick={() => void logout()}>Sign out</Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              Your school’s SchoolERP subscription needs to be renewed. Please contact your school office; as soon as they renew, you can continue where you left off.
            </p>
            <div className="mt-6 flex justify-center"><Button variant="secondary" icon={LogOut} onClick={() => void logout()}>Sign out</Button></div>
          </>
        )}
        <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500"><ShieldCheck size={15} /> Records, attendance, fees and results are all kept.</p>
      </div>
    </div>
  );
}
