import type { KV } from './kv';

/**
 * Changes made with no internet. Only things that are safe to apply later are queued (attendance marks, task and
 * message updates, requests). Money, check-ins (which need the phone's location and fingerprint at that moment),
 * approvals and account changes are never queued: they need the internet.
 */
export interface QueuedWrite {
  id: string; method: string; path: string; body?: unknown;
  label: string; createdAt: number; attempts: number; status: 'pending' | 'failed'; error?: string;
}

interface Rule { method: string; re: RegExp; label: string; /** One queued change per target: a newer one replaces an older one. */ replace: boolean }
const RULES: Rule[] = [
  { method: 'POST', re: /^\/attendance\/sessions\/[0-9a-f-]+$/i, label: 'Class attendance', replace: true },
  { method: 'PATCH', re: /^\/tasks\/[0-9a-f-]+\/status$/i, label: 'Task update', replace: true },
  { method: 'POST', re: /^\/complaints\/(mine|received)\/[0-9a-f-]+\/messages$/i, label: 'Complaint reply', replace: false },
  { method: 'POST', re: /^\/messages\/threads\/[0-9a-f-]+\/messages$/i, label: 'Message', replace: false },
  { method: 'POST', re: /^\/complaints$/i, label: 'Complaint', replace: false },
  { method: 'POST', re: /^\/leave$/i, label: 'Leave request', replace: false },
  { method: 'POST', re: /^\/leave\/[0-9a-f-]+\/cancel$/i, label: 'Leave cancel', replace: true },
  { method: 'POST', re: /^\/document-requests$/i, label: 'Document request', replace: false },
  { method: 'POST', re: /^\/notifications\/(read-all|[0-9a-f-]+\/read)$/i, label: 'Read marks', replace: true },
  { method: 'PUT', re: /^\/exams\/[0-9a-f-]+\/marksheet$/i, label: 'Marks', replace: true },
];

export function queueRule(method: string, path: string): { label: string; replace: boolean } | null {
  const clean = path.split('?')[0]!;
  const r = RULES.find((x) => x.method === method.toUpperCase() && x.re.test(clean));
  return r ? { label: r.label, replace: r.replace } : null;
}

const KEY = (base: string) => `q:${base}`;
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export async function queueList(kv: KV, base: string): Promise<QueuedWrite[]> {
  return (await kv.get<QueuedWrite[]>(KEY(base))) ?? [];
}

export async function enqueue(kv: KV, base: string, method: string, path: string, body: unknown, now = Date.now()): Promise<QueuedWrite | null> {
  const rule = queueRule(method, path);
  if (!rule) return null;
  const items = await queueList(kv, base);
  const same = rule.replace ? items.findIndex((i) => i.method === method.toUpperCase() && i.path === path) : -1;
  const item: QueuedWrite = { id: same >= 0 ? items[same]!.id : newId(), method: method.toUpperCase(), path, body, label: rule.label, createdAt: same >= 0 ? items[same]!.createdAt : now, attempts: 0, status: 'pending' };
  if (same >= 0) items[same] = item; else items.push(item);
  await kv.set(KEY(base), items);
  return item;
}

export const queueCounts = (items: QueuedWrite[]) => ({ pending: items.filter((i) => i.status === 'pending').length, failed: items.filter((i) => i.status === 'failed').length });

/** What went wrong when sending one queued change. */
export type SendResult = { ok: true } | { ok: false; kind: 'network' | 'refused' | 'server'; message: string };

/**
 * Sends the queue in order. Stops at the first connection problem (the rest would fail the same way). A change the
 * school refuses (validation, permission, "class already ended") is parked as failed for a person to review and never
 * blocks the others; a server error is retried next time.
 */
export async function flush(kv: KV, base: string, send: (w: QueuedWrite) => Promise<SendResult>): Promise<{ sent: number; failed: number; stopped: boolean }> {
  const out = { sent: 0, failed: 0, stopped: false };
  let items = await queueList(kv, base);
  for (const w of items.filter((i) => i.status === 'pending')) {
    const r = await send(w);
    items = await queueList(kv, base); // other tabs / new changes may have been added meanwhile
    const idx = items.findIndex((i) => i.id === w.id);
    if (r.ok) { if (idx >= 0) items.splice(idx, 1); out.sent++; }
    else if (r.kind === 'refused') { if (idx >= 0) items[idx] = { ...items[idx]!, status: 'failed', attempts: items[idx]!.attempts + 1, error: r.message }; out.failed++; }
    else { if (idx >= 0) items[idx] = { ...items[idx]!, attempts: items[idx]!.attempts + 1, error: r.message }; out.stopped = true; await kv.set(KEY(base), items); break; }
    await kv.set(KEY(base), items);
  }
  return out;
}

export async function discard(kv: KV, base: string, id: string): Promise<void> {
  await kv.set(KEY(base), (await queueList(kv, base)).filter((i) => i.id !== id));
}
export async function retryFailed(kv: KV, base: string): Promise<void> {
  await kv.set(KEY(base), (await queueList(kv, base)).map((i) => (i.status === 'failed' ? { ...i, status: 'pending' as const, error: undefined } : i)));
}
export async function queueClear(kv: KV, base: string): Promise<void> { await kv.del(KEY(base)); }
