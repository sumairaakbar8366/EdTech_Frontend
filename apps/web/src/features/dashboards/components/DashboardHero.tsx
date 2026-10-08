import { CalendarDays, Sun } from 'lucide-react';
import type { HeroSlide } from '@/components/motion/HeroSlides';
import { HeroBanner } from '@/components/shared/HeroBanner';
import { useCurrentYear } from '@/features/academics/hooks/useAcademics';
import { useCan, useSchoolUser } from '@/features/auth/usePermissions';
import { greeting } from '@/features/dashboards/utils/dashboard.utils';

/**
 * School dashboard banner as a slideshow: the greeting first, then the role's own highlight
 * slides (what needs attention today), auto-advancing.
 */
export function DashboardHero({
  slides = [],
  image = '/images/marketing/campus-archway-800.webp',
}: {
  slides?: HeroSlide[];
  image?: string;
}) {
  const me = useSchoolUser();
  const can = useCan();
  const year = useCurrentYear(can('academics.view')).data;
  const welcome: HeroSlide = {
    key: 'welcome',
    kicker: greeting(),
    icon: Sun,
    title: `${me.user.firstName} ${me.user.lastName}`,
    text: me.school?.name,
  };
  const chips = (
    <div className="mt-4 flex flex-wrap gap-2">
      {me.roles.map((r) => (
        <span key={r.key} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-300/10 dark:text-blue-200 dark:ring-blue-200/15">
          {r.name}
        </span>
      ))}
      {year && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/15">
          <CalendarDays size={13} /> {year.name}
        </span>
      )}
    </div>
  );
  return <HeroBanner label="Today" slides={[welcome, ...slides]} first={chips} image={image} />;
}
