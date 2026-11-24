import { cacheClear, cacheGet, cachePut } from './cache';
import { idbKV, type KV } from './kv';
import { discard, enqueue, flush, queueClear, queueCounts, queueList, retryFailed, type QueuedWrite, type SendResult } from './queue';

/**
 * Makes the website work with no internet, in the browser and in the phone app: every answer from the school is kept, so
 * screens open from the saved copy; changes that are safe to apply later wait in a queue and are sent when the
 * connection returns. It only acts when the connection itself fails: if the school's server answers (even with an
 * error) nothing here changes.
 */
export class OfflineError extends Error {
  constructor(message = 'This needs the internet. Please try again when you are online.') { super(message); this.name = 'OfflineError'; }
}

let kv: KV = idbKV();
export const configureOffline = (opts: { kv?: KV }) => { if (opts.kv) kv = opts.kv; };

export interface OfflineState { offline: boolean; pending: number; failed: number; syncing: boolean; lastSyncAt: number | null }
let state: OfflineState = { offline: false, pending: 0, failed: 0, syncing: false, lastSyncAt: null };
const listeners = new Set<() => void>();
const set = (patch: Partial<OfflineState>) => { state = { ...state, ...patch }; listeners.forEach((f) => f()); };
export const getOfflineState = () => state;
export const subscribeOffline = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const markOffline = (offline: boolean) => { if (state.offline !== offline) set({ offline }); };

/** fetch() rejects with a TypeError when there is no connection (any browser). */
export const isNetworkFailure = (e: unknown): boolean => e instanceof TypeError;

export async function rememberAnswer(base: string, path: string, data: unknown): Promise<void> {
  try { await cachePut(kv, base, path, data); } catch { /* storage full or blocked: the live answer is still used */ }
}

export async function offlineGet<T>(base: string, path: string): Promise<T> {
  markOffline(true);
  const hit = await cacheGet<T>(kv, base, path);
  if (hit) return hit.data;
  throw new OfflineError('This page was not saved on this phone yet. Connect to the internet once to open it.');
}

export async function offlineWrite<T>(base: string, method: string, path: string, body: unknown): Promise<T> {
  markOffline(true);
  const item = await enqueue(kv, base, method, path, body);
  if (!item) throw new OfflineError();
  await refreshCounts(base);
  return { queued: true, offline: true } as unknown as T;
}

export const hasOfflineSession = async (base: string): Promise<boolean> => !!(await cacheGet(kv, base, '/auth/me'));

/** Saved data belongs to one person: when someone else signs in on this phone, the previous person's copies are dropped. */
export async function rememberUser(base: string, userId: string): Promise<void> {
  const key = `u:${base}`;
  const prev = await kv.get<string>(key);
  if (prev && prev !== userId) { await cacheClear(kv); await queueClear(kv, base); await refreshCounts(base); }
  await kv.set(key, userId);
}

/** Signing out erases the saved copies of school data; changes not yet sent stay for the same person's next sign-in. */
export async function onSignedOut(): Promise<void> { await cacheClear(kv); }

export async function refreshCounts(base: string): Promise<void> {
  const c = queueCounts(await queueList(kv, base));
  set({ pending: c.pending, failed: c.failed });
}

export async function syncNow(base: string, send: Parameters<typeof flush>[2]): Promise<{ sent: number; failed: number; stopped: boolean }> {
  if (state.syncing) return { sent: 0, failed: 0, stopped: false };
  set({ syncing: true });
  try {
    const r = await flush(kv, base, send);
    if (r.sent > 0 || !r.stopped) set({ lastSyncAt: Date.now() });
    return r;
  } finally { set({ syncing: false }); await refreshCounts(base); }
}

export type { SendResult };

export const listQueued = (base: string): Promise<QueuedWrite[]> => queueList(kv, base);
export async function discardQueued(base: string, id: string): Promise<void> { await discard(kv, base, id); await refreshCounts(base); }
export async function retryQueued(base: string): Promise<void> { await retryFailed(kv, base); await refreshCounts(base); }
