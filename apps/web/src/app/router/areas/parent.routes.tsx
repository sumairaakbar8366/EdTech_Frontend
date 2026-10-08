import { MyRequestsPage } from '@/features/document-requests/pages/MyRequestsPage';
import type { AreaRoutes } from '@/app/router/types';
import { ChildrenAttendancePage } from '@/features/attendance/pages/ChildrenAttendancePage';
import { ParentDashboard } from '@/features/dashboards/pages/ParentDashboard';
import { ResultsPage } from '@/features/exams/pages/ResultsPage';
import { MyFeesPage } from '@/features/fees/pages/MyFeesPage';
import { AssignmentDetailPage } from '@/features/lms/pages/AssignmentDetailPage';
import { CourseDetailPage } from '@/features/lms/pages/CourseDetailPage';
import { CoursesPage } from '@/features/lms/pages/CoursesPage';
import { MyAssignmentsPage } from '@/features/lms/pages/MyAssignmentsPage';
import { MyChildrenPage } from '@/features/students/pages/MyChildrenPage';
import { StudentDetailPage } from '@/features/students/pages/StudentDetailPage';
import { ChildrenTimetablePage } from '@/features/timetable/pages/ChildrenTimetablePage';
import { NotificationsPage } from '@/features/communication/pages/NotificationsPage';
import { MessagesPage } from '@/features/communication/pages/MessagesPage';
import { ChildrenDocumentsPage } from '@/features/documents/pages/DocumentsPage';

/** Parent (board page 4: Parent dashboard menu). */
export const parentRoutes: AreaRoutes = () => [
  { path: '', element: <ParentDashboard /> },
  { path: 'my-children', capability: 'students.children', element: <MyChildrenPage /> },
  { path: 'my-children/:id', capability: 'students.children', element: <StudentDetailPage mode="child" /> },
  { path: 'attendance', capability: 'attendance.children', element: <ChildrenAttendancePage /> },
  { path: 'timetable', capability: 'timetable.view', element: <ChildrenTimetablePage /> },
  { path: 'homework', capability: 'assignment.view', element: <MyAssignmentsPage title="Homework" /> },
  { path: 'lms', capability: 'lms.view', element: <CoursesPage key="lms" /> },
  { path: 'lms/courses/:id', capability: 'lms.view', element: <CourseDetailPage isStudent={false} /> },
  { path: 'lms/assignments/:id', capability: 'assignment.view', element: <AssignmentDetailPage isStudent={false} /> },
  { path: 'results', capability: 'results.view', element: <ResultsPage /> },
  { path: 'fees', capability: 'fees.own', element: <MyFeesPage /> },
  { path: 'receipts', capability: 'fees.own', element: <MyFeesPage key="receipts" focus="receipts" /> },
  { path: 'notifications', capability: 'communication.any', element: <NotificationsPage /> },
  { path: 'teacher-communication', capability: 'communication.converse', element: <MessagesPage title="Teacher Communication" sub="Write to your children's teachers" /> },
  { path: 'documents', element: <ChildrenDocumentsPage /> },
  { path: 'document-requests', capability: 'documents.request', element: <MyRequestsPage /> },
];
