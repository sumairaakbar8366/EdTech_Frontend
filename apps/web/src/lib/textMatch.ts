/** True when every word typed appears (case-insensitive) somewhere in the given values. */
export function matchesText(text: string, ...values: (string | number | null | undefined)[]): boolean {
  const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = values.filter((v) => v !== null && v !== undefined).join(' ').toLowerCase();
  return words.every((w) => hay.includes(w));
}
