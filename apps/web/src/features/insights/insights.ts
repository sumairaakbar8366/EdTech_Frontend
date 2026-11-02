import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api/http';

export interface Snapshot { students: number; newStudents: number; teachers: number; staff: number; attendancePercent: number | null; collected: number; billed: number; outstanding: number; salaries: number; admissions: number; surplus: number }
export interface Locked { locked: true; reason: 'trial'; period: { kind: string; label: string }; daysLeft: number | null; covers: string[] }
export interface Performance {
  locked: false;
  period: { kind: 'month' | 'year'; label: string; from: string; to: string };
  current: Snapshot; previous: Snapshot;
  changes: { students: number | null; collected: number | null; salaries: number | null; admissions: number | null };
  complaints: { raised: number; resolved: number; open: number; byCategory: { category: string; label: string; count: number }[] };
  verdict: { status: 'growing' | 'steady' | 'declining'; reasons: string[] };
  trend: { month: string; label: string; collected: number; newStudents: number; complaints: number }[];
}
export const usePerformance = (period: 'month' | 'year', ref: string) =>
  useQuery({ queryKey: ['school-performance', period, ref], queryFn: () => api<Performance | Locked>(`/reports/performance?period=${period}&ref=${ref}`) });
