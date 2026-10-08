import type { TodaySlot } from '@/features/timetable/services/timetableService';
import type { SlotState } from '@/features/timetable/types/timetable.types';

/** ISO weekday of today in the browser (1 = Monday … 7 = Sunday). */
export function isoWeekdayToday(): number {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

/** State of one of today's periods from its session and the school's current minute. */
export function slotState(slot: TodaySlot, nowMinute: number): SlotState {
  if (slot.session) return slot.session.status;
  return nowMinute >= slot.endMinute ? 'missed' : 'scheduled';
}

/** Deterministic colour per subject so a subject looks the same across the week. */
const SUBJECT_COLORS = ['bg-primary-800', 'bg-primary-600', 'bg-slate-600', 'bg-primary-700', 'bg-primary-500', 'bg-slate-700', 'bg-primary-900', 'bg-slate-500', 'bg-primary-400'];
export const subjectColor = (subjectId: string) => SUBJECT_COLORS[[...subjectId].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7) % SUBJECT_COLORS.length];
/** Thin left-edge colour per subject for timetable cells: greyish blues and one orange, never loud. */
const SUBJECT_ACCENTS = ['border-slate-500', 'border-orange-400', 'border-sky-700', 'border-slate-400', 'border-amber-500', 'border-slate-700', 'border-cyan-700', 'border-stone-400'];
export const subjectAccent = (subjectId: string) => SUBJECT_ACCENTS[[...subjectId].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7) % SUBJECT_ACCENTS.length];
