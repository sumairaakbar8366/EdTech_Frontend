import { createPublicKey, randomBytes, verify } from 'node:crypto';

// A fake phone: an in-memory secure store, and a fingerprint that can be made to fail.
const g = global as any;
g.store = {}; g.noFaceIdPermission = false; g.fingerprintMatches = true; g.prompts = [] as string[];
jest.mock('expo-secure-store', () => { const g = global as any; return {
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1, WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 2,
  setItemAsync: async (k: string, v: string, o: any = {}) => { if (g.keychainLocked) throw new Error('Keychain is locked'); if (o.requireAuthentication && g.noFaceIdPermission) throw new Error("Calling the 'setValueWithKeyAsync' function has failed → Caused by: You must set NSFaceIDUsageDescription in your Info.plist file to use the requireAuthentication option"); g.store[k] = v; },
  getItemAsync: async (k: string, o: any = {}) => { if (o.requireAuthentication) { g.prompts.push('os'); if (!g.fingerprintMatches) throw new Error('Authentication failed'); } return g.store[k] ?? null; },
  deleteItemAsync: async (k: string) => { delete g.store[k]; },
}; });
jest.mock('expo-local-authentication', () => { const g = global as any; return {
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
  authenticateAsync: async (o: any) => { g.prompts.push(o.promptMessage); return { success: g.fingerprintMatches }; },
  hasHardwareAsync: async () => true, isEnrolledAsync: async () => true, supportedAuthenticationTypesAsync: async () => [1],
}; });
jest.mock('expo-crypto', () => ({ getRandomBytesAsync: async (n: number) => new Uint8Array(require('crypto').randomBytes(n)) }));
import { createDeviceKey, forgetDeviceKey, hasDeviceKey, signChallenge } from '../src/services/deviceKey';

const SPKI = Buffer.from('3059301306072a8648ce3d020106082a8648ce3d030107034200', 'hex');
const serverAccepts = (pub: string, challenge: string, sig: string) => {
  const key = createPublicKey({ key: Buffer.concat([SPKI, Buffer.from(pub, 'base64')]), format: 'der', type: 'spki' });
  return verify('sha256', Buffer.from(challenge), { key, dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64'));
};
beforeEach(() => { g.keychainLocked = false; g.store = {}; g.noFaceIdPermission = false; g.fingerprintMatches = true; g.prompts = []; });

describe('the attendance key', () => {
  it('in the installed app the phone guards the key itself, and the school accepts the signature', async () => {
    const pub = await createDeviceKey('u1');
    expect(await hasDeviceKey('u1')).toBe(true);
    const c = randomBytes(32).toString('base64url');
    expect(serverAccepts(pub, c, await signChallenge('u1', c))).toBe(true);
    expect(g.prompts).toContain('os'); // the phone asked for the fingerprint when the key was read
  });

  it('in Expo Go on an iPhone (no Face ID permission) it still works: the app asks for the fingerprint / face itself', async () => {
    g.noFaceIdPermission = true;
    const pub = await createDeviceKey('u1');
    expect(await hasDeviceKey('u1')).toBe(true);
    expect(g.prompts).toContain('Set up fingerprint or face for attendance');
    g.prompts = [];
    const c = randomBytes(32).toString('base64url');
    expect(serverAccepts(pub, c, await signChallenge('u1', c))).toBe(true);
    expect(g.prompts).toEqual(['Verify to mark attendance']); // asked before every use
  });

  it('a wrong or cancelled fingerprint never gives a signature (either way)', async () => {
    g.noFaceIdPermission = true;
    await createDeviceKey('u1');
    g.fingerprintMatches = false;
    await expect(signChallenge('u1', 'c')).rejects.toThrow(/cancelled or did not match/);
    await expect(createDeviceKey('u2')).rejects.toThrow(/cancelled or did not match/);
    expect(await hasDeviceKey('u2')).toBe(false); // nothing was saved for a failed set-up
  });

  it('other storage errors are not hidden by the fallback', async () => {
    g.keychainLocked = true;
    await expect(createDeviceKey('u1')).rejects.toThrow('Keychain is locked');
  });

  it('forgetting removes the key and the marker', async () => {
    g.noFaceIdPermission = true; await createDeviceKey('u1'); await forgetDeviceKey('u1');
    expect(await hasDeviceKey('u1')).toBe(false);
    await expect(signChallenge('u1', 'c')).rejects.toThrow(/no attendance key/);
  });
});
