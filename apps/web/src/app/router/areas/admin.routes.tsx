import { BillingPage } from '@/features/billing/pages/BillingPage';
import { WebsiteEditorPage } from '@/features/website/pages/WebsiteEditorPage';
import { MessagesPage } from '@/features/communication/pages/MessagesPage';
import type { AreaRoutes } from '@/app/router/types';
import { AcademicsPage } from '@/features/academics/pages/AcademicsPage';
import { AdmissionDetailPage } from '@/features/admissions/pages/AdmissionDetailPage';
import { AdmissionsPage } from '@/features/admissions/pages/AdmissionsPage';
import { AttendanceAdminPage } from '@/features/attendance/pages/AttendanceAdminPage';
import { AdminDashboard } from '@/features/dashboards/pages/AdminDashboard';
import { ExamDetailPage } from '@/features/exams/pages/ExamDetailPage';
import { ExamsPage } from '@/features/exams/pages/ExamsPage';
import { MarksheetPage } from '@/features/exams/pages/MarksheetPage';
import { FinancePage } from '@/features/fees/pages/FinancePage';
import { AssignmentDetailPage } from '@/features/lms/pages/AssignmentDetailPage';
import { CourseDetailPage } from '@/features/lms/pages/CourseDetailPage';
import { CoursesPage } from '@/features/lms/pages/CoursesPage';
import { PayrollPage } from '@/features/payroll/pages/PayrollPage';
import { RunDetailPage } from '@/features/payroll/pages/RunDetailPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { HiringPage } from '@/features/hiring/pages/HiringPage';
import { StaffDetailPage } from '@/features/staff/pages/StaffDetailPage';
import { StaffPage } from '@/features/staff/pages/StaffPage';
import { StudentDetailPage } from '@/features/students/pages/StudentDetailPage';
import { StudentsPage } from '@/features/students/pages/StudentsPage';
import { TimetableAdminPage } from '@/features/timetable/pages/TimetableAdminPage';
import { StaffTasksPage } from '@/features/tasks/pages/TasksPages';
import { NotificationsPage } from '@/features/communication/pages/NotificationsPage';
import { CommunicationPage } from '@/features/communication/pages/CommunicationPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { SchoolDocumentsPage } from '@/features/documents/pages/DocumentsPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { ActivityPage } from '@/features/audit/pages/ActivityPage';
import { LiveClassesPage } from '@/features/timetable/pages/LiveClassesPage';

/** School administrator (board page 4: Admin dashboard menu). */
export const adminRoutes: AreaRoutes = (can) => [
  { path: '', element: <AdminDashboard /> },
  { path: 'students', capability: 'students.view', element: <StudentsPage canEdit={can('students.edit')} /> },
  { path: 'students/:id', capability: 'students.view', element: <StudentDetailPage mode="admin" canEdit={can('students.edit')} /> },
  { path: 'staff', capability: 'staff.view', element: <StaffPage canEdit={can('staff.edit')} /> },
  { path: 'staff/tasks', capability: 'staff.edit', element: <StaffTasksPage /> },
  { path: 'staff/hiring', capability: 'staff.view', element: <HiringPage canEdit={can('staff.edit')} /> },
  { path: 'staff/:id', capability: 'staff.view', element: <StaffDetailPage canEdit={can('staff.edit')} canEditAcademics={can('academics.edit')} /> },
  { path: 'admissions', capability: 'admissions.view', element: <AdmissionsPage canEdit={can('admissions.edit')} /> },
  { path: 'admissions/:id', capability: 'admissions.view', element: <AdmissionDetailPage canEdit={can('admissions.edit')} /> },
  { path: 'academics', capability: 'academics.view', element: <AcademicsPage readOnly={!can('academics.edit')} /> },
  { path: 'attendance', capability: 'attendance.view', element: <AttendanceAdminPage canEdit={can('attendance.edit')} canApproveLeave={can('leave.approve')} /> },
  { path: 'timetable', capability: 'timetable.view', element: <TimetableAdminPage /> },
  { path: 'live-classes', capability: 'attendance.view', element: <LiveClassesPage /> },
  { path: 'finance', capability: 'fees.view', element: <FinancePage canEdit={can('fees.create')} /> },
  { path: 'payroll', capability: 'payroll.view', element: <PayrollPage canEdit={can('payroll.process')} /> },
  { path: 'payroll/runs/:id', capability: 'payroll.view', element: <RunDetailPage canEdit={can('payroll.process')} canApprove={can('payroll.approve')} /> },
  { path: 'lms', capability: 'lms.view', element: <CoursesPage /> },
  { path: 'lms/courses/:id', capability: 'lms.view', element: <CourseDetailPage isStudent={false} /> },
  { path: 'lms/assignments/:id', capability: 'assignment.view', element: <AssignmentDetailPage isStudent={false} /> },
  { path: 'exams-and-results', capability: 'exams.view', element: <ExamsPage canEdit={can('exams.manage')} canCorrect={can('results.publish')} /> },
  { path: 'exams/:id', capability: 'exams.view', element: <ExamDetailPage canEdit={can('exams.manage')} canEnter={can('results.enter')} canPublish={can('results.publish')} /> },
  { path: 'exams/:id/marks', capability: 'results.enter', element: <MarksheetPage /> },
  { path: 'website', capability: 'settings.manage', element: <WebsiteEditorPage /> },
  { path: 'users-and-access', capability: 'settings.manage', element: <UsersPage /> },
  { path: 'activity', capability: 'audit.view', element: <ActivityPage /> },
  { path: 'plans-and-billing', capability: 'settings.manage', element: <BillingPage /> },
  { path: 'billing', capability: 'settings.manage', element: <BillingPage /> },
  { path: 'settings', capability: 'settings.manage', element: <SettingsPage /> },
  { path: 'notifications', capability: 'communication.any', element: <NotificationsPage /> },
  { path: 'communication', capability: 'communication.manage', element: <CommunicationPage /> },
  { path: 'messages', capability: 'communication.converse', element: <MessagesPage title="Direct messages" sub="Write privately to a student's parents" /> },
  { path: 'reports', capability: 'reports.all', element: <ReportsPage /> },
  { path: 'documents', element: <SchoolDocumentsPage /> },
];
