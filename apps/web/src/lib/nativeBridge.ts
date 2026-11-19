/**
 * The Skool EdTech phone app shows this website inside the app and offers it a few things a browser cannot do,
 * such as the phone's fingerprint / face lock for attendance. In a normal browser none of this runs
 * (`inNativeApp()` is false), so the website behaves exactly as before.
 */
interface NativeReply { id: number; ok: boolean; data?: unknown; error?: string }
declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    __skoolApp?: { version: string; platform: 'ios' | 'android' };
    __skoolNativeReply?: (reply: NativeReply) => void;
  }
}

export const inNativeApp = (): boolean => typeof window !== 'undefined' && !!window.ReactNativeWebView && !!window.__skoolApp;

const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
let counter = 0;

if (typeof window !== 'undefined') {
  window.__skoolNativeReply = (reply) => {
    const p = pending.get(reply.id);
    if (!p) return;
    pending.delete(reply.id);
    if (reply.ok) p.resolve(reply.data); else p.reject(new NativeError(reply.error ?? 'The phone could not do that.'));
  };
}

export class NativeError extends Error {
  constructor(message: string) { super(message); this.name = 'NativeError'; }
}

/** Asks the app to do something on the phone and waits for its answer (fingerprint prompts can take a while). */
export function nativeCall<T>(method: string, params: Record<string, unknown> = {}, timeoutMs = 120_000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (!inNativeApp()) { reject(new NativeError('This works only inside the Skool EdTech app.')); return; }
    const id = ++counter;
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    window.ReactNativeWebView!.postMessage(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.delete(id)) reject(new NativeError('The phone did not answer. Please try again.')); }, timeoutMs);
  });
}
