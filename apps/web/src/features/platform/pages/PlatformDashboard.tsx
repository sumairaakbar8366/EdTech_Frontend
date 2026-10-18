import { Building2, CircleCheck, ClipboardList, Crown, Hourglass, School, Sun } from 'lucide-react';
import { Badge, Card, CompactNumber, EmptyState, IconTile, Spinner, StatCard } from '@/components/ui';
import { AreaLink } from '@/app/router/area';
import type { HeroSlide } from '@/components/motion/HeroSlides';
import { HeroBanner } from '@/components/shared/HeroBanner';
import { greeting, todayLabel } from '@/features/dashboards/utils/dashboard.utils';
import { useSchoolApplications, useSchools, useTiers } from '@/features/platform/hooks/usePlatform';
import { compactNumber, formatDate } from '@/lib/format';
import { FinanceSection } from '@/features/platform/components/FinanceSection';
import { GrowthSection } from '@/features/platform/components/GrowthSection';
import { PRODUCT_NAME } from '@/config/brand';

const DAY = 86_400_000;
const plural = (n: number, one: string) => `${compactNumber(n)} ${one}${n === 1 ? '' : 's'}`;

/** Platform owner's home: tenants, trials about to end, applications to review, plan mix. */
export function PlatformDashboard({ adminName }: { adminName: string }) {
  const schools = useSchools();
  const applications = useSchoolApplications();
  const tiers = useTiers();
  const list = schools.data ?? [];
  const pending = (applications.data ?? []).filter((a) => a.status === 'pending');
  const approved = (applications.data ?? []).filter((a) => a.status === 'approved');
  const trials = list
    .map((s) => ({ s, sub: s.subscriptions[0] }))
    .filter(({ sub }) => sub?.status === 'trialing' && sub.trialEndsAt)
    .sort((a, b) => a.sub!.trialEndsAt!.localeCompare(b.sub!.trialEndsAt!));
  const endingSoon = trials.filter(({ sub }) => new Date(sub!.trialEndsAt!).getTime() - Date.now() < 7 * DAY);
  const byTier = new Map<string, number>();
  for (const s of list) {
    const code = s.subscriptions[0]?.tier.code;
    if (code) byTier.set(code, (byTier.get(code) ?? 0) + 1);
  }
  const maxTier = Math.max(1, ...byTier.values());

  const slides: HeroSlide[] = [
    { key: 'welcome', kicker: `${greeting()} · ${todayLabel()}`, icon: Sun, title: adminName, text: `${PRODUCT_NAME} platform console` },
    ...(pending.length ? [{ key: 'apps', kicker: 'Applications', icon: ClipboardList, title: `${plural(pending.length, 'school')} asking to join`, text: 'Review new requests and approve the ones to onboard.', cta: { label: 'Review applications', to: '/applications' } }] : []),
    ...(approved.length ? [{ key: 'onboard', kicker: 'Ready to onboard', icon: Building2, title: `${plural(approved.length, 'approved school')} to provision`, text: 'Create their tenant, plan and first admin.', cta: { label: 'Open applications', to: '/applications' } }] : []),
    ...(trials.length ? [{ key: 'trials', kicker: 'Free trials', icon: Hourglass, title: `${plural(trials.length, 'school')} on trial`, text: endingSoon.length ? `${plural(endingSoon.length, 'trial')} end within a week.` : 'None end this week.', cta: { label: 'See schools', to: '/schools' } }] : []),
  ];

  return (
    <div className="space-y-6">
      <HeroBanner label="Platform" slides={slides} image="campus-autumn" />
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <StatCard label="Schools" value={schools.isLoading ? '–' : list.length} icon={School} tone="primary" />
        <StatCard label="Active" value={schools.isLoading ? '–' : list.filter((s) => s.status === 'active').length} icon={CircleCheck} tone="emerald" />
        <StatCard label="On free trial" value={schools.isLoading ? '–' : trials.length} icon={Hourglass} tone="amber" hint={endingSoon.length ? `${compactNumber(endingSoon.length)} ending this week` : undefined} />
        <StatCard label="Applications" value={applications.isLoading ? '–' : pending.length} icon={ClipboardList} tone="teal" hint="Waiting for review" />
      </div>
      <GrowthSection />
      <FinanceSection />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Applications to review" icon={ClipboardList} tone="teal" actions={<AreaLink to="/applications" className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">View all</AreaLink>}>
          {applications.isLoading && <Spinner />}
          {applications.isSuccess && pending.length === 0 && <EmptyState icon={ClipboardList} title="Nothing waiting" tone="teal" />}
          <ul className="space-y-2">
            {pending.slice(0, 5).map((a) => (
              <li key={a.id} className="rounded-xl bg-slate-500/5 px-3 py-2">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{a.schoolName}</div>
                <div className="text-sm text-slate-500">{a.contactFirstName} {a.contactLastName} · {formatDate(a.createdAt)}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Trials ending soonest" icon={Hourglass} tone="amber">
          {schools.isLoading && <Spinner />}
          {schools.isSuccess && trials.length === 0 && <EmptyState icon={Hourglass} title="No schools on trial" tone="amber" />}
          <ul className="space-y-2">
            {trials.slice(0, 5).map(({ s, sub }) => {
              const days = Math.ceil((new Date(sub!.trialEndsAt!).getTime() - Date.now()) / DAY);
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-500/5 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-800 dark:text-slate-100">{s.name}</div>
                    <div className="text-sm text-slate-500">{sub!.tier.name} · ends {formatDate(sub!.trialEndsAt!)}</div>
                  </div>
                  <Badge tone={days <= 7 ? 'rose' : 'amber'}>{days > 0 ? `${days}d left` : 'ended'}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="Schools by plan" icon={Crown} tone="magenta">
          <ul className="space-y-3">
            {tiers.data?.map((t) => (
              <li key={t.code}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200"><IconTile icon={Building2} tone="magenta" size="sm" /> {t.name}</span>
                  <strong className="tabular-nums"><CompactNumber value={byTier.get(t.code) ?? 0} /></strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-500/10">
                  <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${((byTier.get(t.code) ?? 0) / maxTier) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
