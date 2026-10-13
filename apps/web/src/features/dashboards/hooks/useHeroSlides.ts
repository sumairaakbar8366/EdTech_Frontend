import { Banknote, CalendarClock, CalendarOff, ClipboardList, FileText, NotebookPen, Presentation, Receipt, UserCheck, Wallet } from 'lucide-react';
import { useRequestSummary } from '@/features/document-requests/requests';
import type { HeroSlide } from '@/components/motion/HeroSlides';
import { useAdmissionSummary } from '@/features/admissions/hooks/useAdmissions';
import { useMyAttendance } from '@/features/attendance/hooks/useAttendance';
import { useCan } from '@/features/auth/usePermissions';
import { useFeesSummary, useMyFeeStudents, useStatement } from '@/features/fees/hooks/useFees';
import { money } from '@/features/fees/utils/fee.utils';
import { useLeaveRequests, useMyLeave } from '@/features/leave/leave';
import { useMyAssignments } from '@/features/lms/hooks/useLms';
import { usePayrollSummary } from '@/features/payroll/hooks/usePayroll';
import { useMyTimetable, useTodaysClasses } from '@/features/timetable/hooks/useTimetable';
import { isoWeekdayToday } from '@/features/timetable/utils/timetable.utils';
import { compactNumber } from '@/lib/format';

const plural = (n: number, one: string, many = `${one}s`) => `${compactNumber(n)} ${n === 1 ? one : many}`;
const nowMinute = () => new Date().getHours() * 60 + new Date().getMinutes();
const keep = (slides: (HeroSlide | false | null | undefined)[]) => slides.filter(Boolean) as HeroSlide[];

/** Admin hero slides: what needs a decision today. */
export function useAdminHeroSlides(): HeroSlide[] {
  const can = useCan();
  const admissions = useAdmissionSummary().data;
  const leave = useLeaveRequests('pending').data;
  const fees = useFeesSummary().data;
  const payroll = usePayrollSummary().data;
  const requests = useRequestSummary(can('settings.manage')).data;
  const openRequests = (requests?.submitted ?? 0) + (requests?.in_review ?? 0);
  const toReview = admissions ? (admissions.submitted ?? 0) + (admissions.documents_verified ?? 0) + (admissions.under_review ?? 0) : 0;
  return keep([
    can('admissions.view') && toReview > 0 && { key: 'admissions', kicker: 'Admissions', icon: ClipboardList, title: `${plural(toReview, 'application')} to review`, text: 'New families are waiting for a decision.', cta: { label: 'Open admissions', to: '/admissions' } },
    can('leave.approve') && !!leave?.length && { key: 'leave', kicker: 'Leave', icon: CalendarOff, title: `${plural(leave.length, 'leave request')} waiting`, text: 'Approve or decline so staffing for the week is settled.', cta: { label: 'Review leave', to: '/attendance' } },
    can('fees.view') && !!fees && { key: 'fees', kicker: 'Fees', icon: Wallet, title: `${money(fees.collectedThisMonth, fees.currency)} collected this month`, text: fees.overdueInvoices ? `${plural(fees.overdueInvoices, 'invoice')} overdue · ${money(fees.outstanding, fees.currency)} outstanding` : 'No overdue invoices.', cta: { label: 'Open finance', to: '/finance' } },
    can('settings.manage') && openRequests > 0 && { key: 'doc-requests', kicker: 'Document requests', icon: FileText, title: `${plural(openRequests, 'request')} from parents & students`, text: 'Marksheets and certificates waiting to be prepared.', cta: { label: 'Open requests', to: '/documents?tab=requests' } },
    can('payroll.approve') && !!payroll?.pendingRuns && { key: 'payroll', kicker: 'Payroll', icon: Banknote, title: `${plural(payroll.pendingRuns, 'payroll run')} in progress`, text: 'Runs sent for approval appear here.', cta: { label: 'Open payroll', to: '/payroll' } },
  ]);
}

/** Accounts hero slides: collections, overdue invoices and payroll. */
export function useAccountsHeroSlides(): HeroSlide[] {
  const can = useCan();
  const fees = useFeesSummary().data;
  const payroll = usePayrollSummary().data;
  return keep([
    can('fees.view') && !!fees && { key: 'collected', kicker: 'This month', icon: Receipt, title: `${money(fees.collectedThisMonth, fees.currency)} collected`, text: `${money(fees.outstanding, fees.currency)} still outstanding.`, cta: { label: 'Record a payment', to: '/payments' } },
    can('fees.view') && !!fees?.overdueInvoices && { key: 'overdue', kicker: 'Follow up', icon: CalendarClock, title: `${plural(fees.overdueInvoices, 'overdue invoice')}`, text: 'Families past their due date.', cta: { label: 'See overdue fees', to: '/overdue-fees' } },
    can('payroll.view') && !!payroll && { key: 'payroll', kicker: 'Payroll', icon: Banknote, title: payroll.pendingRuns ? `${plural(payroll.pendingRuns, 'run')} in progress` : 'Payroll is up to date', text: `${payroll.withStructure} of ${payroll.staff} staff have a salary set.`, cta: { label: 'Open payroll', to: '/payroll' } },
  ]);
}

/** Teacher hero slides: the next class and today's check-in. */
export function useTeacherHeroSlides(): HeroSlide[] {
  const can = useCan();
  const today = useTodaysClasses().data;
  const attendance = useMyAttendance(new Date().toISOString().slice(0, 7)).data;
  const upcoming = today?.slots.filter((s) => !s.session && s.endMinute > today.nowMinute) ?? [];
  const next = upcoming[0];
  return keep([
    can('attendance.mark') && !!today && {
      key: 'next-class',
      kicker: "Today's classes",
      icon: Presentation,
      title: next ? `Next: ${next.subject.name} at ${next.startTime}` : today.slots.length ? 'All classes done for today' : 'No classes today',
      text: next ? `${next.section.schoolClass.name} ${next.section.name}${next.room ? ` · ${next.room.name}` : ''} · ${plural(upcoming.length, 'class', 'classes')} left today` : undefined,
      cta: { label: 'Start / end class', to: '/todays-classes' },
    },
    can('attendance.own') && !!attendance && { key: 'check-in', kicker: 'Attendance', icon: UserCheck, title: attendance.today ? (attendance.today.checkOutAt ? 'Checked out for today' : 'You are checked in') : 'Not checked in yet', text: attendance.today ? undefined : 'Check in from campus to record your day.', cta: { label: 'My attendance', to: '/my-attendance' } },
  ]);
}

/** Non-teaching staff hero slides: check-in and leave. */
export function useStaffHeroSlides(): HeroSlide[] {
  const can = useCan();
  const attendance = useMyAttendance(new Date().toISOString().slice(0, 7)).data;
  const leave = useMyLeave().data;
  const remaining = leave?.balances.filter((b) => b.remaining !== null).reduce((t, b) => t + (b.remaining ?? 0), 0);
  return keep([
    can('attendance.own') && !!attendance && { key: 'check-in', kicker: 'Attendance', icon: UserCheck, title: attendance.today ? (attendance.today.checkOutAt ? 'Checked out for today' : 'You are checked in') : 'Not checked in yet', cta: { label: 'My attendance', to: '/my-attendance' } },
    can('leave.own') && remaining !== undefined && { key: 'leave', kicker: 'Leave', icon: CalendarOff, title: `${plural(remaining, 'day')} of leave left`, text: `For ${leave?.year}.`, cta: { label: 'Apply for leave', to: '/leave' } },
  ]);
}

/** Student (or one child, for parents) hero slides: next period, work due and fees. */
export function useLearnerHeroSlides({ studentId, ready = true, parent = false }: { studentId?: string; ready?: boolean; parent?: boolean } = {}): HeroSlide[] {
  const can = useCan();
  const timetable = useMyTimetable(!parent && can('timetable.view'));
  const assignments = useMyAssignments(studentId, ready && can('assignment.view')).data;
  const feeStudents = useMyFeeStudents().data;
  const statement = useStatement(can('fees.own') ? (studentId ?? feeStudents?.[0]?.id) : null).data;
  const todo = assignments?.filter((a) => !a.submissions?.length).sort((a, b) => a.dueAt.localeCompare(b.dueAt)) ?? [];
  const next = parent
    ? undefined
    : timetable.data?.slots.filter((s) => s.dayOfWeek === isoWeekdayToday() && s.endMinute > nowMinute()).sort((a, b) => a.startMinute - b.startMinute)[0];
  return keep([
    !!next && { key: 'next', kicker: 'Next period', icon: Presentation, title: `${next.subject.name} at ${next.startTime}`, text: `${next.employee.firstName} ${next.employee.lastName}${next.room ? ` · ${next.room.name}` : ''}`, cta: { label: 'Timetable', to: '/timetable' } },
    !!assignments && { key: 'work', kicker: parent ? 'Homework' : 'Assignments', icon: NotebookPen, title: todo.length ? `${plural(todo.length, 'assignment')} to hand in` : 'All work handed in', text: todo[0] ? `Soonest: ${todo[0].title}` : undefined, cta: { label: parent ? 'Homework' : 'Assignments', to: parent ? '/homework' : '/assignments' } },
    !!statement && { key: 'fees', kicker: 'Fees', icon: Wallet, title: Number(statement.totals.balance) > 0 ? `${money(statement.totals.balance)} due` : 'Fees fully paid', text: statement.totals.overdue ? `${plural(statement.totals.overdue, 'invoice')} overdue` : undefined, cta: { label: 'View fees', to: '/fees' } },
  ]);
}
