import { Bell, CheckCheck, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useArea, useAreaNavigate } from '@/app/router/area';
import { Button, Card, EmptyState, IconButton, PageHeader, Spinner, Tabs } from '@/components/ui';
import { EVENT_VISUAL } from '@/features/communication/components/eventVisual';
import { AnnouncementList } from '@/features/communication/components/AnnouncementList';
import { useCommunicationAction, useNotifications } from '@/features/communication/hooks/useCommunication';
import { communicationService } from '@/features/communication/services/communicationService';
import { resolveNotificationLink, timeAgo } from '@/features/communication/utils/notificationLinks';
import { compactNumber } from '@/lib/format';

type Tab = 'inbox' | 'announcements';

/** Every user's notification inbox, plus the school announcements addressed to them. */
export function NotificationsPage() {
  const area = useArea();
  const navigate = useAreaNavigate();
  const [tab, setTab] = useState<Tab>('inbox');
  const [page, setPage] = useState(1);
  const list = useNotifications(page);
  const markRead = useCommunicationAction(communicationService.markRead, { toastErrors: false });
  const markAll = useCommunicationAction(communicationService.markAllRead, { success: (r) => `${r.updated} marked as read` });
  const d = list.data;
  const pages = d ? Math.max(1, Math.ceil(d.total / d.pageSize)) : 1;

  return (
    <div>
      <PageHeader
        title="Notifications"
        sub={d ? `${compactNumber(d.unread)} unread` : 'Updates from your school'}
        icon={Bell}
        tone="rose"
        actions={tab === 'inbox' && !!d?.unread && <Button variant="secondary" icon={CheckCheck} onClick={() => markAll.mutate(undefined)} loading={markAll.isPending}>Mark all read</Button>}
      />
      <Tabs tabs={[{ id: 'inbox' as const, label: 'Inbox', icon: Bell }, { id: 'announcements' as const, label: 'Announcements', icon: Megaphone }]} value={tab} onChange={setTab} />
      {tab === 'announcements' ? (
        <AnnouncementList />
      ) : (
        <Card padded={false}>
          {list.isLoading && <div className="p-5"><Spinner /></div>}
          {d?.items.length === 0 && <EmptyState icon={Bell} title="No notifications yet" tone="rose">Fee receipts, results, homework and messages will appear here.</EmptyState>}
          <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
            {d?.items.map((n, i) => {
              const [Icon, cls] = EVENT_VISUAL[n.eventType] ?? EVENT_VISUAL.default!;
              return (
                <motion.li key={n.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}>
                  <button
                    onClick={() => {
                      if (!n.readAt) markRead.mutate(n.id);
                      if (n.link) navigate(resolveNotificationLink(area, n.link));
                    }}
                    className={`flex w-full items-start gap-4 px-5 py-3.5 text-left transition-colors hover:bg-primary-500/5 ${n.readAt ? '' : 'bg-primary-500/[0.05]'}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cls}`}><Icon size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-800 dark:text-slate-100">{n.title}</span>
                      {n.body && <span className="block text-sm text-slate-500">{n.body}</span>}
                    </span>
                    <span className="shrink-0 text-right text-sm text-slate-400">
                      {timeAgo(n.createdAt)}
                      {!n.readAt && <span className="ml-auto mt-1 block h-2 w-2 rounded-full bg-magenta-500" aria-label="Unread" />}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
          {pages > 1 && (
            <div className="flex items-center justify-end gap-1 border-t border-slate-200 px-5 py-3 text-slate-600 dark:border-white/5 dark:text-slate-300">
              <IconButton icon={ChevronLeft} label="Newer" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
              <span className="px-2">Page {page} of {pages}</span>
              <IconButton icon={ChevronRight} label="Older" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
