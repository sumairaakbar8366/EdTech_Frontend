/**
 * What the website may ask the phone to do. The website calls `nativeCall(method, params)` (apps/web/src/lib/nativeBridge.ts);
 * the app answers here. Nothing leaves the phone except what each method returns: the attendance key's private half never does.
 */
export interface BridgeRequest { id: number; method: string; params?: Record<string, unknown> }
export interface BridgeReply { id: number; ok: boolean; data?: unknown; error?: string }

export interface BridgeDeps {
  support(): Promise<{ available: boolean; label: string; reason?: string }>;
  createKey(userId: string): Promise<string>;
  sign(userId: string, challenge: string): Promise<string>;
  forgetKey(userId: string): Promise<void>;
  hasKey(userId: string): Promise<boolean>;
  setQuickUnlock(on: boolean): Promise<boolean>;
  quickUnlock(): Promise<boolean>;
  openExternal(url: string): Promise<void>;
  info(): { version: string; platform: 'ios' | 'android' };
}

const str = (v: unknown, name: string, max = 500): string => {
  if (typeof v !== 'string' || v.length === 0 || v.length > max) throw new Error(`Bad ${name}`);
  return v;
};

/** A phone prompt that was cancelled or did not match, in words a person can act on. */
export const friendly = (e: unknown): string => {
  const m = e instanceof Error ? e.message : '';
  if (/cancel|user_cancel|authentication failed|not authenticated|canceled/i.test(m)) return 'The fingerprint or face check was cancelled or did not match. Please try again.';
  if (/key/i.test(m) && /attendance|missing|no /i.test(m)) return m;
  return m || 'The phone could not do that. Please try again.';
};

export async function handleBridge(req: BridgeRequest, deps: BridgeDeps): Promise<BridgeReply> {
  const p = req.params ?? {};
  try {
    switch (req.method) {
      case 'app.info': return { id: req.id, ok: true, data: deps.info() };
      case 'biometric.support': return { id: req.id, ok: true, data: await deps.support() };
      case 'biometric.hasKey': return { id: req.id, ok: true, data: { has: await deps.hasKey(str(p.userId, 'userId', 80)) } };
      case 'biometric.createKey': return { id: req.id, ok: true, data: { publicKey: await deps.createKey(str(p.userId, 'userId', 80)) } };
      case 'biometric.sign': return { id: req.id, ok: true, data: { signature: await deps.sign(str(p.userId, 'userId', 80), str(p.challenge, 'challenge', 200)) } };
      case 'biometric.forgetKey': await deps.forgetKey(str(p.userId, 'userId', 80)); return { id: req.id, ok: true, data: {} };
      case 'quickUnlock.get': return { id: req.id, ok: true, data: { on: await deps.quickUnlock() } };
      case 'quickUnlock.set': return { id: req.id, ok: true, data: { on: await deps.setQuickUnlock(p.on === true) } };
      case 'open.external': {
        const url = str(p.url, 'url', 2000);
        if (!/^(https?:|mailto:|tel:)/i.test(url)) throw new Error('Only web, mail and phone links can be opened.');
        await deps.openExternal(url); return { id: req.id, ok: true, data: {} };
      }
      default: return { id: req.id, ok: false, error: `Unknown request "${req.method}"` };
    }
  } catch (e) {
    return { id: req.id, ok: false, error: friendly(e) };
  }
}

/** The script that hands an answer back to the website. */
export const replyScript = (r: BridgeReply): string => `window.__skoolNativeReply && window.__skoolNativeReply(${JSON.stringify(r)}); true;`;

/** Runs before the website loads: tells it that it is inside the app. */
export const injectedBeforeLoad = (version: string, platform: string): string =>
  `window.__skoolApp = ${JSON.stringify({ version, platform })}; true;`;

/** Pages of the school's own website open inside the app; everything else (other sites, mail, phone) opens outside. */
export function opensInApp(url: string, siteUrl: string): boolean {
  if (/^(about:|data:|blob:)/i.test(url)) return true;
  try {
    const u = new URL(url); const s = new URL(siteUrl);
    // Google sign-in (the website's own "Continue with Google") also has to stay in the app.
    return u.origin === s.origin || /(^|\.)accounts\.google\.com$/.test(u.hostname);
  } catch { return false; }
}

/** Has the person signed in? The website keeps the session; the app only needs to know to skip the welcome page next time. */
export function looksSignedIn(url: string, siteUrl: string): boolean {
  try {
    const u = new URL(url); if (u.origin !== new URL(siteUrl).origin) return false;
    const [first, second] = u.pathname.split('/').filter(Boolean);
    const publicTop = ['login', 'register', 'signup', 'guide', 'tour', 'watch', 'pay', 'privacy', 'terms', 'forgot-password', 'reset-password', 'welcome'];
    if (!first || publicTop.includes(first)) return false;
    return !(second && ['login', 'forgot-password', 'reset-password', 'welcome'].includes(second));
  } catch { return false; }
}

/** The school a signed-in address belongs to ("/demo/attendance" is the school "demo"). The owner console is not a school. */
export function schoolOf(url: string, siteUrl: string): string | null {
  if (!looksSignedIn(url, siteUrl)) return null;
  const first = new URL(url).pathname.split('/').filter(Boolean)[0];
  return first && first !== 'console' ? first : null;
}

/** A sign-in page of the website: the main /login or a school's own /<school>/login. */
export function onSignInPage(url: string, siteUrl: string): boolean {
  try {
    const u = new URL(url); if (u.origin !== new URL(siteUrl).origin) return false;
    return /^\/([^/]+\/)?login\/?$/.test(u.pathname);
  } catch { return false; }
}

/** Where the Login card opens: a school's own sign-in page once the app knows the school, else the main sign-in. */
export const loginPathFor = (school: string | null): string => (school ? `/${school}/login` : '/login');
export const accessPathFor = (school: string | null): string => (school ? `/${school}/request-access` : '/login');
