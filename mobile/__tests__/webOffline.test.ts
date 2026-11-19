/** The website's offline layer (apps/web/src/lib/offline + services/api/http.ts), run against a fake network. */
import { ApiError, api, reconnect, refreshSession, setAccessToken, setApiBase, queuedChanges } from '../../apps/web/src/services/api/http';
import { configureOffline, getOfflineState, markOffline, OfflineError, rememberUser, refreshCounts } from '../../apps/web/src/lib/offline/layer';
import { memoryKV, type KV } from '../../apps/web/src/lib/offline/kv';
import { cacheable } from '../../apps/web/src/lib/offline/cache';
import { queueRule } from '../../apps/web/src/lib/offline/queue';
import { prefetchForOffline } from '../../apps/web/src/lib/offline/prefetch';

const ID = '01a11005-a57f-7227-8b90-43242655a71b';
let kv: KV; let online = true; let calls: { method: string; path: string; body?: string }[] = []; let handler: (m: string, p: string, body?: string) => { status: number; body?: unknown } | undefined;

beforeEach(async () => {
  kv = memoryKV(); configureOffline({ kv }); setApiBase('/api'); setAccessToken(null); markOffline(false); await refreshCounts('/api');
  online = true; calls = []; handler = () => undefined;
  (global as any).fetch = jest.fn(async (url: string, init: any = {}) => {
    if (!online) throw new TypeError('Failed to fetch');
    const path = String(url).replace('/api', ''); const m = (init.method ?? 'GET') as string;
    calls.push({ method: m, path, body: init.body });
    const r = handler(m, path, init.body) ?? (path === '/auth/refresh' ? { status: 200, body: { accessToken: 'T' } } : { status: 200, body: { ok: true, path } });
    return { ok: r.status < 400, status: r.status, statusText: 'x', text: async () => (r.body === undefined ? '' : JSON.stringify(r.body)), json: async () => r.body };
  });
});

const flushMicrotasks = () => new Promise((r) => setTimeout(r, 5));

describe('saved copies', () => {
  it('an answer is kept, and shown from the saved copy when the connection fails', async () => {
    handler = (_m, p) => (p === '/students/summary' ? { status: 200, body: { total: 320 } } : undefined);
    expect(await api('/students/summary')).toEqual({ total: 320 });
    await flushMicrotasks();
    online = false;
    expect(await api('/students/summary')).toEqual({ total: 320 });
    expect(getOfflineState().offline).toBe(true);
  });
  it('a page never opened before says so (it does not crash)', async () => {
    online = false;
    await expect(api('/fees/summary')).rejects.toBeInstanceOf(OfflineError);
  });
  it('a refusal or error from the school is NOT replaced by an old copy', async () => {
    handler = (_m, p) => (p === '/fees/summary' ? { status: 200, body: { old: true } } : undefined);
    await api('/fees/summary'); await flushMicrotasks();
    handler = () => ({ status: 500, body: { message: 'boom' } });
    await expect(api('/fees/summary')).rejects.toBeInstanceOf(ApiError);
    handler = () => ({ status: 403, body: { message: 'no' } });
    await expect(api('/fees/summary')).rejects.toMatchObject({ status: 403 });
    expect(getOfflineState().offline).toBe(false);
  });
  it('sign-in answers are never saved, the profile is', () => {
    expect(cacheable('/auth/login')).toBe(false); expect(cacheable('/auth/refresh')).toBe(false); expect(cacheable('/public/login')).toBe(false);
    expect(cacheable('/auth/me')).toBe(true); expect(cacheable('/students/summary')).toBe(true);
  });
  it('staying signed in offline needs a saved profile; without one the person must sign in', async () => {
    online = false;
    expect(await refreshSession()).toBe(false);
    online = true; handler = (_m, p) => (p === '/auth/me' ? { status: 200, body: { user: { id: 'u1' } } } : undefined);
    await api('/auth/me'); await flushMicrotasks();
    online = false;
    expect(await refreshSession()).toBe(true);
    expect(getOfflineState().offline).toBe(true);
  });
  it('a refused refresh (expired login) is a real sign-out, even with a saved profile', async () => {
    handler = (_m, p) => (p === '/auth/me' ? { status: 200, body: { user: { id: 'u1' } } } : undefined);
    await api('/auth/me'); await flushMicrotasks();
    handler = (_m, p) => (p === '/auth/refresh' ? { status: 401, body: { message: 'Session expired' } } : undefined);
    expect(await refreshSession()).toBe(false);
  });
});

describe('changes made offline', () => {
  const mark = (status: string) => api(`/attendance/sessions/${ID}`, { method: 'POST', body: { records: [{ studentId: 's1', status }] } });
  it('attendance marked offline is kept (one per class, newest wins) and sent when the connection returns', async () => {
    online = false;
    expect(await mark('present')).toMatchObject({ queued: true });
    await mark('absent');
    expect(getOfflineState().pending).toBe(1);
    expect(JSON.parse(((await queuedChanges())[0]!.body ? JSON.stringify((await queuedChanges())[0]!.body) : '{}'))).toEqual({ records: [{ studentId: 's1', status: 'absent' }] });
    online = true; calls = [];
    expect(await reconnect()).toBe('ok');
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual(['POST /auth/refresh', `POST /attendance/sessions/${ID}`]);
    expect(getOfflineState()).toMatchObject({ pending: 0, failed: 0, offline: false });
  });
  it('money, check-ins and approvals are never kept: they need the internet', async () => {
    online = false;
    for (const [m, p] of [['POST', '/fees/payments'], ['POST', '/staff-attendance/check-in'], ['POST', `/leave/${ID}/decision`], ['POST', '/fees/invoices/generate'], ['DELETE', `/students/${ID}`]] as const) {
      await expect(api(p, { method: m, body: {} })).rejects.toBeInstanceOf(OfflineError);
    }
    expect(getOfflineState().pending).toBe(0);
  });
  it('a change the school refuses is parked for review and does not block the others', async () => {
    online = false;
    await api(`/tasks/${ID}/status`, { method: 'PATCH', body: { status: 'done' } });
    await mark('present');
    online = true;
    handler = (m, p) => (p === `/tasks/${ID}/status` ? { status: 400, body: { message: 'Task already done' } } : p === '/auth/refresh' ? { status: 200, body: { accessToken: 'T' } } : undefined);
    expect(await reconnect()).toBe('ok');
    expect(getOfflineState()).toMatchObject({ pending: 0, failed: 1 });
    expect((await queuedChanges())[0]).toMatchObject({ status: 'failed', error: 'Task already done' });
  });
  it('a school server error keeps the change for the next try', async () => {
    online = false; await mark('present'); online = true;
    handler = (_m, p) => (p.startsWith('/attendance') ? { status: 503, body: { message: 'down' } } : undefined);
    await reconnect();
    expect(getOfflineState()).toMatchObject({ pending: 1, failed: 0 });
  });
  it('connection lost half way keeps the rest', async () => {
    online = false; await mark('present'); online = true;
    (global as any).fetch = jest.fn(async (url: string) => { if (String(url).endsWith('/auth/refresh')) return { ok: true, status: 200, text: async () => '{"accessToken":"T"}' }; throw new TypeError('Failed to fetch'); });
    await reconnect();
    expect(getOfflineState().pending).toBe(1);
  });
  it('the rules: what may wait', () => {
    expect(queueRule('POST', `/attendance/sessions/${ID}`)?.label).toBe('Class attendance');
    expect(queueRule('POST', '/complaints')?.label).toBe('Complaint');
    expect(queueRule('POST', '/fees/payments')).toBeNull();
    expect(queueRule('POST', '/staff-attendance/check-in')).toBeNull();
  });
});

describe('another person on the same phone', () => {
  it('their saved copies are dropped when someone else signs in', async () => {
    handler = (_m, p) => (p === '/students/summary' ? { status: 200, body: { total: 1 } } : undefined);
    await rememberUser('/api', 'u1'); await api('/students/summary'); await flushMicrotasks();
    await rememberUser('/api', 'u2');
    online = false;
    await expect(api('/students/summary')).rejects.toBeInstanceOf(OfflineError);
  });
});

describe('saving the day\'s screens while online', () => {
  it('a teacher gets the timetable, tasks, leave and today\'s class lists', async () => {
    const got: string[] = [];
    const get = async (p: string) => { got.push(p); if (p === '/class-sessions/today') return { slots: [{ session: { id: 'ses1' } }, { session: null }] }; return {}; };
    const r = await prefetchForOffline(get, { roles: [{ key: 'teacher' }] });
    expect(got).toEqual(expect.arrayContaining(['/auth/me', '/timetable/me', '/tasks/mine', '/leave/me', '/class-sessions/today', '/attendance/sessions/ses1']));
    expect(r.failed).toBe(0);
  });
  it('a parent gets each child\'s fee statement; one failing page does not stop the rest', async () => {
    const got: string[] = [];
    const get = async (p: string) => { got.push(p); if (p === '/timetable/children') throw new Error('x'); if (p === '/fees/my-students') return [{ id: 'k1' }]; return {}; };
    const r = await prefetchForOffline(get, { roles: [{ key: 'parent' }] });
    expect(got).toContain('/fees/students/k1/statement'); expect(r.failed).toBe(1);
  });
});
