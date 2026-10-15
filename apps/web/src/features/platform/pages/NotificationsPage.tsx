import { Bell, Building2, CheckCheck, ClipboardList, KeyRound, type LucideIcon, UserSearch, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Alert, Badge, Button, Card, EmptyState, PageHeader, Pagination, Spinner, Tabs } from '@/components/ui';
import { CONSOLE_KEY, useOwnerNotifications } from '@/features/platform/hooks/useConsole';
import { consoleService } from '@/features/platform/services/consoleService';
import type { OwnerNotification, OwnerNotificationKind } from '@/features/platform/types/console.types';
import { useAction } from '@/lib/hooks/useAction';

const KIND: Record<OwnerNotificationKind, { label: string; icon: LucideIcon }> = {
  school_signup: { label: 'Sign-up', icon: Building2 },
  school_application: { label: 'Application', icon: ClipboardList },
  payment_received: { label: 'Payment', icon: Wallet },
  password_reset_request: { label: 'Password reset', icon: KeyRound },
  password_reset_done: { label: 'Password changed', icon: KeyRound },
  user_id_request: { label: 'User ID request', icon: UserSearch },
};

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Everything the owner should know about: sign-ups, applications, payments and account requests. */
export function NotificationsPage() {
  const [show, setShow] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const list = useOwnerNotifications({ show, page });
  const markRead = useAction((ids?: string[]) => consoleService.markRead(ids), { invalidate: [[...CONSOLE_KEY, 'notifications']] });
  const unread = list.data?.unread ?? 0;

  return (
    <div>
      <PageHeader title="Notifications" sub="Sign-ups, applications, payments and password or User ID requests from every school" icon={Bell} tone="teal" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Tabs
          tabs={[{ id: 'all', label: 'All', icon: Bell }, { id: 'unread', label: `Unread (${unread})`, icon: CheckCheck }]}
          value={show}
          onChange={(v) => { setShow(v); setPage(1); }}
        />
        <Button variant="secondary" icon={CheckCheck} disabled={!unread} loading={markRead.isPending && !markRead.variables} onClick={() => markRead.mutate(undefined)}>Mark all read</Button>
      </div>

      <Card title={show === 'unread' ? 'Unread' : 'All notifications'} icon={Bell} tone="teal" padded={false}>
        {list.isLoading && <div className="px-5"><Spinner /></div>}
        {list.error && <div className="p-5"><Alert>Could not load notifications.</Alert></div>}
        {list.data?.items.length === 0 && <EmptyState icon={Bell} title={show === 'unread' ? 'All caught up' : 'No notifications yet'}>New sign-ups and requests will appear here.</EmptyState>}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
          {list.data?.items.map((n) => <Row key={n.id} n={n} onRead={() => markRead.mutate([n.id])} />)}
        </ul>
        {list.data && <Pagination page={page} pageSize={list.data.pageSize} total={list.data.total} onChange={setPage} />}
      </Card>
    </div>
  );
}

function Row({ n, onRead }: { n: OwnerNotification; onRead: () => void }) {
  const kind = KIND[n.kind] ?? { label: n.kind, icon: Bell };
  const Icon = kind.icon;
  const unread = !n.readAt;
  return (
    <li className={`flex items-start gap-3 px-5 py-4 ${unread ? 'bg-orange-500/5' : ''}`}>
      <Icon size={18} className="mt-1 shrink-0 text-slate-500 dark:text-slate-400" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-slate-900 dark:text-white ${unread ? 'font-bold' : 'font-semibold'}`}>{n.title}</span>
          <Badge tone={n.kind.startsWith('password') || n.kind === 'user_id_request' ? 'amber' : n.kind === 'payment_received' ? 'emerald' : 'primary'}>{kind.label}</Badge>
        </div>
        {n.body && <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{n.body}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span>{when(n.createdAt)}</span>
          {n.link && <Link to={n.link} onClick={unread ? onRead : undefined} className="font-semibold text-orange-700 hover:underline dark:text-orange-300">Open</Link>}
          {unread && <button type="button" onClick={onRead} className="font-semibold hover:underline">Mark read</button>}
        </div>
      </div>
    </li>
  );
}
