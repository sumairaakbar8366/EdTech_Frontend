import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/features/reports/services/reportService';

const REPORTS_KEY = ['reports'] as const;

export const useFinanceReport = () => useQuery({ queryKey: [...REPORTS_KEY, 'finance'], queryFn: reportService.finance });
export const useAttendanceReport = (days: number) => useQuery({ queryKey: [...REPORTS_KEY, 'attendance', days], queryFn: () => reportService.attendance(days) });
export const useAcademicReport = () => useQuery({ queryKey: [...REPORTS_KEY, 'academics'], queryFn: reportService.academics });
