// HTTP client for the SchoolERP API.
// The access token lives only in memory; the refresh token is an httpOnly cookie the
// browser sends to <API base>/auth. A 401 triggers one silent refresh and a retry.

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
  }
}

let accessToken: string | null = null;

/**
 * Where this app's API lives: "/api/s/<slug>" for a school and "/api/console" for the platform
 * console on the main domain, "/api" on the public site and on a school's own domain. Set once at
 * start-up (app/App.tsx), before any request.
 */
let apiBase = '/api';
export function setApiBase(base: string): void {
  apiBase = base;
}
/** An API path as a URL for links and images, e.g. apiUrl('/public/media/1') → /api/s/demo/public/media/1. */
export const apiUrl = (path: string) => `${apiBase}${path}`;
/** A stored API link ("/api/tenant/logo/…") rewritten for this app's API base. */
export const apiAsset = (url: string | null | undefined) => (url && url.startsWith('/api/') ? apiUrl(url.slice(4)) : url ?? undefined);
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Calls that change the session cookie run one at a time, in this tab and across tabs. The refresh
 * token rotates and a reused one ends the session, so a refresh racing a sign-in (the /welcome
 * ticket) or another tab's refresh would sign the person out ("Session expired").
 */
let sessionQueue: Promise<unknown> = Promise.resolve();
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) return navigator.locks.request(`schoolerp-session:${apiBase}`, fn);
  const run = sessionQueue.then(fn, fn);
  sessionQueue = run.catch(() => undefined);
  return run;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

interface TokenResponse {
  accessToken: string;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');
  if (init.body !== undefined) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  return fetch(`${apiBase}${path}`, { ...init, headers, credentials: 'same-origin' });
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const body: unknown = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const message = errorMessage(body) ?? res.statusText ?? 'Request failed';
    throw new ApiError(res.status, message, body);
  }
  return body as T;
}

function errorMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
  }
  return undefined;
}

/** Exchanges the refresh cookie for a new access token. Concurrent callers share one request. */
export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= exclusive(async () => {
    try {
      const res = await send('/auth/refresh', { method: 'POST' });
      if (!res.ok) {
        setAccessToken(null);
        return false;
      }
      setAccessToken((await parse<TokenResponse>(res)).accessToken);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      refreshInFlight = null;
    }
  });
  return refreshInFlight;
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const init: RequestInit = {
    method: options.method ?? 'GET',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  };
  let res = await send(path, init);
  if (res.status === 401 && accessToken && !path.startsWith('/auth/')) {
    if (await refreshSession()) res = await send(path, init);
  }
  return parse<T>(res);
}

/** Authenticated multipart upload (lets the browser set the multipart boundary). */
export async function upload<T>(path: string, form: FormData): Promise<T> {
  const doSend = () => {
    const headers = new Headers({ Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' });
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return fetch(`${apiBase}${path}`, { method: 'POST', body: form, headers, credentials: 'same-origin' });
  };
  let res = await doSend();
  if (res.status === 401 && accessToken && (await refreshSession())) res = await doSend();
  return parse<T>(res);
}

/** Authenticated fetch of a file as an object URL (for previews). Revoke it when done. */
export async function blobUrl(path: string): Promise<string> {
  const doSend = () => {
    const headers = new Headers({ 'X-Requested-With': 'XMLHttpRequest' });
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return fetch(`${apiBase}${path}`, { headers, credentials: 'same-origin' });
  };
  let res = await doSend();
  if (res.status === 401 && accessToken && (await refreshSession())) res = await doSend();
  if (!res.ok) await parse(res);
  return URL.createObjectURL(await res.blob());
}

/** Authenticated download: fetches the file and hands it to the browser as a download. */
export async function download(path: string, fileName: string): Promise<void> {
  const url = await blobUrl(path);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** `identifier`: the User ID on a school's site, the email on the platform console. */
export async function login(identifier: string, password: string, remember = false): Promise<void> {
  await exclusive(async () => {
    const tokens = await api<TokenResponse>('/auth/login', { method: 'POST', body: { identifier, password, remember } });
    setAccessToken(tokens.accessToken);
  });
}

/** Exchanges a one-time ticket (sign-up or support hand-over) for a session on this host. */
export async function exchangeTicket(ticket: string): Promise<void> {
  await exclusive(async () => {
    const tokens = await api<TokenResponse>('/auth/ticket', { method: 'POST', body: { ticket } });
    setAccessToken(tokens.accessToken);
  });
}

export async function logout(): Promise<void> {
  await exclusive(async () => {
    try {
      await api<void>('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  });
}

/** Replaces the signed-in user's password; the session continues with a fresh access token. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await exclusive(async () => {
    const tokens = await api<TokenResponse>('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
    setAccessToken(tokens.accessToken);
  });
}
