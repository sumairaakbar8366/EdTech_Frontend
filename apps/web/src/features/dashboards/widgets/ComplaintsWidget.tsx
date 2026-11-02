import { ShieldAlert } from 'lucide-react';
import { Badge, Card, EmptyState, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { COMPLAINTS_KEY, complaintsService, SEVERITY_TONE, useComplaintSummary } from '@/features/complaints/complaints';
import { useQuery } from '@tanstack/react-query';
import { AreaLink } from '@/app/router/area';
import { timeAgo } from '@/features/communication/utils/notificationLinks';

/** Complaints waiting for the principal / admin: counts, and the newest open ones. */
export function ComplaintsWidget({ className = '' }: { className?: string }) {
  const summary = useComplaintSummary();
  const latest = useQuery({ queryKey: [...COMPLAINTS_KEY, 'list', 'open', '', '', '', 1], queryFn: () => complaintsService.list({ status: 'open', page: 1 }) });
  const open = summary.data?.open ?? 0;
  return (
    <Card title={`Complaints${open ? ` · ${open} open` : ''}`} icon={ShieldAlert} tone="rose" className={className} actions={<ViewAll to="/complaints" />}>
      {summary.isLoading && <Spinner />}
      {summary.data && (summary.data.urgentOpen > 0 ? <p className="mb-2 text-sm font-semibold text-rose-600">{summary.data.urgentOpen} serious or urgent complaint(s) need attention.</p> : null)}
      {latest.data?.items.length === 0 && <EmptyState icon={ShieldAlert} title="No open complaints" tone="rose">Concerns from parents, students and staff appear here.</EmptyState>}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {latest.data?.items.slice(0, 5).map((c) => (
          <li key={c.id}><AreaLink to={`/complaints?open=${c.id}`} className="flex items-center justify-between gap-3 py-2 hover:text-primary-700"><span className="min-w-0"><span className="block truncate font-semibold text-slate-800 dark:text-slate-100">{c.subject}</span><span className="text-xs text-slate-500">{c.ticketNo} · {timeAgo(c.createdAt)}{c.anonymous ? ' · anonymous' : ''}</span></span><Badge tone={SEVERITY_TONE[c.severity]}>{c.severity}</Badge></AreaLink></li>
        ))}
      </ul>
    </Card>
  );
}
