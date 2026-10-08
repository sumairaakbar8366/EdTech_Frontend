import type { Tone } from '@/components/ui';
import type { ApplicationStatus, JobPost } from '@/features/hiring/types/hiring.types';

/** Pipeline columns, in order. */
export const STAGES: { id: ApplicationStatus; label: string; tone: Tone }[] = [
  { id: 'applied', label: 'Applied', tone: 'slate' },
  { id: 'shortlisted', label: 'Shortlisted', tone: 'sky' },
  { id: 'interview', label: 'Interview', tone: 'magenta' },
  { id: 'selected', label: 'Selected', tone: 'amber' },
  { id: 'hired', label: 'Hired', tone: 'emerald' },
];

/** Manual "move forward" step from a stage (others advance via interviews or hiring). */
export const NEXT_STAGE: Partial<Record<ApplicationStatus, ApplicationStatus>> = { applied: 'shortlisted', interview: 'selected' };
export const POST_TONE: Record<JobPost['status'], Tone> = { draft: 'slate', open: 'emerald', closed: 'rose' };
export const RECOMMENDATION_LABEL = { strong_yes: 'Strong yes', yes: 'Yes', no: 'No', strong_no: 'Strong no' } as const;
export const isActiveCandidate = (status: ApplicationStatus) => !['hired', 'rejected', 'withdrawn'].includes(status);
