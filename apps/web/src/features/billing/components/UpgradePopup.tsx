import { FEATURE_INFO, PLAN_FEATURES_LIST, type PlanFeature } from '@schoolerp/shared';
import { Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AreaLink } from '@/app/router/area';
import { useSubscription } from '@/features/billing/billing';
import { useAuth } from '@/features/auth/AuthProvider';

const KEY = 'schoolerp-upgrade-popup';
const SNOOZE_MS = 3 * 86_400_000;
const PREMIUM: PlanFeature[] = ['document_requests', 'payroll', 'gps_attendance', 'import_export', 'theme', 'custom_domain', 'exams', 'lms'];

function snoozed(): boolean {
  try {
    return Date.now() - Number(localStorage.getItem(KEY) ?? 0) < SNOOZE_MS;
  } catch {
    return false;
  }
}

/**
 * Admin dashboard nudge: a feature the school does not have yet ("New: … · upgrade to try"), or in
 * the last two weeks of the trial, what they keep by choosing a plan. Snoozes for 3 days.
 */
export function UpgradePopup() {
  const sub = useSubscription().data;
  const { me } = useAuth();
  // Not for the platform owner's support session.
  const support = me?.scope === 'school' && !!me.support;
  const [open, setOpen] = useState(false);
  const missing = sub ? PREMIUM.filter((f) => !sub.features.includes(f)) : [];
  const trialEnding = sub?.phase === 'trial' && (sub.daysLeft ?? 99) <= 14;
  const feature: PlanFeature | undefined = missing[new Date().getDate() % Math.max(1, missing.length)] ?? (trialEnding ? PREMIUM[new Date().getDate() % PREMIUM.length] : undefined);

  useEffect(() => {
    if (!feature || support || snoozed()) return;
    const t = setTimeout(() => setOpen(true), 1800);
    return () => clearTimeout(t);
  }, [feature, support]);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* private mode */ }
  };
  if (!feature || !sub || support) return null;
  const info = FEATURE_INFO[feature];
  const others = (missing.length ? missing : PLAN_FEATURES_LIST.filter((f) => f !== 'core')).filter((f) => f !== feature).slice(0, 3);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.25 }}
          className="fixed bottom-5 right-5 z-[90] w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-depth-3 dark:border-orange-400/20 dark:bg-[#171e29]"
          role="dialog" aria-label="New feature"
        >
          <div className="flex items-center justify-between bg-[#2f3e52] px-4 py-2.5 text-white">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"><Sparkles size={14} className="text-orange-300" /> {missing.length ? 'New for your school' : `Trial · ${sub.daysLeft} days left`}</span>
            <button onClick={close} aria-label="Close" className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white"><X size={16} /></button>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{info.label}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{info.description}</p>
            {others.length > 0 && <p className="mt-3 text-xs text-slate-500">Also: {others.map((f) => FEATURE_INFO[f].label).join(' · ')}</p>}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button onClick={close} className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white">Not now</button>
              <AreaLink to="/billing" onClick={close} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">{missing.length ? `Try it · upgrade` : 'Choose a plan'}</AreaLink>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
