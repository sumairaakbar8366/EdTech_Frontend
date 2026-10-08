import { AlertTriangle, Clock, Lock } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import type { SubscriptionState } from '@/features/billing/billing';

/**
 * Plan status above every page: a gentle reminder in the last week of the trial, a clear warning
 * during the grace period, and read-only mode after it. Admins get the button to pay.
 */
export function SubscriptionBanner({ state, isAdmin }: { state: SubscriptionState | undefined; isAdmin: boolean }) {
  if (!state) return null;
  const days = state.daysLeft ?? 0;
  const plural = (n: number) => `${n} day${n === 1 ? '' : 's'}`;
  let tone = '';
  let icon = Clock;
  let text = '';
  if (state.phase === 'trial' && days <= 7) {
    tone = 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200';
    text = `Your free trial ends in ${plural(days)}. Choose a plan to keep everything running without interruption.`;
  } else if (state.phase === 'active' && days <= 5) {
    tone = 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200';
    text = `Your ${state.tier?.name} plan renews in ${plural(days)}.`;
  } else if (state.phase === 'grace') {
    tone = 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200';
    icon = AlertTriangle;
    text = `Your ${state.status === 'trialing' ? 'free trial' : 'subscription'} has ended. Full access continues for ${plural(days)}; after that the portal becomes read-only until payment.`;
  } else if (state.phase === 'expired') {
    tone = 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200';
    icon = Lock;
    text = isAdmin
      ? 'Read-only mode: your data is safe and everyone can still sign in, view records and take attendance. Choose a plan to make changes again.'
      : 'The school’s subscription is being renewed. You can view everything; some changes are paused for now.';
  } else return null;
  const Icon = icon;
  return (
    <div className={`mb-5 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${tone}`} role="status">
      <Icon size={18} className="shrink-0" />
      <p className="min-w-0 flex-1 text-sm font-medium">{text}</p>
      {isAdmin && (
        <AreaLink to="/billing" className="rounded-lg bg-orange-600 px-3.5 py-1.5 text-sm font-bold text-white hover:bg-orange-700">
          {state.phase === 'active' ? 'Renew' : 'Choose a plan'}
        </AreaLink>
      )}
    </div>
  );
}
