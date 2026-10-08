import { Award, Banknote, Bell, CalendarX, Megaphone, MessagesSquare, NotebookPen, Receipt, type LucideIcon } from 'lucide-react';

/** Icon and tile colour per notification event type. */
export const EVENT_VISUAL: Record<string, [LucideIcon, string]> = {
  fee_paid: [Receipt, 'bg-amber-500/15 text-amber-600 dark:text-amber-300'],
  result_published: [Award, 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'],
  assignment_posted: [NotebookPen, 'bg-primary-500/15 text-primary-600 dark:text-primary-300'],
  payroll_paid: [Banknote, 'bg-primary-500/15 text-primary-600 dark:text-primary-300'],
  student_absent: [CalendarX, 'bg-rose-500/15 text-rose-600 dark:text-rose-300'],
  announcement: [Megaphone, 'bg-primary-500/15 text-primary-600 dark:text-primary-300'],
  message: [MessagesSquare, 'bg-magenta-500/15 text-magenta-600 dark:text-magenta-300'],
  default: [Bell, 'bg-slate-500/15 text-slate-600 dark:text-slate-300'],
};
