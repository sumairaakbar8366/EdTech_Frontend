import { useLocation } from 'react-router';
import { FEATURE_BY_SEGMENT, useSubscription } from '@/features/billing/billing';
import { LockedFeature } from '@/features/billing/components/LockedFeature';
import { SubscriptionBanner } from '@/features/billing/components/SubscriptionBanner';
import { AppShell } from '@/layouts/AppShell/AppShell';
import type { ComponentProps } from 'react';

/**
 * The school's AppShell with its plan applied: menu entries outside the plan get a lock, opening
 * them shows what upgrading unlocks, and the trial / renewal / read-only banner sits above pages.
 */
export function SchoolShell({ area, isAdmin, ...props }: ComponentProps<typeof AppShell> & { area: string; isAdmin: boolean }) {
  const { pathname } = useLocation();
  const sub = useSubscription().data;
  const has = (feature: string | undefined) => !feature || !sub || sub.features.includes(feature as never);
  const nav = props.nav.map((n) => ({ ...n, locked: !has(FEATURE_BY_SEGMENT[n.path.split('/')[2] ?? '']) }));
  const segment = pathname.split('/').filter(Boolean)[1] ?? '';
  const feature = FEATURE_BY_SEGMENT[segment];
  const locked = feature && !has(feature) ? <LockedFeature feature={feature} isAdmin={isAdmin} /> : undefined;
  void area;
  // The school's theme colour is a plan feature; without it the standard colours apply.
  const brandColor = sub?.features.includes('theme') ? props.brandColor : null;
  return <AppShell {...props} brandColor={brandColor} nav={nav} banner={<SubscriptionBanner state={sub} isAdmin={isAdmin} />} override={locked} />;
}
