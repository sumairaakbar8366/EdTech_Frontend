import { CalendarOff } from 'lucide-react';
import { Avatar, Badge, Card, EmptyState, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { useLeaveRequests } from '@/features/leave/leave';
import { compactNumber, formatDate } from '@/lib/format';

/** Leave requests waiting for a decision. */
export function LeaveApprovalsWidget({ to, className = '' }: { to: string; className?: string }) {
  const pending = useLeaveRequests('pending');
  const rows = pending.data ?? [];
  return (
    <Card title={`Leave to approve${rows.length ? ` · ${compactNumber(rows.length)}` : ''}`} icon={CalendarOff} tone="rose" className={className} actions={<ViewAll to={to} />}>
      {pending.isLoading && <Spinner />}
      {pending.isSuccess && rows.length === 0 && <EmptyState icon={CalendarOff} title="Nothing waiting" tone="rose">All leave requests are decided.</EmptyState>}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {rows.slice(0, 5).map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-2">
            <Avatar photoKey={r.employee.photoKey} name={`${r.employee.firstName} ${r.employee.lastName}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-slate-800 dark:text-slate-100">{r.employee.firstName} {r.employee.lastName}</div>
              <div className="text-sm text-slate-500">{formatDate(r.startDate)} – {formatDate(r.endDate)} · {r.days} day(s)</div>
            </div>
            <Badge tone={r.leaveType.isPaid ? 'teal' : 'orange'}>{r.leaveType.name}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
