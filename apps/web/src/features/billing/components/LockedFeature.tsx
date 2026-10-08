import { FEATURE_INFO, type PlanFeature } from '@schoolerp/shared';
import { Lock, Sparkles } from 'lucide-react';
import { AreaLink } from '@/app/router/area';

/** Shown instead of a page whose feature is not in the school's plan. */
export function LockedFeature({ feature, isAdmin }: { feature: PlanFeature; isAdmin: boolean }) {
  const info = FEATURE_INFO[feature];
  return (
    <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-(--surface-border) bg-white p-8 text-center shadow-sm dark:bg-(--surface-bg)">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"><Lock size={26} /></span>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{info.label}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{info.description}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
        <Sparkles size={14} className="text-orange-500" /> Included from the {info.plan.charAt(0).toUpperCase() + info.plan.slice(1)} plan
      </p>
      <div className="mt-6">
        {isAdmin ? (
          <AreaLink to="/billing" className="inline-flex rounded-lg bg-orange-600 px-5 py-2.5 font-bold text-white hover:bg-orange-700">See plans &amp; upgrade</AreaLink>
        ) : (
          <p className="text-sm text-slate-500">Ask your school administration about upgrading to use this.</p>
        )}
      </div>
    </div>
  );
}
