import { CalendarDays } from 'lucide-react';
import { Card, EmptyState, Spinner } from '@/components/ui';
import { useCurrentYear } from '@/features/academics/hooks/useAcademics';
import { formatDate } from '@/lib/format';

/** The current academic year and its terms. */
export function AcademicYearWidget({ className = '' }: { className?: string }) {
  const year = useCurrentYear();
  const y = year.data;
  return (
    <Card title="Current academic year" icon={CalendarDays} tone="teal" className={className}>
      {year.isLoading && <Spinner />}
      {year.isSuccess && !y && <EmptyState icon={CalendarDays} title="No current year" tone="teal">Set one up under Academics.</EmptyState>}
      {y && (
        <div>
          <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{y.name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{formatDate(y.startDate)} – {formatDate(y.endDate)}</div>
          <ul className="mt-4 space-y-2">
            {y.terms.length === 0 && <li className="text-sm text-slate-500">No terms defined yet.</li>}
            {y.terms.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl bg-slate-500/5 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{t.name}</span>
                <span className="text-xs text-slate-500">{formatDate(t.startDate)} – {formatDate(t.endDate)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
