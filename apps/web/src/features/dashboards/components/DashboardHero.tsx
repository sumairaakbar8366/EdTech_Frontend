import { ArrowRight, CalendarDays, CircleCheck, ListChecks } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import type { HeroSlide } from '@/components/motion/HeroSlides';
import { Card } from '@/components/ui';
import { useCurrentYear } from '@/features/academics/hooks/useAcademics';
import { useCan, useSchoolUser } from '@/features/auth/usePermissions';
import { todayLabel } from '@/features/dashboards/utils/dashboard.utils';

/**
 * Top of every school dashboard: a report-style "Today" list of what needs attention (the role's
 * highlight items), each linking to where it is handled, with the date, roles and academic year.
 */
export function DashboardHero({ slides = [] }: { slides?: HeroSlide[] }) {
  const me = useSchoolUser();
  const can = useCan();
  const year = useCurrentYear(can('academics.view')).data;
  const meta = (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 text-slate-600 dark:text-slate-300"><CalendarDays size={13} /> {todayLabel()}</span>
      {year && <span className="rounded-full bg-slate-500/10 px-2.5 py-1 text-slate-600 dark:text-slate-300">{year.name}</span>}
      {me.roles.map((r) => (
        <span key={r.key} className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-300/10 dark:text-blue-200 dark:ring-blue-200/15">{r.name}</span>
      ))}
    </div>
  );
  return (
    <Card title="Today" icon={ListChecks} actions={meta} padded={false}>
      {slides.length === 0 ? (
        <div className="flex items-center gap-3 px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><CircleCheck size={16} /></span>
          Nothing needs your attention right now.
        </div>
      ) : (
        <ul className="grid gap-1 p-3 sm:grid-cols-2 xl:grid-cols-3">
          {slides.map((s) => {
            const Icon = s.icon ?? ListChecks;
            const body = (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300"><Icon size={17} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.kicker}</span>
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{s.title}</span>
                  {s.text && <span className="block text-xs leading-snug text-slate-500 dark:text-slate-400">{s.text}</span>}
                </span>
                {s.cta && <ArrowRight size={15} className="mt-1 shrink-0 text-slate-400" />}
              </>
            );
            return (
              <li key={s.key}>
                {s.cta ? (
                  <AreaLink to={s.cta.to} title={s.cta.label} className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-500/5">{body}</AreaLink>
                ) : (
                  <div className="flex items-start gap-3 rounded-xl px-3 py-2.5">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
