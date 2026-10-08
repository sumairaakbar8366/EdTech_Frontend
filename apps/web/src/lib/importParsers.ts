// Lenient value parsers for spreadsheet imports: real school data arrives in many spellings.

/** Accepts 2026-04-01, 01/04/2026, 1-4-2026, 01.04.2026 (day first, as used in Pakistan) and Excel serials. */
export function parseDate(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return valid(+m[1]!, +m[2]!, +m[3]!);
  m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) return valid(+m[3]!, +m[2]!, +m[1]!);
  m = v.match(/^(\d{1,2})[ -]([A-Za-z]{3,9})[ -](\d{4})$/);
  if (m) {
    const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(m[2]!.slice(0, 3).toLowerCase()) + 1;
    if (month) return valid(+m[3]!, month, +m[1]!);
  }
  if (/^\d{5}$/.test(v)) {
    // Excel serial day number (1900 date system).
    const d = new Date(Date.UTC(1899, 11, 30) + Number(v) * 86_400_000);
    return d.toISOString().slice(0, 10);
  }
  return null;
}

function valid(y: number, mo: number, d: number): string | null {
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

/** Matches a value against allowed options by key or label, ignoring case/spaces/punctuation. */
export function parseChoice<K extends string>(value: string, options: Record<K, string[]>): K | null {
  const v = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!v) return null;
  for (const [key, names] of Object.entries(options) as [K, string[]][]) {
    if ([key, ...names].some((n) => n.toLowerCase().replace(/[^a-z0-9]/g, '') === v)) return key;
  }
  return null;
}

export const GENDER_OPTIONS = { male: ['m', 'boy'], female: ['f', 'girl'], other: ['o'] } as const satisfies Record<string, string[]>;
export const RELATION_OPTIONS = {
  father: ['dad', 'abbu'],
  mother: ['mom', 'mum', 'ammi'],
  guardian: ['legal guardian'],
  grandparent: ['grandfather', 'grandmother', 'dada', 'dadi', 'nana', 'nani'],
  sibling: ['brother', 'sister'],
  other: [],
} as const satisfies Record<string, string[]>;

export function parseNumber(value: string): number | null {
  const v = value.replace(/[, ]/g, '').replace(/^(rs\.?|pkr)/i, '');
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Yes / No style values; empty means `fallback`. */
export function parseYesNo(value: string, fallback: boolean): boolean | null {
  const v = value.trim().toLowerCase();
  if (!v) return fallback;
  if (['yes', 'y', 'true', '1', 'active'].includes(v)) return true;
  if (['no', 'n', 'false', '0', 'inactive'].includes(v)) return false;
  return null;
}

export const digits = (s: string) => s.replace(/\D/g, '');
export const blankToNull = (s: string) => (s.trim() ? s.trim() : null);
