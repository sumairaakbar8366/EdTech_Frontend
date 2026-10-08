/**
 * Tone names of the design system. Since the 2026-10-06 "serious" theme the app uses one brand
 * colour (navy): decorative uses (icon tiles, accent bars) are navy for every tone, and only badges
 * keep green / amber / red, where the colour carries a status meaning.
 */
export type Tone = 'primary' | 'magenta' | 'teal' | 'sky' | 'emerald' | 'amber' | 'rose' | 'fuchsia' | 'orange' | 'slate';

const NAVY_TILE = 'bg-(--ink-soft) text-(--ink)';

/** Icon tile colours per tone (all navy). */
export const TILE: Record<Tone, string> = {
  primary: NAVY_TILE, magenta: NAVY_TILE, teal: NAVY_TILE, sky: NAVY_TILE, emerald: NAVY_TILE,
  amber: NAVY_TILE, rose: NAVY_TILE, fuchsia: NAVY_TILE, orange: NAVY_TILE, slate: NAVY_TILE,
};

const NAVY_BADGE = 'bg-primary-500/10 text-primary-700 ring-primary-500/25 dark:text-primary-200';

export const BADGE: Record<Tone, string> = {
  primary: NAVY_BADGE,
  magenta: NAVY_BADGE,
  teal: NAVY_BADGE,
  sky: NAVY_BADGE,
  fuchsia: NAVY_BADGE,
  emerald: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
  amber: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
  orange: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
  rose: 'bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300',
  slate: 'bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-slate-300',
};

/** Solid accent bar colour per tone (all navy). */
export const ACCENT: Record<Tone, string> = {
  primary: 'bg-primary-700', magenta: 'bg-primary-700', teal: 'bg-primary-700', sky: 'bg-primary-700', emerald: 'bg-primary-700',
  amber: 'bg-primary-700', rose: 'bg-primary-700', fuchsia: 'bg-primary-700', orange: 'bg-primary-700', slate: 'bg-primary-700',
};
