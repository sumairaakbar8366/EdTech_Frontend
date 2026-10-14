import { useLocation } from 'react-router';
import { FEATURE_BY_SEGMENT, useSubscription } from '@/features/billing/billing';
import { LockedFeature } from '@/features/billing/components/LockedFeature';
import { SubscriptionEnded } from '@/features/billing/components/SubscriptionEnded';
import { SubscriptionBanner } from '@/features/billing/components/SubscriptionBanner';
import { AppShell } from '@/layouts/AppShell/AppShell';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { SupportBanner } from '@/features/billing/components/SupportBanner';
import type { ComponentProps } from 'react';

/**
 * The school's AppShell with its plan applied: menu entries outside the plan get a lock, opening
 * them shows what upgrading unlocks, and the trial / renewal / read-only banner sits above pages.
 */
export function SchoolShell({ area, isAdmin, ...props }: ComponentProps<typeof AppShell> & { area: string; isAdmin: boolean }) {
  const { pathname } = useLocation();
  const subscription = useSubscription();
  const sub = subscription.data;
  const { me } = useAuth();
  const support = me?.scope === 'school' ? me.support ?? null : null;
  const has = (feature: string | undefined) => !feature || !sub || sub.features.includes(feature as never);
  const nav = props.nav.map((n) => ({ ...n, locked: !has(FEATURE_BY_SEGMENT[n.path.split('/')[2] ?? '']) }));
  const segment = pathname.split('/').filter(Boolean)[1] ?? '';
  const feature = FEATURE_BY_SEGMENT[segment];
  // A locked school (trial/plan and grace over) shows the paywall everywhere except the billing page.
  // The owner's support session may work in a locked school.
  const ended = sub?.locked && !support && !(isAdmin && segment === 'billing');
  // Until the plan is known, pages wait: a locked school would otherwise flash a page whose every request is refused.
  const locked = subscription.isLoading ? <Spinner /> : ended ? <SubscriptionEnded state={sub} isAdmin={isAdmin} /> : feature && !has(feature) ? <LockedFeature feature={feature} isAdmin={isAdmin} /> : undefined;
  void area;
  // The school's theme colour is a plan feature; without it the standard colours apply.
  const brandColor = sub?.features.includes('theme') ? props.brandColor : null;
  return <AppShell {...props} brandColor={brandColor} nav={nav} banner={<>{support && <SupportBanner name={support.name} />}<SubscriptionBanner state={sub} isAdmin={isAdmin} /></>} override={locked} />;
}
