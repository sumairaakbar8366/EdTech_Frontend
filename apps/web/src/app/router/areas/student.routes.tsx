import { MyRequestsPage } from '@/features/document-requests/pages/MyRequestsPage';
import type { AreaRoutes } from '@/app/router/types';
import { StudentAttendancePage } from '@/features/attendance/pages/StudentAttendancePage';
import { StudentDashboard } from '@/features/dashboards/pages/StudentDashboard';
import { ExamDetailPage } from '@/features/exams/pages/ExamDetailPage';
import { ExamsPage } from '@/features/exams/pages/ExamsPage';
import { ResultsPage } from '@/features/exams/pages/ResultsPage';
import { MyFeesPage } from '@/features/fees/pages/MyFeesPage';
import { AssignmentDetailPage } from '@/features/lms/pages/AssignmentDetailPage';
import { CourseDetailPage } from '@/features/lms/pages/CourseDetailPage';
import { CoursesPage } from '@/features/lms/pages/CoursesPage';
import { MyAssignmentsPage } from '@/features/lms/pages/MyAssignmentsPage';
import { StudentDetailPage } from '@/features/students/pages/StudentDetailPage';
import { MyTimetablePage } from '@/features/timetable/pages/MyTimetablePage';
import { NotificationsPage } from '@/features/communication/pages/NotificationsPage';
import { MyDocumentsPage } from '@/features/documents/pages/DocumentsPage';

/** Student (board page 4: Student dashboard menu). */
export const studentRoutes: AreaRoutes = () => [
  { path: '', element: <StudentDashboard /> },
  { path: 'my-profile', capability: 'students.own', element: <StudentDetailPage mode="own" /> },
  { path: 'my-classes', capability: 'lms.view', element: <CoursesPage key="my-classes" title="My classes" sub="Your subjects this year" /> },
  { path: 'timetable', capability: 'timetable.view', element: <MyTimetablePage /> },
  { path: 'attendance', capability: 'attendance.own', element: <StudentAttendancePage /> },
  { path: 'learning-material', capability: 'lms.view', element: <CoursesPage key="learning-material" title="Learning material" sub="Notes, worksheets, videos and links by course" /> },
  { path: 'lms', capability: 'lms.view', element: <CoursesPage key="lms" /> },
  { path: 'lms/courses/:id', capability: 'lms.view', element: <CourseDetailPage isStudent /> },
  { path: 'assignments', capability: 'assignment.view', element: <MyAssignmentsPage /> },
  { path: 'lms/assignments/:id', capability: 'assignment.view', element: <AssignmentDetailPage isStudent /> },
  { path: 'exams', capability: 'exams.view', element: <ExamsPage canEdit={false} title="Exams" /> },
  { path: 'exams/:id', capability: 'exams.view', element: <ExamDetailPage canEdit={false} canEnter={false} canPublish={false} /> },
  { path: 'results', capability: 'results.view', element: <ResultsPage /> },
  { path: 'fees', capability: 'fees.own', element: <MyFeesPage /> },
  { path: 'notifications', capability: 'communication.any', element: <NotificationsPage /> },
  { path: 'documents', element: <MyDocumentsPage /> },
  { path: 'document-requests', capability: 'documents.request', element: <MyRequestsPage /> },
];
