import type { Tone } from '@/components/ui';
import type { SlotState } from '@/features/timetable/types/timetable.types';

export const SLOT_STATE_TONE: Record<SlotState, Tone> = { scheduled: 'slate', live: 'emerald', completed: 'primary', missed: 'rose', cancelled: 'slate' };
export const SLOT_STATE_LABEL: Record<SlotState, string> = { scheduled: 'Upcoming', live: 'Live', completed: 'Completed', missed: 'Missed', cancelled: 'Cancelled' };

/** A teacher may start a class at most this many minutes late before it shows as late. */
export const LATE_START_GRACE_MINUTES = 5;
