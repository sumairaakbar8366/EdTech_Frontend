import type { Tone } from '@/components/ui';
import type { GeoStatus, Mark, ReviewStatus } from '@/features/attendance/types/attendance.types';

export const GEO_TONE: Record<GeoStatus, Tone> = { valid: 'emerald', flagged: 'rose', unknown: 'slate' };
export const GEO_LABEL: Record<GeoStatus, string> = { valid: 'Inside campus', flagged: 'Outside campus', unknown: 'No GPS' };
export const REVIEW_TONE: Record<ReviewStatus, Tone> = { pending: 'amber', approved: 'emerald', rejected: 'rose' };

/**
 * Student attendance marks, in display order. To add a status: add it here, to the Mark type
 * and to the server's attendance_status enum.
 */
export const MARKS: readonly Mark[] = ['present', 'late', 'absent', 'excused'];
export const MARK_TONE: Record<Mark, Tone> = { present: 'emerald', late: 'amber', absent: 'rose', excused: 'sky' };
export const MARK_STYLE: Record<Mark, string> = {
  present: 'bg-emerald-600 text-white',
  absent: 'bg-rose-600 text-white',
  late: 'bg-amber-500 text-white',
  excused: 'bg-primary-600 text-white',
};
/** The mark every student starts with on a new roster. */
export const DEFAULT_MARK: Mark = 'present';

/** Attendance percentage thresholds for the student summary colour. */
export const GOOD_ATTENDANCE = 85;
export const WARNING_ATTENDANCE = 75;
