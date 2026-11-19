import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { discardChange, queuedChanges, reconnect, retryRefused, syncQueue } from '../../services/api/http';
import { getOfflineState, markOffline, subscribeOffline } from '../../lib/offline/layer';
import type { QueuedWrite } from '../../lib/offline/queue';

/**
 * A thin bar at the bottom that appears only when something needs saying: no internet (showing saved data), changes
 * waiting to be sent, or changes the school refused. It also notices when the connection returns and sends the queue.
 */
export function OfflineBanner() {
  const qc = useQueryClient();
  const s = useSyncExternalStore(subscribeOffline, getOfflineState, getOfflineState);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<QueuedWrite[]>([]);

  const tryReconnect = useCallback(async () => {
    const r = await reconnect();
    if (r === 'ok') void qc.invalidateQueries();
    else if (r === 'expired') window.location.reload();
  }, [qc]);

  useEffect(() => {
    const on = () => { void tryReconnect(); };
    const off = () => markOffline(true);
    const visible = () => { if (document.visibilityState === 'visible' && (getOfflineState().offline || getOfflineState().pending)) void tryReconnect(); };
    window.addEventListener('online', on); window.addEventListener('offline', off); document.addEventListener('visibilitychange', visible);
    // While offline, look again every 20 seconds (some phones do not say when the connection returns).
    const timer = window.setInterval(() => { if (getOfflineState().offline) void tryReconnect(); }, 20_000);
    if (typeof navigator !== 'undefined' && navigator.onLine === false) markOffline(true);
    else if (getOfflineState().pending) void syncQueue();
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); document.removeEventListener('visibilitychange', visible); window.clearInterval(timer); };
  }, [tryReconnect]);

  useEffect(() => { if (open) void queuedChanges().then(setItems); }, [open, s.pending, s.failed]);

  if (!s.offline && !s.pending && !s.failed && !s.syncing) return null;
  const text = s.syncing ? 'Sending your changes…'
    : s.offline ? `You are offline. Showing saved data${s.pending ? ` · ${s.pending} change${s.pending === 1 ? '' : 's'} will be sent when you are online` : ''}.`
      : s.failed ? `${s.failed} change${s.failed === 1 ? ' was' : 's were'} not accepted by the school. Tap to review.`
        : `${s.pending} change${s.pending === 1 ? '' : 's'} waiting to be sent.`;
  const tone = s.offline ? 'bg-amber-100 text-amber-900' : s.failed ? 'bg-rose-100 text-rose-900' : 'bg-slate-200 text-slate-800';
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] pb-[env(safe-area-inset-bottom)] text-sm shadow-[0_-2px_10px_rgb(0_0_0/0.12)]" role="status">
      {open ? (
        <div className="max-h-60 overflow-auto bg-white px-4 py-3 text-slate-800">
          {items.length === 0 ? <p className="text-slate-500">Nothing is waiting.</p> : items.map((i) => (
            <div key={i.id} className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
              <div><p className="font-semibold">{i.label}</p><p className="text-xs text-slate-500">{new Date(i.createdAt).toLocaleString()}{i.status === 'failed' ? ` · ${i.error ?? 'refused'}` : ' · waiting'}</p></div>
              {i.status === 'failed' && <button className="shrink-0 text-xs font-semibold text-rose-700" onClick={() => { void discardChange(i.id).then(() => queuedChanges().then(setItems)); }}>Discard</button>}
            </div>))}
          {s.failed > 0 && <button className="mt-2 text-xs font-semibold text-slate-700 underline" onClick={() => { void retryRefused(); }}>Try the refused changes again</button>}
        </div>
      ) : null}
      <button className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left font-medium ${tone}`} onClick={() => setOpen((o) => !o)}>
        <span>{text}</span>
        <span className="shrink-0 text-xs opacity-70">{open ? 'Close' : (s.pending || s.failed) ? 'Details' : ''}</span>
      </button>
    </div>
  );
}
