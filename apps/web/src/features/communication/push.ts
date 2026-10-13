import { api } from '@/services/api/http';

/** Web push on this device: service worker + PushManager, registered with the API per login. */

const supported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function keyBytes(base64url: string): Uint8Array {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export type PushState = 'unsupported' | 'unavailable' | 'denied' | 'off' | 'on';

/** Whether push can be used here and whether this browser is subscribed. */
export async function pushState(): Promise<PushState> {
  if (!supported()) return 'unsupported';
  const { publicKey } = await api<{ publicKey: string | null }>('/notifications/push/key');
  if (!publicKey) return 'unavailable';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  const sub = await reg?.pushManager.getSubscription();
  return sub ? 'on' : 'off';
}

/** Asks for permission, subscribes this browser and registers it for the signed-in user. */
export async function enablePush(): Promise<PushState> {
  const { publicKey } = await api<{ publicKey: string | null }>('/notifications/push/key');
  if (!publicKey) return 'unavailable';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off';
  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) as BufferSource }));
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  await api('/notifications/push/subscribe', { method: 'POST', body: { endpoint: json.endpoint, keys: json.keys } });
  return 'on';
}

export async function disablePush(): Promise<PushState> {
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await api('/notifications/push/unsubscribe', { method: 'POST', body: { endpoint: sub.endpoint } }).catch(() => undefined);
    await sub.unsubscribe();
  }
  return 'off';
}
