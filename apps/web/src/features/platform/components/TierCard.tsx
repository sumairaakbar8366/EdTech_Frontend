import { FEATURE_INFO } from '@schoolerp/shared';
import { Building2, Check, Crown, Eye, EyeOff, GraduationCap, Pencil, Rocket, Sparkles, Trash2, Users, Zap, type LucideIcon } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { Tier } from '@/features/platform/types/platform.types';
import { tierLimit } from '@/features/platform/utils/platform.utils';

const STYLE: Record<string, { icon: LucideIcon; gradient: string }> = {
  starter: { icon: Zap, gradient: 'bg-primary-600' },
  growth: { icon: Rocket, gradient: 'bg-primary-700' },
  scale: { icon: Sparkles, gradient: 'bg-primary-800' },
  enterprise: { icon: Crown, gradient: 'bg-primary-950' },
};

const money = (v: string | null, currency: string) => (v === null ? null : `${currency} ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`);

/** One plan: prices, limits, features, schools on it, and the owner's actions. */
export function TierCard({ tier, onEdit, onToggle, onDelete, busy }: { tier: Tier; onEdit: () => void; onToggle: () => void; onDelete: () => void; busy?: boolean }) {
  const s = STYLE[tier.code] ?? { icon: Crown, gradient: 'bg-slate-700' };
  const monthly = money(tier.priceMonthly, tier.currency);
  const yearly = money(tier.priceAnnual, tier.currency);
  return (
    <div className={`surface relative flex flex-col overflow-hidden rounded-xl transition-shadow hover:shadow-depth-3 ${tier.isActive ? '' : 'opacity-75'}`}>
      <div className={`relative ${s.gradient} px-6 pb-5 pt-5 text-white`}>
        <div className="flex items-start justify-between gap-2">
          <s.icon size={26} className="drop-shadow" />
          {!tier.isActive && <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">Hidden</span>}
        </div>
        <div className="mt-2 font-display text-2xl font-extrabold">{tier.name}</div>
        <div className="text-sm text-white/80">{tier.code} · {tier.pricingModel.replaceAll('_', ' ')}</div>
        <div className="mt-3 font-display text-2xl font-extrabold">{monthly ?? 'On request'}{monthly && <span className="text-sm font-semibold text-white/80"> / month</span>}</div>
        <div className="text-sm text-white/80">{yearly ? `${yearly} / year` : 'Yearly: on request'}</div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 text-sm">
        <dl className="space-y-2">
          {[
            { icon: Building2, label: 'Campuses', value: tierLimit(tier.maxCampuses) },
            { icon: GraduationCap, label: 'Students', value: tierLimit(tier.maxStudents) },
            { icon: Users, label: 'Staff', value: tierLimit(tier.maxStaff) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Icon size={15} /> {label}</dt>
              <dd className="font-bold text-slate-800 dark:text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
        <ul className="space-y-1.5 border-t border-slate-200/70 pt-3 dark:border-white/5">
          {tier.features.map((f) => <li key={f} className="flex items-start gap-2 text-slate-700 dark:text-slate-200"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" /> {FEATURE_INFO[f].label}</li>)}
        </ul>
        <div className="mt-auto flex flex-wrap gap-1.5 border-t border-slate-200/70 pt-3 dark:border-white/5">
          <Badge tone="emerald">{tier.schools.paying} paying</Badge>
          <Badge tone="sky">{tier.schools.trial} on trial</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={Pencil} onClick={onEdit}>Edit</Button>
          <Button variant="ghost" icon={tier.isActive ? EyeOff : Eye} onClick={onToggle} loading={busy}>{tier.isActive ? 'Hide' : 'Show'}</Button>
          {tier.canDelete && <Button variant="ghost" icon={Trash2} onClick={onDelete} aria-label={`Delete ${tier.name}`}>Delete</Button>}
        </div>
      </div>
    </div>
  );
}
