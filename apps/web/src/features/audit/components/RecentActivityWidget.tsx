import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, EmptyState, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { activityService } from '@/features/audit/services/activityService';

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** The latest risky and sensitive actions in the school (red = risky), for the principal's dashboard. */
export function RecentActivityWidget({ className = '' }: { className?: string }) {
  const log = useQuery({ queryKey: ['activity', 'school', 'recent'], queryFn: () => activityService.school({ page: 1, days: 7, kind: 'change' }), refetchInterval: 60_000 });
  const d = log.data;
  return (
    <Card title="What changed (7 days)" icon={ShieldAlert} tone="rose" padded={false} className={className} actions={<ViewAll to="/activity" />}>
      {log.isLoading && <div className="p-6"><Spinner /></div>}
      {d && d.items.length === 0 && <EmptyState icon={ShieldCheck} title="No sensitive changes this week" />}
      <ul className="divide-y divide-(--surface-border)">
        {d?.items.slice(0, 8).map((i) => (
          <li key={i.id} className={`flex items-start gap-3 border-l-[3px] px-5 py-2.5 ${i.level === 'critical' ? 'border-l-rose-500 bg-rose-500/[0.06]' : 'border-l-amber-400'}`}>
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-bold ${i.level === 'critical' ? 'text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-slate-100'}`}>{i.title}</div>
              <div className="truncate text-xs text-slate-500">{i.actorName ?? 'Unknown'}{i.campus ? ` · ${i.campus}` : ''}</div>
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-slate-500">{when(i.at)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
