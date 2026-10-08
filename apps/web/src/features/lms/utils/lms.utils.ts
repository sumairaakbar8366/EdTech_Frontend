import type { Tone } from '@/components/ui';
import type { AssignmentSummary, SubmissionSummary } from '@/features/lms/types/lms.types';

/** Status of a student's work on an assignment. */
export function workState(a: Pick<AssignmentSummary, 'dueAt' | 'allowLate'>, s: SubmissionSummary | null | undefined): [string, Tone] {
  if (s?.status === 'graded') return ['Graded', 'emerald'];
  if (s) return [s.isLate ? 'Submitted late' : 'Submitted', 'sky'];
  if (new Date(a.dueAt) < new Date()) return [a.allowLate ? 'Overdue' : 'Missed', 'rose'];
  return ['To do', 'amber'];
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const fileSize = (bytes: number | null) =>
  bytes === null ? '' : bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** YouTube / Vimeo links play inline; other links open in a new tab. */
export function embedUrl(url: string): string | null {
  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/.exec(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = /vimeo\.com\/(\d+)/.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** "?studentId=…" when a parent is looking at one child, else "". */
export const studentQuery = (studentId?: string) => (studentId ? `?studentId=${studentId}` : '');
