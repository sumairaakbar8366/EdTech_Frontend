/**
 * Saves what each role needs for the day while there is internet, so the app opens with no connection. Anything the
 * person opens later is saved too; this only covers the first screens (and today's class lists for teachers).
 */
type Get = (path: string) => Promise<unknown>;
interface MeLike { roles: { key: string }[] }

const COMMON = ['/auth/me', '/notifications?page=1', '/notifications/unread-count', '/announcements', '/complaints/meta', '/complaints/mine'];
const BY_ROLE: Record<string, string[]> = {
  teacher: ['/class-sessions/today', '/timetable/me', '/tasks/mine', '/leave/me', '/leave/types', '/staff-attendance/me', '/staff-attendance/biometric/status', '/lms/courses', '/lms/assignments', '/students/taught', '/exams', '/payroll/payslips/me', '/staff/me'],
  non_teaching_staff: ['/tasks/mine', '/leave/me', '/leave/types', '/staff-attendance/me', '/payroll/payslips/me', '/staff/me'],
  student: ['/students/me', '/timetable/me', '/lms/courses', '/lms/assignments', '/exams/report-cards/mine', '/fees/my-students', '/document-requests/mine'],
  parent: ['/students/my-children', '/timetable/children', '/fees/my-students', '/exams/report-cards/children', '/lms/children', '/document-requests/mine', '/messages/threads'],
  accounts: ['/fees/summary', '/fees/invoices?page=1&pageSize=20', '/fees/payments?page=1&pageSize=20', '/fees/structures', '/payroll/summary'],
  principal: ['/students/summary', '/staff/summary', '/fees/summary', '/complaints/summary', '/class-sessions/monitor', '/tasks', '/leave?status=pending', '/events'],
  school_admin: ['/students/summary', '/staff/summary', '/fees/summary', '/complaints/summary', '/class-sessions/monitor', '/tasks', '/leave?status=pending', '/events', '/document-requests?page=1&pageSize=20'],
};

export async function prefetchForOffline(get: Get, me: MeLike): Promise<{ saved: number; failed: number }> {
  const paths = new Set<string>(COMMON);
  for (const r of me.roles) for (const p of BY_ROLE[r.key] ?? []) paths.add(p);
  const results = await Promise.allSettled([...paths].map((p) => get(p)));
  let saved = results.filter((r) => r.status === 'fulfilled').length; let failed = results.length - saved;
  // Follow-ups that need an id from the first answers.
  const extra: Promise<unknown>[] = [];
  const at = (p: string) => { const i = [...paths].indexOf(p); const r = results[i]; return r?.status === 'fulfilled' ? (r.value as any) : null; };
  const today = at('/class-sessions/today');
  for (const s of (today?.slots ?? []) as { session?: { id: string } | null }[]) if (s.session) extra.push(get(`/attendance/sessions/${s.session.id}`));
  for (const k of ((at('/fees/my-students') ?? []) as { id: string }[]).slice(0, 6)) { extra.push(get(`/fees/students/${k.id}/statement`)); extra.push(get(`/attendance/students/${k.id}/summary`)); }
  const more = await Promise.allSettled(extra);
  saved += more.filter((r) => r.status === 'fulfilled').length; failed += more.filter((r) => r.status === 'rejected').length;
  return { saved, failed };
}
