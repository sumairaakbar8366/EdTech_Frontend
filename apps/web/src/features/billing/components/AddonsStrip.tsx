import { Sparkles } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import { FEATURE_INFO, type PlanFeature } from '@schoolerp/shared';
import { useBillingOverview } from '@/features/billing/billing';
import { DomainAddon } from '@/features/billing/components/DomainAddon';

/**
 * Add-ons and upgrades offered on the admin dashboard, like ads: the own domain (if not bought yet)
 * and up to three features the current plan does not have.
 */
export function AddonsStrip() {
  const o = useBillingOverview();
  const d = o.data;
  if (!d) return null;
  const domain = d.addons.domain;
  const missing = (d.features.map((f) => f.key) as PlanFeature[]).filter((f) => f !== 'custom_domain' && !d.state.features.includes(f)).slice(0, 3);
  const showDomain = !domain.active && !domain.includedInPlan && !!domain.priceYearly && d.state.phase !== 'trial';
  if (!showDomain && missing.length === 0) return null;
  return (
    <section aria-label="Add-ons for your school" className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500"><Sparkles size={15} className="text-orange-500" /> More for your school</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {showDomain && <DomainAddon compact />}
        {missing.map((f) => (
          <AreaLink key={f} to="/billing" className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-orange-300 dark:border-white/10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600"><Sparkles size={18} /></span>
            <span>
              <span className="block font-bold text-slate-900 dark:text-white">{FEATURE_INFO[f].label}</span>
              <span className="block text-sm text-slate-600 dark:text-slate-300">{FEATURE_INFO[f].description}</span>
              <span className="mt-1 block text-sm font-semibold text-orange-700 group-hover:underline dark:text-orange-300">Upgrade to get it →</span>
            </span>
          </AreaLink>
        ))}
      </div>
    </section>
  );
}
