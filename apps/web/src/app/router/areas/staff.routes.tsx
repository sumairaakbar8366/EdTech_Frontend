import type { AreaRoutes } from '@/app/router/types';
import { LeavePage } from '@/features/leave/pages/LeavePage';
import { MyAttendancePage } from '@/features/attendance/pages/MyAttendancePage';
import { StaffDashboard } from '@/features/dashboards/pages/StaffDashboard';
import { MyPayslipsPage } from '@/features/payroll/pages/MyPayslipsPage';
import { MyTasksPage } from '@/features/tasks/pages/TasksPages';
import { NotificationsPage } from '@/features/communication/pages/NotificationsPage';

/** Non-teaching staff (built from their page-3 capabilities; page 4 has no such dashboard). */
export const staffRoutes: AreaRoutes = () => [
  { path: '', element: <StaffDashboard /> },
  { path: 'my-attendance', capability: 'attendance.own', element: <MyAttendancePage /> },
  { path: 'leave', capability: 'leave.own', element: <LeavePage /> },
  { path: 'payslips', capability: 'payroll.own', element: <MyPayslipsPage /> },
  { path: 'assigned-tasks', capability: 'staff.own', element: <MyTasksPage /> },
  { path: 'notifications', capability: 'communication.any', element: <NotificationsPage /> },
];
