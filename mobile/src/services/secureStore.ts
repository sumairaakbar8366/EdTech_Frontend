import * as SecureStore from 'expo-secure-store';

/** Tokens and device secrets only. Never log what goes through here. */
const opts: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };
export const secure = {
  get: (k: string) => SecureStore.getItemAsync(k, opts).catch(() => null),
  set: (k: string, v: string) => SecureStore.setItemAsync(k, v, opts),
  del: (k: string) => SecureStore.deleteItemAsync(k, opts).catch(() => undefined),
};
export const KEYS = { refresh: 'skool.refresh', slug: 'skool.slug', meta: 'skool.meta', dbKey: 'skool.dbkey', bio: 'skool.bio', installId: 'skool.install', signedIn: 'skool.signedin', lastPath: 'skool.lastpath', school: 'skool.school' } as const;
