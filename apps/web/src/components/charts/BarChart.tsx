import { motion } from 'motion/react';
import { useState } from 'react';

export interface Bar {
  key: string;
  label: string;
  value: number;
}

/**
 * Single-series vertical bars (one hue: magnitude only). Bars grow in from the baseline,
 * round only at the data end, and show their exact value on hover or focus.
 */
export function BarChart({ bars, format = (v) => v.toLocaleString(), height = 200, label }: { bars: Bar[]; format?: (v: number) => string; height?: number; label: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <figure aria-label={label}>
      <div className="relative flex items-end gap-0.5 border-b border-slate-300/70 dark:border-white/15" style={{ height }}>
        {[0.25, 0.5, 0.75].map((f) => (
          <span key={f} aria-hidden className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-300/40 dark:border-white/5" style={{ bottom: `${f * 100}%` }} />
        ))}
        {bars.map((b, i) => (
          <button
            key={b.key}
            type="button"
            onMouseEnter={() => setHover(b.key)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(b.key)}
            onBlur={() => setHover(null)}
            aria-label={`${b.label}: ${format(b.value)}`}
            className="group relative flex h-full flex-1 items-end justify-center focus:outline-none"
          >
            <motion.span
              initial={{ height: 0 }}
              whileInView={{ height: `${(b.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              className={`block w-full max-w-10 rounded-t ${hover === b.key ? 'bg-primary-500' : 'bg-primary-400/80 dark:bg-primary-500/80'} ${b.value ? 'min-h-0.5' : ''}`}
            />
            {hover === b.key && (
              <span className="surface absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-md px-2 py-1 text-xs shadow-depth-2">
                <span className="block text-slate-500">{b.label}</span>
                <span className="block font-bold tabular-nums text-slate-900 dark:text-white">{format(b.value)}</span>
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-1 flex gap-0.5">
        {bars.map((b, i) => (
          <span key={b.key} className="flex-1 truncate text-center text-xs text-slate-500">{bars.length > 8 && i % 2 ? '' : b.label}</span>
        ))}
      </div>
    </figure>
  );
}

/** Horizontal percentage bars with the value written at the end (rates by class). */
export function RateBars({ rows, label }: { rows: { key: string; label: string; value: number | null; detail?: string }[]; label: string }) {
  return (
    <ul aria-label={label} className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={r.key} className="grid grid-cols-[7rem_1fr_3.5rem] items-center gap-3 text-sm">
          <span className="truncate font-semibold text-slate-700 dark:text-slate-200" title={r.detail}>{r.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-slate-500/10">
            <motion.span
              className="block h-full rounded-full bg-primary-500"
              initial={{ width: 0 }}
              whileInView={{ width: `${r.value ?? 0}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </span>
          <strong className="text-right tabular-nums text-slate-800 dark:text-slate-100">{r.value === null ? '—' : `${r.value}%`}</strong>
        </li>
      ))}
    </ul>
  );
}
