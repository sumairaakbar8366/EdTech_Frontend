import { Bell } from 'lucide-react';
import { AreaLink, useArea } from '@/app/router/area';
import { Card, EmptyState, Spinner } from '@/components/ui';
import { EVENT_VISUAL } from '@/features/communication/components/eventVisual';
import { useNotifications } from '@/features/communication/hooks/useCommunication';
import { resolveNotificationLink, timeAgo } from '@/features/communication/utils/notificationLinks';
import { ViewAll } from '@/features/dashboards/components/ViewAll';

/** The latest notifications (fee paid, result uploaded, leave approved…) as a dashboard panel. */
export function RecentNotificationsWidget({ className = '' }: { className?: string }) {
  const list = useNotifications(1);
  const area = useArea();
  return (
    <Card title="Notifications" icon={Bell} tone="rose" className={className} actions={<ViewAll to="/notifications" />} padded={false}>
      {list.isLoading && <div className="p-6"><Spinner /></div>}
      {list.data?.items.length === 0 && <EmptyState icon={Bell} title="No notifications yet" />}
      <ul className="space-y-2 p-3">
        {list.data?.items.slice(0, 6).map((n) => {
          const [Icon, tile] = EVENT_VISUAL[n.eventType] ?? EVENT_VISUAL.default!;
          const body = (
            <>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tile}`}><Icon size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className={`text-sm ${n.readAt ? 'font-semibold text-slate-700 dark:text-slate-200' : 'font-bold text-slate-900 dark:text-white'}`}>{n.title}</span>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                </span>
                {n.body && <span className="mt-0.5 block text-sm leading-snug text-slate-500">{n.body}</span>}
              </span>
            </>
          );
          return (
            <li key={n.id}>
              {n.link ? (
                <AreaLink to={resolveNotificationLink(area, n.link)} className="flex gap-3 rounded-xl border border-(--surface-border) p-3 transition hover:bg-slate-500/5">{body}</AreaLink>
              ) : (
                <div className="flex gap-3 rounded-xl border border-(--surface-border) p-3">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
