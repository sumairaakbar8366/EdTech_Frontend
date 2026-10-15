import { useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useToast } from '@/components/ui/Toast/Toast';
import { CONSOLE_KEY, useOwnerNotifications } from '@/features/platform/hooks/useConsole';

/** Console header: unread owner notifications, and a pop-up when a new one arrives. */
export function NotificationBell() {
  const toast = useToast();
  const qc = useQueryClient();
  const latest = useOwnerNotifications({ show: 'unread', page: 1, pageSize: 5 });
  const unread = latest.data?.unread;
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    const items = latest.data?.items;
    if (!items) return;
    // The first load only remembers what is there; later polls announce what is new.
    if (seen.current) {
      const fresh = items.filter((n) => !seen.current!.has(n.id));
      if (fresh.length === 1) toast.info(fresh[0]!.title, fresh[0]!.body ?? '');
      else if (fresh.length > 1) toast.info(`${fresh.length} new notifications`, 'Open Notifications to see them.');
      if (fresh.length) void qc.invalidateQueries({ queryKey: [...CONSOLE_KEY, 'notifications'] });
    }
    seen.current = new Set([...(seen.current ?? []), ...items.map((n) => n.id)]);
  }, [latest.data, toast, qc]);

  return (
    <Link to="/notifications" className="focus-ring relative rounded-lg p-2 text-slate-600 hover:bg-slate-500/10 dark:text-slate-300" aria-label={unread ? `${unread} unread notifications` : 'Notifications'} title="Notifications">
      <Bell size={20} />
      {!!unread && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white">{unread > 99 ? '99+' : unread}</span>}
    </Link>
  );
}
