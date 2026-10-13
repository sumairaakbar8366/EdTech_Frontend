/** "2026-04-01T00:00:00.000Z" -> "2026-04-01" */
export const dateOnly = (iso: string) => iso.slice(0, 10);

/** "2026-04-01T00:00:00.000Z" -> "1 Apr 2026" (dates are calendar dates, shown in UTC). */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

/** 999 -> "999", 1250 -> "1.3k", 25000 -> "25k", 1_500_000 -> "1.5M", 2e9 -> "2B". */
export function compactNumber(n: number): string {
  const abs = Math.abs(n);
  const units: [number, string][] = [[1e9, 'B'], [1e6, 'M'], [1e3, 'k']];
  for (const [size, suffix] of units) {
    if (abs >= size) {
      const scaled = n / size;
      const text = (Math.abs(scaled) >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10).toString();
      // 999,950 rounds to "1000k": show it as the next unit instead.
      if (suffix !== 'B' && Math.abs(Number(text)) >= 1000) return compactNumber(Math.sign(n) * size * 1000);
      return `${text}${suffix}`;
    }
  }
  return Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/** The exact figure for tooltips: 1234567.5 -> "1,234,567.50" (money) or 1234567 -> "1,234,567". */
export const exactNumber = (n: number) =>
  Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
