import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast/Toast';
import { communicationService } from '@/features/communication/services/communicationService';

/**
 * Near-real-time updates without websockets: when the unread count goes up, the newest
 * notifications pop up as toasts and every open screen refetches its data, so a leave approval
 * or a document request update appears for the other person within seconds.
 */
export function NotificationWatcher({ unread }: { unread: number | undefined }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const last = useRef<number | undefined>(undefined);
  const shown = useRef(new Set<string>());

  useEffect(() => {
    if (unread === undefined) return;
    const before = last.current;
    last.current = unread;
    // First reading after sign-in: remember what is already there, do not pop old items.
    if (before === undefined || unread <= before) return;
    void communicationService.notifications(1).then((page) => {
      const fresh = page.items.filter((n) => !n.readAt && !shown.current.has(n.id)).slice(0, unread - before);
      for (const n of fresh.reverse()) {
        shown.current.add(n.id);
        toast.info(n.title, n.body ?? 'Open notifications for details.');
      }
      // Refresh whatever the user is looking at (keep session and tenant data).
      void queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'auth' && q.queryKey[0] !== 'tenant' });
    });
  }, [unread, toast, queryClient]);

  return null;
}
