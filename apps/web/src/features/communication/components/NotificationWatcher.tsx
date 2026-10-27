import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useArea, useAreaNavigate } from '@/app/router/area';
import { useAuth } from '@/features/auth/AuthProvider';
import { EVENT_VISUAL, URGENT_EVENTS } from '@/features/communication/components/eventVisual';
import { communicationService } from '@/features/communication/services/communicationService';
import type { AppNotification } from '@/features/communication/types/communication.types';
import { resolveNotificationLink, timeAgo } from '@/features/communication/utils/notificationLinks';

const NORMAL_MS = 10_000;
const MAX_VISIBLE = 4;
/** On opening the app, unread notifications this recent still pop up once. */
const CATCH_UP_MS = 3 * 3600_000;

const BORDER = { red: 'border-l-rose-500 bg-rose-50 dark:bg-rose-950/60', amber: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/50', blue: 'border-l-sky-500 bg-sky-50 dark:bg-sky-950/50' } as const;

/** Popped ids, per login and browser, so a notification pops up only once. */
function seenStore(userId: string) {
  const key = `schoolerp-popped:${userId}`;
  let ids: string[] = [];
  try { ids = JSON.parse(localStorage.getItem(key) ?? '[]') as string[]; } catch { /* storage unavailable */ }
  const set = new Set(ids);
  return {
    has: (id: string) => set.has(id),
    add: (id: string) => {
      set.add(id);
      try { localStorage.setItem(key, JSON.stringify([...set].slice(-300))); } catch { /* storage unavailable */ }
    },
  };
}

/** A short two-tone chime for urgent notifications (no sound file needed). */
function chime() {
  try {
    const ctx = new AudioContext();
    [880, 660].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.2);
    });
  } catch { /* audio blocked until the user interacts with the page */ }
}

/**
 * New notifications pop up at the top right as cards (icon, title, message, Open). Urgent ones (a
 * missed or late class, a class starting soon, a child absent, overdue fees) are coloured, stay until
 * closed and chime; others close after 10 seconds (not while hovered). On opening the app, unread
 * notifications from the last few hours pop up once. Every screen also refreshes its data.
 */
export function NotificationWatcher({ unread }: { unread: number | undefined }) {
  const { me } = useAuth();
  const userId = me?.scope === 'school' ? me.user.id : 'platform';
  const queryClient = useQueryClient();
  const area = useArea();
  const navigate = useAreaNavigate();
  const last = useRef<number | undefined>(undefined);
  const seen = useRef(seenStore(userId));
  const [popups, setPopups] = useState<AppNotification[]>([]);
  const [hovered, setHovered] = useState(false);

  const close = useCallback((id: string) => setPopups((p) => p.filter((n) => n.id !== id)), []);

  const pop = useCallback((items: AppNotification[]) => {
    const fresh = items.filter((n) => !n.readAt && !seen.current.has(n.id));
    if (!fresh.length) return;
    fresh.forEach((n) => seen.current.add(n.id));
    setPopups((p) => [...fresh, ...p].slice(0, 12));
    if (fresh.some((n) => URGENT_EVENTS[n.eventType])) chime();
    // While the tab is in the background, also use the browser's own notification when allowed.
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      for (const n of fresh.slice(0, 3)) new Notification(n.title, { body: n.body ?? undefined, tag: n.id });
    }
  }, []);

  useEffect(() => {
    if (unread === undefined) return;
    const before = last.current;
    last.current = unread;
    if (before === undefined) {
      // Opening the app: catch up on recent unread notifications not popped before.
      if (unread > 0) void communicationService.notifications(1).then((page) => pop(page.items.filter((n) => Date.now() - new Date(n.createdAt).getTime() < CATCH_UP_MS).slice(0, MAX_VISIBLE)));
      return;
    }
    if (unread <= before) return;
    void communicationService.notifications(1).then((page) => {
      pop(page.items.slice(0, unread - before));
      // Refresh whatever the user is looking at (keep session and tenant data).
      void queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'auth' && q.queryKey[0] !== 'tenant' });
    });
  }, [unread, queryClient, pop]);

  // Non-urgent popups close by themselves, unless the pointer is on them.
  useEffect(() => {
    if (hovered) return;
    const timers = popups.filter((n) => !URGENT_EVENTS[n.eventType]).map((n) => setTimeout(() => close(n.id), NORMAL_MS));
    return () => timers.forEach(clearTimeout);
  }, [popups, hovered, close]);

  const open = (n: AppNotification) => {
    close(n.id);
    void communicationService.markRead(n.id).then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }));
    if (n.link) navigate(resolveNotificationLink(area, n.link));
  };

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-20 z-[120] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="assertive" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <AnimatePresence initial={false}>
        {popups.slice(0, MAX_VISIBLE).map((n) => {
          const [Icon, tile] = EVENT_VISUAL[n.eventType] ?? EVENT_VISUAL.default!;
          const urgent = URGENT_EVENTS[n.eventType];
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.25 }}
              role={urgent ? 'alert' : 'status'}
              className={`pointer-events-auto flex gap-3 rounded-xl border border-l-4 border-(--surface-border) p-3.5 shadow-xl shadow-slate-900/15 ${urgent ? BORDER[urgent] : 'border-l-primary-500 bg-(--surface-bg)'}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tile}`}><Icon size={18} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</span>
                  <button onClick={() => close(n.id)} className="-mr-1 -mt-1 rounded p-1 text-slate-400 hover:bg-slate-500/10 hover:text-slate-600" aria-label="Close"><X size={14} /></button>
                </div>
                {n.body && <p className="mt-0.5 text-sm leading-snug text-slate-600 dark:text-slate-300">{n.body}</p>}
                <div className="mt-2 flex items-center gap-3">
                  {n.link && <button onClick={() => open(n)} className="rounded-md bg-primary-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-primary-700">Open</button>}
                  <span className="text-xs text-slate-400">{urgent ? 'Urgent · ' : ''}{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {popups.length > MAX_VISIBLE && (
        <button onClick={() => setPopups((p) => p.slice(0, MAX_VISIBLE))} className="pointer-events-auto self-end rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold text-white">+{popups.length - MAX_VISIBLE} more · open the bell</button>
      )}
    </div>,
    document.body,
  );
}
