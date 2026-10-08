import type { AcademicReport, AttendanceReport, FinanceReport } from '@/features/reports/types/report.types';
import { api } from '@/services/api/http';

/** Page 14 reporting views. */
export const reportService = {
  finance: () => api<FinanceReport>('/reports/finance'),
  attendance: (days: number) => api<AttendanceReport>(`/reports/attendance?days=${days}`),
  academics: () => api<AcademicReport>('/reports/academics'),
};
