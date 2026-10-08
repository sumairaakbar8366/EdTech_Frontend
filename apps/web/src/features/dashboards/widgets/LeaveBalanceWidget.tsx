import { CalendarOff } from 'lucide-react';
import { Badge, Card, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { useMyLeave } from '@/features/leave/leave';

/** Remaining leave per type this year, and how many requests await a decision. */
export function LeaveBalanceWidget({ className = '' }: { className?: string }) {
  const leave = useMyLeave();
  const d = leave.data;
  const pending = d?.requests.filter((r) => r.status === 'pending').length ?? 0;
  return (
    <Card title={d ? `Leave ${d.year}` : 'Leave'} icon={CalendarOff} tone="rose" className={className} actions={<ViewAll to="/leave" label="Apply / history" />}>
      {leave.isLoading && <Spinner />}
      {d && (
        <div className="space-y-2">
          {d.balances.map((b) => (
            <div key={b.leaveTypeId} className="flex items-center justify-between rounded-xl bg-slate-500/5 px-3 py-2 text-sm">
              <span className="text-slate-700 dark:text-slate-200">
                {b.name}
                {!b.isPaid && <span className="text-slate-500"> · unpaid</span>}
              </span>
              <span className="font-semibold tabular-nums">{b.remaining === null ? `${b.used} used` : `${b.remaining} left`}</span>
            </div>
          ))}
          {pending > 0 && <Badge tone="amber">{pending} request(s) awaiting approval</Badge>}
        </div>
      )}
    </Card>
  );
}
