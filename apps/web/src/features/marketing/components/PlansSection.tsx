import { DEFAULT_TIERS, FEATURE_INFO, featuresForPlan, type PlanFeature } from '@schoolerp/shared';
import { useQuery } from '@tanstack/react-query';
import { Check, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { IconTile, Tilt } from '@/components/ui';
import { SectionHeading } from '@/features/marketing/components/Reveal';
import { TIER_ICON } from '@/features/marketing/content/landing.content';
import { api } from '@/services/api/http';

interface PublicPlan {
  code: string;
  name: string;
  priceMonthly: string | null;
  currency: string;
  maxCampuses: number | null;
  maxStudents: number | null;
  maxStaff: number | null;
  features: PlanFeature[];
}

/** The plans the platform owner currently sells; the built-in four until they load. */
function usePlans(): PublicPlan[] {
  const q = useQuery({ queryKey: ['public', 'plans'], queryFn: () => api<PublicPlan[]>('/public/plans'), staleTime: 5 * 60_000 });
  if (q.data?.length) return q.data;
  return DEFAULT_TIERS.map((t) => ({ ...t, priceMonthly: null, currency: 'PKR', features: [...featuresForPlan(t.code)] }));
}

/** What a plan adds over the one before it (the first plan lists its own). */
function planHighlights(plan: PublicPlan, previous: PublicPlan | undefined): string[] {
  const prev = new Set(previous?.features ?? []);
  const added = plan.features.filter((f) => !prev.has(f)).map((f) => FEATURE_INFO[f].label);
  if (!previous) return added;
  return added.length ? [`Everything in ${previous.name}, plus:`, ...added] : [`Everything in ${previous.name}`];
}

const price = (p: PublicPlan) => (p.priceMonthly === null ? null : `${p.currency} ${Number(p.priceMonthly).toLocaleString(undefined, { maximumFractionDigits: 0 })}`);

const limit = (n: number | null, unit: string) => (n === null ? `Unlimited ${unit}` : `Up to ${n.toLocaleString()} ${unit}`);

/** The subscription plans with their current prices; Growth is highlighted. */
export function PlansSection({ demoHref }: { demoHref: string }) {
  const plans = usePlans();
  return (
    <section id="plans" className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-20">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading kicker="Plans" title="Plans that grow with you" text="Start free for one month. Upgrade any time." />
        <div className={`mt-8 grid gap-4 sm:grid-cols-2 ${plans.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {plans.map((t, i) => {
            const Icon = TIER_ICON[t.code] ?? Zap;
            const featured = t.code === 'growth';
            return (
              <motion.div
                key={t.code}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 100, damping: 16 }}
                className={featured ? 'lg:-translate-y-2' : ''}
              >
                <Tilt max={3} className={`surface relative h-full border-t-2 border-t-primary-400 p-5 ${featured ? 'ring-1 ring-primary-500' : ''}`}>
                  {featured && <span className="absolute -top-3 left-5 border-l-2 border-orange-500 bg-brand px-2 py-0.5 text-xs font-semibold text-slate-950">Most popular</span>}
                  <IconTile icon={Icon} tone={featured ? 'primary' : 'slate'} />
                  <div className="mt-3 font-display text-xl font-semibold text-slate-900 dark:text-white">{t.name}</div>
                  <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{price(t) ?? 'Price on request'}{price(t) && <span className="text-sm font-medium text-slate-500"> / month</span>}</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {[limit(t.maxCampuses, t.maxCampuses === 1 ? 'campus' : 'campuses'), limit(t.maxStudents, 'students'), limit(t.maxStaff, 'staff'), ...planHighlights(t, plans[i - 1])].map((line, lineIndex) => (
                      <li key={`${lineIndex}-${line}`} className="flex items-center gap-2"><Check size={14} className="shrink-0 text-primary-600" /> {line}</li>
                    ))}
                  </ul>
                  <a
                    href={demoHref}
                    className={`focus-ring mt-5 block border px-4 py-2 text-center text-sm font-semibold transition ${featured ? 'border-orange-500 bg-brand text-slate-950 hover:bg-magenta-600' : 'border-slate-200 bg-white text-slate-800 hover:border-primary-500 dark:border-white/10 dark:bg-white/5 dark:text-white'}`}
                  >
                    {t.priceMonthly === null ? 'Contact sales' : 'Start free trial'}
                  </a>
                </Tilt>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
