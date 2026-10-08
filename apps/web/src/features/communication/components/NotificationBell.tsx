import { Bell, CheckCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AreaLink, useArea, useAreaNavigate } from '@/app/router/area';
import { Spinner } from '@/components/ui';
import { useCan } from '@/features/auth/usePermissions';
import { useCommunicationAction, useNotifications, useUnreadCount } from '@/features/communication/hooks/useCommunication';
import { communicationService } from '@/features/communication/services/communicationService';
import { EVENT_VISUAL } from '@/features/communication/components/eventVisual';
import { NotificationWatcher } from '@/features/communication/components/NotificationWatcher';
import type { AppNotification } from '@/features/communication/types/communication.types';
import { resolveNotificationLink, timeAgo } from '@/features/communication/utils/notificationLinks';

/** Header bell: unread badge, and a drop-down of the latest notifications. */
export function NotificationBell() {
  const can = useCan();
  const area = useArea();
  const navigate = useAreaNavigate();
  const enabled = can('communication.any');
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const unreadQuery = useUnreadCount(enabled);
  const unread = unreadQuery.data?.unread ?? 0;
  const latest = useNotifications(1);
  const markRead = useCommunicationAction(communicationService.markRead, { toastErrors: false });
  const markAll = useCommunicationAction(communicationService.markAllRead);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (!enabled) return null;

  function openItem(n: AppNotification) {
    if (!n.readAt) markRead.mutate(n.id);
    setOpen(false);
    if (n.link) navigate(resolveNotificationLink(area, n.link));
  }

  return (
    <div ref={box} className="relative">
      <NotificationWatcher unread={unreadQuery.data?.unread} />
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="focus-ring relative rounded-lg p-2 text-slate-600 hover:bg-slate-500/10 dark:text-slate-300"
      >
        <Bell size={20} className="block" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="surface absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl shadow-depth-3"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-white/10">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Notifications</span>
              {unread > 0 && (
                <button onClick={() => markAll.mutate(undefined)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-96 overflow-y-auto">
              {latest.isLoading && <li className="p-4"><Spinner /></li>}
              {latest.data?.items.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</li>}
              {latest.data?.items.slice(0, 8).map((n) => {
                const [Icon, cls] = EVENT_VISUAL[n.eventType] ?? EVENT_VISUAL.default!;
                return (
                  <li key={n.id}>
                    <button onClick={() => openItem(n)} className={`flex w-full gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary-500/5 ${n.readAt ? '' : 'bg-primary-500/[0.06]'}`}>
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cls}`}><Icon size={15} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</span>
                        {n.body && <span className="block truncate text-xs text-slate-500">{n.body}</span>}
                        <span className="block text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                      </span>
                      {!n.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-600" aria-label="Unread" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <AreaLink to="/notifications" onClick={() => setOpen(false)} className="block border-t border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-primary-600 hover:bg-primary-500/5 dark:border-white/10 dark:text-primary-300">
              See all notifications
            </AreaLink>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
