import { SCHOOL_ROLES } from '@schoolerp/shared';
import { Megaphone, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge, Card, EmptyState, IconButton, Spinner } from '@/components/ui';
import { useAnnouncements, useCommunicationAction } from '@/features/communication/hooks/useCommunication';
import { communicationService } from '@/features/communication/services/communicationService';
import { formatDate } from '@/lib/format';

const ROLE_NAME = Object.fromEntries(SCHOOL_ROLES.map((r) => [r.key, r.name]));

/** Announcements as a stack of cards; administrators can delete them. */
export function AnnouncementList({ canDelete = false }: { canDelete?: boolean }) {
  const list = useAnnouncements();
  const remove = useCommunicationAction(communicationService.removeAnnouncement, { success: 'Announcement deleted' });
  if (list.isLoading) return <Spinner />;
  if (!list.data?.length) return <Card><EmptyState icon={Megaphone} title="No announcements yet" tone="primary" /></Card>;
  return (
    <div className="space-y-3">
      {list.data.map((a, i) => (
        <motion.article
          key={a.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: Math.min(i, 8) * 0.05 }}
          style={{ transformPerspective: 900 }}
          data-tone="primary"
          className="surface tone-card rounded-xl p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-600 dark:text-primary-300"><Megaphone size={18} /></span>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">{a.title}</h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                {formatDate(a.publishedAt)} ·
                {a.targetRoles.map((r) => <Badge key={r} tone="slate">{ROLE_NAME[r] ?? r}</Badge>)}
                {!!a.targetUserIds?.length && <Badge tone="slate">{a.targetUserIds.length} {a.targetUserIds.length === 1 ? 'person' : 'people'}</Badge>}
                {!a.targetRoles.length && !a.targetUserIds?.length && <Badge tone="primary">Everyone</Badge>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{a.body}</p>
            </div>
            {canDelete && <IconButton icon={Trash2} label="Delete announcement" tone="danger" onClick={() => remove.mutate(a.id)} />}
          </div>
        </motion.article>
      ))}
    </div>
  );
}
