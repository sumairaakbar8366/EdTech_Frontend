import { createPublicKey, randomBytes, verify } from 'node:crypto';
import { handleBridge, looksSignedIn, opensInApp, replyScript, type BridgeDeps } from '../src/native/bridge';
import { newKeyPair, signChallengeWith } from '../src/services/signing';

const SITE = 'https://skooledtech.com';
const SPKI = Buffer.from('3059301306072a8648ce3d020106082a8648ce3d030107034200', 'hex');

/** A fake phone: keys live in memory, the "fingerprint" can be made to fail. */
function phone(over: Partial<BridgeDeps> = {}) {
  const keys = new Map<string, Uint8Array>(); const state = { match: true, quick: false };
  const deps: BridgeDeps = {
    support: async () => ({ available: true, label: 'Fingerprint' }),
    createKey: async (u) => { const k = newKeyPair(new Uint8Array(randomBytes(32))); keys.set(u, k.privateKey); return k.publicKeyBase64; },
    sign: async (u, c) => { if (!state.match) throw new Error('Authentication failed'); const k = keys.get(u); if (!k) throw new Error('This phone has no attendance key.'); return signChallengeWith(k, c); },
    forgetKey: async (u) => { keys.delete(u); }, hasKey: async (u) => keys.has(u),
    setQuickUnlock: async (on) => (state.quick = on), quickUnlock: async () => state.quick,
    openExternal: jest.fn(async () => undefined), info: () => ({ version: '1.0.0', platform: 'android' }), ...over,
  };
  return { deps, state };
}

describe('what the website may ask the phone', () => {
  it('makes a key, then signs the school\'s challenge; the school\'s own check accepts it', async () => {
    const { deps } = phone();
    const made: any = await handleBridge({ id: 1, method: 'biometric.createKey', params: { userId: 'u1' } }, deps);
    expect(made).toMatchObject({ id: 1, ok: true });
    const signed: any = await handleBridge({ id: 2, method: 'biometric.sign', params: { userId: 'u1', challenge: 'abc-challenge' } }, deps);
    const key = createPublicKey({ key: Buffer.concat([SPKI, Buffer.from(made.data.publicKey, 'base64')]), format: 'der', type: 'spki' });
    expect(verify('sha256', Buffer.from('abc-challenge'), { key, dsaEncoding: 'ieee-p1363' }, Buffer.from(signed.data.signature, 'base64'))).toBe(true);
  });
  it('a fingerprint that does not match gives a plain message, not a crash', async () => {
    const { deps, state } = phone(); await handleBridge({ id: 1, method: 'biometric.createKey', params: { userId: 'u1' } }, deps);
    state.match = false;
    const r = await handleBridge({ id: 2, method: 'biometric.sign', params: { userId: 'u1', challenge: 'c' } }, deps);
    expect(r.ok).toBe(false); expect(r.error).toMatch(/cancelled or did not match/);
  });
  it('signing without a key says so; bad inputs and unknown requests are refused', async () => {
    const { deps } = phone();
    expect((await handleBridge({ id: 1, method: 'biometric.sign', params: { userId: 'nobody', challenge: 'c' } }, deps)).error).toMatch(/no attendance key/);
    expect((await handleBridge({ id: 2, method: 'biometric.sign', params: { userId: 5 } }, deps)).ok).toBe(false);
    expect((await handleBridge({ id: 3, method: 'format.disk' }, deps)).error).toMatch(/Unknown request/);
  });
  it('only web, mail and phone links open outside the app', async () => {
    const { deps } = phone();
    expect((await handleBridge({ id: 1, method: 'open.external', params: { url: 'https://example.com' } }, deps)).ok).toBe(true);
    expect((await handleBridge({ id: 2, method: 'open.external', params: { url: 'file:///etc/passwd' } }, deps)).ok).toBe(false);
    expect((await handleBridge({ id: 3, method: 'open.external', params: { url: 'javascript:alert(1)' } }, deps)).ok).toBe(false);
  });
  it('quick unlock and app info', async () => {
    const { deps } = phone();
    expect((await handleBridge({ id: 1, method: 'quickUnlock.set', params: { on: true } }, deps)).data).toEqual({ on: true });
    expect((await handleBridge({ id: 2, method: 'quickUnlock.get' }, deps)).data).toEqual({ on: true });
    expect((await handleBridge({ id: 3, method: 'app.info' }, deps)).data).toEqual({ version: '1.0.0', platform: 'android' });
  });
  it('replies are handed back as a script the website understands', () => {
    expect(replyScript({ id: 7, ok: true, data: { x: 1 } })).toBe('window.__skoolNativeReply && window.__skoolNativeReply({"id":7,"ok":true,"data":{"x":1}}); true;');
  });
});

describe('which pages stay inside the app', () => {
  it('the school\'s own website does; other sites do not', () => {
    expect(opensInApp('https://skooledtech.com/demo/students', SITE)).toBe(true);
    expect(opensInApp('https://skooledtech.com/api/s/demo/auth/me', SITE)).toBe(true);
    expect(opensInApp('https://accounts.google.com/o/oauth2/v2/auth', SITE)).toBe(true);
    expect(opensInApp('https://evil.example.com/login', SITE)).toBe(false);
    expect(opensInApp('mailto:a@b.c', SITE)).toBe(false);
    expect(opensInApp('not a url', SITE)).toBe(false);
  });
  it('knows when the person is signed in (to skip the welcome page next time)', () => {
    expect(looksSignedIn('https://skooledtech.com/demo', SITE)).toBe(true);
    expect(looksSignedIn('https://skooledtech.com/demo/attendance', SITE)).toBe(true);
    expect(looksSignedIn('https://skooledtech.com/console/schools', SITE)).toBe(true);
    for (const u of ['https://skooledtech.com/', 'https://skooledtech.com/login', 'https://skooledtech.com/register', 'https://skooledtech.com/demo/login', 'https://skooledtech.com/demo/forgot-password', 'https://other.com/demo']) expect(looksSignedIn(u, SITE)).toBe(false);
  });
});

import { accessPathFor, loginPathFor, onSignInPage, schoolOf } from '../src/native/bridge';
describe('which school, and where the Login card goes', () => {
  it('reads the school from a signed-in address (never the owner console)', () => {
    expect(schoolOf('https://skooledtech.com/demo/admin', SITE)).toBe('demo');
    expect(schoolOf('https://skooledtech.com/greenfield-high/attendance', SITE)).toBe('greenfield-high');
    expect(schoolOf('https://skooledtech.com/console/schools', SITE)).toBeNull();
    expect(schoolOf('https://skooledtech.com/demo/login', SITE)).toBeNull();
    expect(schoolOf('https://other.com/demo/admin', SITE)).toBeNull();
  });
  it('knows a sign-in page (main or a school\'s own)', () => {
    for (const u of ['https://skooledtech.com/login', 'https://skooledtech.com/demo/login', 'https://skooledtech.com/demo/login/']) expect(onSignInPage(u, SITE)).toBe(true);
    for (const u of ['https://skooledtech.com/demo/admin', 'https://skooledtech.com/', 'https://skooledtech.com/demo/forgot-password', 'https://x.com/login']) expect(onSignInPage(u, SITE)).toBe(false);
  });
  it('Login and Sign up go to the school\'s own pages once the school is known', () => {
    expect(loginPathFor('demo')).toBe('/demo/login'); expect(loginPathFor(null)).toBe('/login');
    expect(accessPathFor('demo')).toBe('/demo/request-access'); expect(accessPathFor(null)).toBe('/login');
  });
});
