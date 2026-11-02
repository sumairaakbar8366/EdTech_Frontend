import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api/http';
import type { ApiCredentials, EmailProof } from '@/features/users/users';

export interface LeaderTitle { key: string; label: string; hidden: string[]; blurb: string }
export interface LeaderSeat {
  userId: string;
  titleKey: string;
  titleLabel: string;
  hiddenSections: string[];
  user: { id: string; firstName: string; lastName: string; email: string | null; loginId: string; status: 'active' | 'disabled'; lastLoginAt: string | null; mustChangePassword: boolean };
}
export interface LeadershipOverview { seats: LeaderSeat[]; titles: LeaderTitle[]; moreTitlesIncluded: boolean }
export interface AddLeaderBody { titleKey: string; customTitle?: string; firstName: string; lastName: string; email: string; verification?: EmailProof; hiddenSections: string[] }
export interface AddLeaderResult { credentials: ApiCredentials; titleLabel: string; emailedPassword: boolean }

/** What each part of the principal's dashboard is called (the same keys the API stores). */
export const DASHBOARD_SECTIONS = [
  { key: 'kpis', label: 'Headline figures' },
  { key: 'live_classes', label: 'Live classes' },
  { key: 'administration', label: 'Administration staff' },
  { key: 'activity', label: 'Recent activity' },
  { key: 'leave', label: 'Leave approvals' },
  { key: 'growth', label: 'Growth report' },
  { key: 'complaints', label: 'Complaints' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'people', label: 'People' },
  { key: 'fees', label: 'Fees' },
  { key: 'structure', label: 'School structure' },
] as const;

const KEY = ['leadership'] as const;
export const leadershipService = {
  overview: () => api<LeadershipOverview>('/leadership'),
  add: (body: AddLeaderBody) => api<AddLeaderResult>('/leadership', { method: 'POST', body }),
  update: ({ userId, ...body }: { userId: string; titleKey?: string; customTitle?: string; hiddenSections?: string[] }) => api<LeadershipOverview>(`/leadership/${userId}`, { method: 'PATCH', body }),
  remove: (userId: string) => api<LeadershipOverview>(`/leadership/${userId}`, { method: 'DELETE' }),
};
export const useLeadership = () => useQuery({ queryKey: KEY, queryFn: leadershipService.overview });
export const LEADERSHIP_KEY = KEY;
