/** "2026-04-01T00:00:00.000Z" -> "2026-04-01" */
export const dateOnly = (iso: string) => iso.slice(0, 10);

/** "2026-04-01T00:00:00.000Z" -> "1 Apr 2026" (dates are calendar dates, shown in UTC). */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
