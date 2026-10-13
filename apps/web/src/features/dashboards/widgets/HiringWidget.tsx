import { BriefcaseBusiness, CalendarClock, Users } from 'lucide-react';
import { Card, CompactNumber, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { useHiringSummary } from '@/features/hiring/hooks/useHiring';

/** Open job posts, candidates in the pipeline and upcoming interviews. */
export function HiringWidget({ className = '' }: { className?: string }) {
  const summary = useHiringSummary();
  const s = summary.data;
  const rows = s && [
    { label: 'Open posts', value: s.openPosts, icon: BriefcaseBusiness },
    { label: 'In the pipeline', value: s.inPipeline, icon: Users },
    { label: 'Interviews coming up', value: s.interviewsUpcoming, icon: CalendarClock },
  ];
  return (
    <Card title="Hiring" icon={BriefcaseBusiness} tone="fuchsia" className={className} actions={<ViewAll to="/staff/hiring" />}>
      {summary.isLoading && <Spinner />}
      {rows && (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between rounded-xl bg-slate-500/5 px-3 py-2">
              <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200"><r.icon size={15} className="text-primary-500" /> {r.label}</span>
              <strong className="font-display text-xl tabular-nums"><CompactNumber value={r.value} /></strong>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
