import { Linking, Platform } from 'react-native';
import * as LocalAuth from 'expo-local-authentication';
import { APP_VERSION } from '@/config';
import { biometricSupport, createDeviceKey, forgetDeviceKey, hasDeviceKey, signChallenge } from '@/services/deviceKey';
import { KEYS, secure } from '@/services/secureStore';
import type { BridgeDeps } from './bridge';

/** The real phone behind the bridge: its fingerprint / face lock, its secure storage, its browser for outside links. */
export const phoneDeps: BridgeDeps = {
  support: () => biometricSupport(),
  createKey: (userId) => createDeviceKey(userId),
  sign: (userId, challenge) => signChallenge(userId, challenge),
  forgetKey: (userId) => forgetDeviceKey(userId),
  hasKey: (userId) => hasDeviceKey(userId),
  quickUnlock: async () => (await secure.get(KEYS.bio)) === '1',
  setQuickUnlock: async (on) => {
    if (!on) { await secure.del(KEYS.bio); return false; }
    const ok = await LocalAuth.authenticateAsync({ promptMessage: 'Confirm to turn on fingerprint / face unlock' }).then((r) => r.success).catch(() => false);
    if (ok) await secure.set(KEYS.bio, '1');
    return ok;
  },
  openExternal: (url) => Linking.openURL(url),
  info: () => ({ version: APP_VERSION, platform: Platform.OS === 'ios' ? 'ios' : 'android' }),
};
