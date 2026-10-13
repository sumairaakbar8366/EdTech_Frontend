import { compactNumber, exactNumber } from '@/lib/format';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';

/**
 * A figure that always fits its box: 999 and below as is, then "12.5k", "3.2M", "1.1B".
 * A currency prefix ("PKR") is drawn small in front of the figure so it never pushes it out.
 * Abbreviated figures show the exact value in a tooltip on hover or focus.
 */
export function CompactNumber({ value, prefix = '' }: { value: number | string; prefix?: string }) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return <>{String(value)}</>;
  const unit = prefix.trim();
  const label = unit ? <span className="mr-1 align-baseline text-[0.45em] font-semibold tracking-wide text-slate-500 dark:text-slate-400">{unit}</span> : null;
  if (Math.abs(n) < 1000) return <>{label}{compactNumber(n)}</>;
  const exact = `${unit ? `${unit} ` : ''}${exactNumber(n)}`;
  return (
    <Tooltip content={exact}>
      <span aria-label={exact} className="whitespace-nowrap">{label}{compactNumber(n)}</span>
    </Tooltip>
  );
}
