import type { AreaRoutes } from '@/app/router/types';
import { ClassAttendancePage } from '@/features/attendance/pages/ClassAttendancePage';
import { LeavePage } from '@/features/leave/pages/LeavePage';
import { MyAttendancePage } from '@/features/attendance/pages/MyAttendancePage';
import { TeacherDashboard } from '@/features/dashboards/pages/TeacherDashboard';
import { ExamDetailPage } from '@/features/exams/pages/ExamDetailPage';
import { ExamsPage } from '@/features/exams/pages/ExamsPage';
import { MarksheetPage } from '@/features/exams/pages/MarksheetPage';
import { AssignmentDetailPage } from '@/features/lms/pages/AssignmentDetailPage';
import { CourseDetailPage } from '@/features/lms/pages/CourseDetailPage';
import { CoursesPage } from '@/features/lms/pages/CoursesPage';
import { MyPayslipsPage } from '@/features/payroll/pages/MyPayslipsPage';
import { StaffDetailPage } from '@/features/staff/pages/StaffDetailPage';
import { MyTimetablePage } from '@/features/timetable/pages/MyTimetablePage';
import { TodaysClassesPage } from '@/features/timetable/pages/TodaysClassesPage';
import { NotificationsPage } from '@/features/communication/pages/NotificationsPage';
import { MyStudentsPage } from '@/features/students/pages/MyStudentsPage';
import { MessagesPage } from '@/features/communication/pages/MessagesPage';

/** Teacher (board page 4: Teacher dashboard menu). */
export const teacherRoutes: AreaRoutes = (can) => [
  { path: '', element: <TeacherDashboard /> },
  { path: 'my-timetable', capability: 'timetable.view', element: <MyTimetablePage /> },
  { path: 'todays-classes', capability: 'attendance.mark', element: <TodaysClassesPage /> },
  { path: 'start-class', capability: 'attendance.mark', element: <TodaysClassesPage /> },
  { path: 'class-attendance', capability: 'attendance.mark', element: <ClassAttendancePage /> },
  { path: 'assignments', capability: 'assignment.view', element: <CoursesPage key="assignments" title="Assignments" sub="Choose a course to post or grade assignments" /> },
  { path: 'learning-material', capability: 'lms.view', element: <CoursesPage key="learning-material" title="Learning material" sub="Notes, worksheets, videos and links by course" /> },
  { path: 'lms', capability: 'lms.view', element: <CoursesPage key="lms" /> },
  { path: 'lms/courses/:id', capability: 'lms.view', element: <CourseDetailPage isStudent={false} /> },
  { path: 'lms/assignments/:id', capability: 'assignment.view', element: <AssignmentDetailPage isStudent={false} /> },
  { path: 'exams-marks', capability: 'exams.view', element: <ExamsPage key="exams-marks" canEdit={false} title="Exams / Marks" /> },
  { path: 'student-performance', capability: 'exams.view', element: <ExamsPage key="student-performance" canEdit={false} title="Student performance" /> },
  { path: 'exams/:id', capability: 'exams.view', element: <ExamDetailPage canEdit={false} canEnter={can('results.enter')} canPublish={false} /> },
  { path: 'exams/:id/marks', capability: 'results.enter', element: <MarksheetPage /> },
  { path: 'my-attendance', capability: 'attendance.own', element: <MyAttendancePage /> },
  { path: 'leave', capability: 'leave.own', element: <LeavePage /> },
  { path: 'salary-payslips', capability: 'payroll.own', element: <MyPayslipsPage /> },
  { path: 'profile', capability: 'staff.own', element: <StaffDetailPage own canEdit={false} canEditAcademics={false} /> },
  { path: 'notifications', capability: 'communication.any', element: <NotificationsPage /> },
  { path: 'my-students', capability: 'students.view', element: <MyStudentsPage /> },
  { path: 'messages', capability: 'communication.converse', element: <MessagesPage sub="Conversations with your students' parents" /> },
];
