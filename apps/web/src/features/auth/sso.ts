import { isMainDomain, marketingOrigin } from '@/config/site';
import type { SocialProvider } from '@/features/marketing/services/marketingService';

// "Continue with Google" as a full-page redirect (OpenID Connect, implicit id_token). Google only
// accepts registered addresses, and every school has its own, so the round trip always runs on the
// main site: /sso/start → Google → /sso/callback, which then signs the person up
// or hands them to their school with a one-time ticket.

export type SsoPurpose = 'signup' | 'login';

export interface SsoRequest {
  provider: SocialProvider;
  purpose: SsoPurpose;
  /** For a sign-in on a school's own page: that school (else every school is searched). */
  school?: string;
}

interface Pending extends SsoRequest {
  state: string;
  nonce: string;
  at: number;
}

const KEY = 'schoolerp.sso';
const MAX_AGE_MS = 10 * 60 * 1000;
const AUTHORIZE: Record<SocialProvider, string> = { google: 'https://accounts.google.com/o/oauth2/v2/auth' };
export const PROVIDER_LABEL: Record<SocialProvider, string> = { google: 'Google' };

const random = (bytes: number) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, '0')).join('');
export const ssoCallbackUrl = () => `${marketingOrigin()}/sso/callback`;

/** Starts the round trip on the main site (from a school's own domain it first moves there). */
export function startSso(req: SsoRequest) {
  const params = new URLSearchParams({ provider: req.provider, purpose: req.purpose, ...(req.school && { school: req.school }) });
  window.location.assign(`${isMainDomain() ? '' : marketingOrigin()}/sso/start?${params}`);
}

/** On the main site: remembers the request (this tab only) and goes to Google. */
export function redirectToProvider(req: SsoRequest, clientId: string) {
  const pending: Pending = { ...req, state: random(16), nonce: random(16), at: Date.now() };
  sessionStorage.setItem(KEY, JSON.stringify(pending));
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: ssoCallbackUrl(),
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: pending.nonce,
    state: pending.state,
    prompt: 'select_account',
  });
  window.location.assign(`${AUTHORIZE[req.provider]}?${params}`);
}

export type SsoResult = { ok: true; request: SsoRequest; credential: string; nonce: string; profile: { email?: string; name?: string } } | { ok: false; message: string; request: SsoRequest | null };

/** On /sso/callback: reads Google's answer and checks it belongs to the request this tab made. */
export function readSsoCallback(): SsoResult {
  const answer = new URLSearchParams(window.location.hash.slice(1) || window.location.search.slice(1));
  let pending: Pending | null = null;
  try {
    pending = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Pending | null;
    sessionStorage.removeItem(KEY);
  } catch {
    pending = null;
  }
  // The token must not stay in the address bar or history.
  window.history.replaceState(null, '', window.location.pathname);
  const request = pending ? { provider: pending.provider, purpose: pending.purpose, school: pending.school } : null;
  if (answer.get('error')) {
    const cancelled = /access_denied|user_cancel/i.test(`${answer.get('error')} ${answer.get('error_description') ?? ''}`);
    return { ok: false, request, message: cancelled ? 'Sign-in was cancelled.' : 'The sign-in was not completed. Please try again.' };
  }
  const credential = answer.get('id_token');
  if (!pending || !credential || answer.get('state') !== pending.state || Date.now() - pending.at > MAX_AGE_MS) {
    return { ok: false, request, message: 'This sign-in has expired or did not start here. Please try again.' };
  }
  return { ok: true, request: request!, credential, nonce: pending.nonce, profile: readProfile(credential) };
}

/** The name and email inside the ID token, for display only (the server verifies the token). */
function readProfile(idToken: string): { email?: string; name?: string } {
  try {
    const claims = JSON.parse(atob(idToken.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
    const email = claims.email as string | undefined;
    return { email, name: claims.name as string | undefined };
  } catch {
    return {};
  }
}
