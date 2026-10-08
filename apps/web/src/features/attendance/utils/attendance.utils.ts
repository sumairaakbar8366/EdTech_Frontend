import { GOOD_ATTENDANCE, WARNING_ATTENDANCE } from '@/features/attendance/constants';
import type { Mark } from '@/features/attendance/types/attendance.types';
import type { Tone } from '@/components/ui';

/** "08:05" from an ISO timestamp, or a dash. */
export const clockTime = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');

/** "350 m" / "1.2 km". */
export const distanceLabel = (meters: number) => (meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`);

/** Browser GPS as a promise; resolves null if denied or unavailable (the check-in is then "unknown"). */
export function currentPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 });
  });
}

/** Device fingerprint sent with a check-in (helps admins spot shared phones). */
export const deviceId = () => navigator.userAgent.slice(0, 120);

/** Number of students per mark. */
export function countMarks(marks: Record<string, Mark>): Partial<Record<Mark, number>> {
  return Object.values(marks).reduce<Partial<Record<Mark, number>>>((m, v) => ({ ...m, [v]: (m[v] ?? 0) + 1 }), {});
}

/** Colour of an attendance percentage. */
export function attendanceTone(percentage: number | null): Tone {
  if (percentage === null || percentage >= GOOD_ATTENDANCE) return 'emerald';
  return percentage >= WARNING_ATTENDANCE ? 'amber' : 'rose';
}
