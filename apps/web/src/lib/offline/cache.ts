import type { KV } from './kv';

/** Saved copies of answers the school's server gave (GET only), so screens open with no internet. */
const PREFIX = 'c:';
export const cacheKey = (base: string, path: string) => `${PREFIX}${base}${path}`;

/** Answers that must never be kept: they are about signing in, not about school data. */
export const cacheable = (path: string): boolean => !/^\/auth\/(?!me(\?|$))/.test(path) && !/^\/public\/(login|social)/.test(path);

export async function cachePut(kv: KV, base: string, path: string, data: unknown, now = Date.now()): Promise<void> {
  if (!cacheable(path)) return;
  await kv.set(cacheKey(base, path), { at: now, data });
}
export async function cacheGet<T>(kv: KV, base: string, path: string): Promise<{ data: T; at: number } | undefined> {
  return kv.get<{ data: T; at: number }>(cacheKey(base, path));
}
export async function cacheClear(kv: KV): Promise<void> {
  for (const k of await kv.keys()) if (k.startsWith(PREFIX)) await kv.del(k);
}
