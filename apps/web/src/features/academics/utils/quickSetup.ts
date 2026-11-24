/** Pure helpers for the Quick setup wizard: turn "how many?" answers into names. */

/** Splits "A, B\nC" into trimmed, non-empty, de-duplicated (case-insensitive) items. */
export function parseList(text: string): string[] {
  const seen = new Set<string>();
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
}

export const PRE_CLASSES = ['Play Group', 'Nursery', 'Prep', 'KG'];

export const COMMON_SUBJECTS = [
  'English', 'Urdu', 'Mathematics', 'Science', 'Islamiat', 'Social Studies', 'Computer', 'General Knowledge',
  'Drawing', 'Nazra Quran', 'Physics', 'Chemistry', 'Biology', 'Pakistan Studies', 'Sindhi', 'Arabic',
];

export const SPECIAL_ROOMS = ['Science Lab', 'Computer Lab', 'Library', 'Staff Room', 'Hall'];

export interface ClassPlanInput {
  /** "Grade" → Grade 1, Grade 2… */
  prefix: string;
  /** First number, usually 1. */
  from: number;
  /** How many numbered classes. */
  count: number;
  /** Classes before the numbered ones (Nursery, Prep…). */
  pre: string[];
  /** Level (sort order) of the first class: after any classes the school already has. */
  firstLevel: number;
}

/** The classes to create, with their sort levels (1–100). */
export function classPlan({ prefix, from, count, pre, firstLevel }: ClassPlanInput): { name: string; level: number }[] {
  const names = [...pre, ...Array.from({ length: Math.max(0, count) }, (_, i) => `${prefix.trim()} ${from + i}`.trim())];
  return names.slice(0, 60).map((name, i) => ({ name, level: Math.min(100, firstLevel + i) }));
}

export type SectionStyle = 'letters' | 'numbers' | 'custom';

/** A, B, C… / 1, 2, 3… / the typed list. */
export function sectionNamesFor(style: SectionStyle, count: number, custom: string): string[] {
  if (style === 'custom') return parseList(custom).slice(0, 26);
  const n = Math.max(0, Math.min(26, count));
  return Array.from({ length: n }, (_, i) => (style === 'letters' ? String.fromCharCode(65 + i) : String(i + 1)));
}

/** Room 1…Room N, then the special rooms. */
export function roomNamesFor(prefix: string, from: number, count: number, specials: string[]): string[] {
  const numbered = Array.from({ length: Math.max(0, Math.min(300, count)) }, (_, i) => `${prefix.trim()} ${from + i}`.trim());
  return [...numbered, ...specials].slice(0, 300);
}
