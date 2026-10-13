import type { InvoiceStatus } from '@/features/fees/types/fee.types';
import { CompactNumber } from '@/components/ui';

const BAR: Record<InvoiceStatus, string> = {
  pending: 'bg-amber-400', partial: 'bg-primary-500', paid: 'bg-emerald-500', overdue: 'bg-rose-500', waived: 'bg-slate-400', cancelled: 'bg-slate-300',
};

/** Stacked bar of invoices by status, with a legend. Renders nothing when there are no invoices. */
export function InvoiceStatusBar({ counts, framed = true, className = '' }: { counts: Partial<Record<InvoiceStatus, number>>; framed?: boolean; className?: string }) {
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  if (total === 0) return null;
  const present = (Object.keys(BAR) as InvoiceStatus[]).filter((st) => counts[st]);
  return (
    <div className={`${framed ? 'surface rounded-xl p-4' : ''} ${className}`}>
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-500/10" role="img" aria-label="Invoices by status">
        {present.map((st) => <div key={st} className={`${BAR[st]} transition-all`} style={{ width: `${(counts[st]! / total) * 100}%` }} title={`${st}: ${counts[st]}`} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        {present.map((st) => (
          <span key={st} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${BAR[st]}`} />
            <span className="capitalize">{st}</span> <strong className="tabular-nums"><CompactNumber value={counts[st] ?? 0} /></strong>
          </span>
        ))}
      </div>
    </div>
  );
}
