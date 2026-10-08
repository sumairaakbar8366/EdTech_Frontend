import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useId } from 'react';

/** Segmented tabs; the active tab is filled with the brand colour. */
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; icon: LucideIcon }[]; value: T; onChange: (id: T) => void }) {
  const pill = useId();
  return (
    <div role="tablist" className="surface mb-6 inline-flex flex-wrap gap-1 rounded-xl p-1">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`focus-ring relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base font-bold uppercase tracking-wide transition-colors ${
              active ? 'text-white' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'
            }`}
          >
            {active && <motion.span layoutId={pill} className="absolute inset-0 rounded-lg bg-brand" transition={{ duration: 0.18, ease: 'easeOut' }} />}
            <span className="relative inline-flex items-center gap-2">
              <t.icon size={16} /> {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
