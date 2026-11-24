/** A tiny key-value store. In the browser / phone app it is IndexedDB (survives restarts, holds megabytes); tests use memory. */
export interface KV {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

export function memoryKV(): KV {
  const m = new Map<string, unknown>();
  return {
    get: async <T>(k: string) => m.get(k) as T | undefined,
    set: async (k, v) => { m.set(k, JSON.parse(JSON.stringify(v))); },
    del: async (k) => { m.delete(k); },
    keys: async () => [...m.keys()],
  };
}

export function idbKV(dbName = 'skool-offline', store = 'kv'): KV {
  if (typeof indexedDB === 'undefined') return memoryKV();
  let dbp: Promise<IDBDatabase> | null = null;
  const open = () => (dbp ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
  const run = async <T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
    const db = await open();
    return new Promise<T>((resolve, reject) => {
      const r = fn(db.transaction(store, mode).objectStore(store));
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  };
  const fallback = memoryKV();
  // If IndexedDB is blocked (private mode), the app still works, just without keeping data across restarts.
  const safe = async <T>(f: () => Promise<T>, g: () => Promise<T>) => { try { return await f(); } catch { return g(); } };
  return {
    get: <T>(k: string) => safe(() => run<T | undefined>('readonly', (s) => s.get(k)), () => fallback.get<T>(k)),
    set: (k, v) => safe(async () => { await run('readwrite', (s) => s.put(v, k)); }, () => fallback.set(k, v)),
    del: (k) => safe(async () => { await run('readwrite', (s) => s.delete(k)); }, () => fallback.del(k)),
    keys: () => safe(async () => (await run<IDBValidKey[]>('readonly', (s) => s.getAllKeys())).map(String), () => fallback.keys()),
  };
}
