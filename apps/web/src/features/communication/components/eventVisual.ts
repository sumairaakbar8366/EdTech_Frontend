import { AlarmClock, Award, Banknote, Bell, CalendarCheck, CalendarX, CircleAlert, ClipboardList, FileText, ImageUp, Megaphone, MessagesSquare, NotebookPen, Receipt, TimerOff, Wallet, type LucideIcon } from 'lucide-react';

/** Icon and tile colour per notification event type. */
export const EVENT_VISUAL: Record<string, [LucideIcon, string]> = {
  fee_paid: [Receipt, 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'],
  fee_overdue: [Wallet, 'bg-rose-500/15 text-rose-600 dark:text-rose-300'],
  result_published: [Award, 'bg-violet-500/15 text-violet-600 dark:text-violet-300'],
  result_updated: [Award, 'bg-violet-500/15 text-violet-600 dark:text-violet-300'],
  assignment_posted: [NotebookPen, 'bg-primary-500/15 text-primary-600 dark:text-primary-300'],
  payroll_paid: [Banknote, 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'],
  payroll_approval: [Banknote, 'bg-amber-500/15 text-amber-600 dark:text-amber-300'],
  student_absent: [CalendarX, 'bg-rose-500/15 text-rose-600 dark:text-rose-300'],
  announcement: [Megaphone, 'bg-primary-500/15 text-primary-600 dark:text-primary-300'],
  message: [MessagesSquare, 'bg-magenta-500/15 text-magenta-600 dark:text-magenta-300'],
  leave_requested: [CalendarCheck, 'bg-amber-500/15 text-amber-600 dark:text-amber-300'],
  document_request: [FileText, 'bg-primary-500/15 text-primary-600 dark:text-primary-300'],
  task_assigned: [ClipboardList, 'bg-primary-500/15 text-primary-600 dark:text-primary-300'],
  photo_request: [ImageUp, 'bg-amber-500/15 text-amber-600 dark:text-amber-300'],
  class_soon: [AlarmClock, 'bg-sky-500/15 text-sky-600 dark:text-sky-300'],
  class_late: [CircleAlert, 'bg-amber-500/15 text-amber-600 dark:text-amber-300'],
  class_missed: [TimerOff, 'bg-rose-500/15 text-rose-600 dark:text-rose-300'],
  default: [Bell, 'bg-slate-500/15 text-slate-600 dark:text-slate-300'],
};

/** Notifications that need action now: they stay on screen until closed, with a sound. */
export const URGENT_EVENTS: Record<string, 'red' | 'amber' | 'blue'> = {
  class_missed: 'red',
  class_late: 'amber',
  class_soon: 'blue',
  student_absent: 'red',
  fee_overdue: 'amber',
};
