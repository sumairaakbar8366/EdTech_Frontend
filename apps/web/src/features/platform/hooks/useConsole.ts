import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { PLATFORM_KEY } from '@/features/platform/hooks/usePlatform';
import { consoleService } from '@/features/platform/services/consoleService';
import type { Phase, PersonKind } from '@/features/platform/types/console.types';

export const CONSOLE_KEY = [...PLATFORM_KEY, 'console'] as const;

export const useConsoleSchools = (q: { phase?: Phase | ''; source?: string; q?: string; page: number }) =>
  useQuery({ queryKey: [...CONSOLE_KEY, 'schools', q], queryFn: () => consoleService.schools(q), placeholderData: keepPreviousData, refetchInterval: 60_000 });
export const useConsoleSchool = (id: string) => useQuery({ queryKey: [...CONSOLE_KEY, 'school', id], queryFn: () => consoleService.school(id) });
export const useSchoolLogins = (schoolId: string, q: { q?: string; page: number }) =>
  useQuery({ queryKey: [...CONSOLE_KEY, 'logins', schoolId, q], queryFn: () => consoleService.logins(schoolId, q), placeholderData: keepPreviousData });
export const useSchoolPeople = (q: { type: PersonKind; schoolId: string; q?: string; page: number }) =>
  useQuery({ queryKey: [...CONSOLE_KEY, 'people', q], queryFn: () => consoleService.people(q), placeholderData: keepPreviousData });
export const useGrowth = () => useQuery({ queryKey: [...CONSOLE_KEY, 'growth'], queryFn: consoleService.growth, refetchInterval: 120_000 });
export const useFinance = () => useQuery({ queryKey: [...CONSOLE_KEY, 'finance'], queryFn: consoleService.finance, refetchInterval: 60_000 });
export const useOwnerNotifications = (q: { show: 'all' | 'unread'; page: number; pageSize?: number }, refetchInterval = 30_000) =>
  useQuery({ queryKey: [...CONSOLE_KEY, 'notifications', q], queryFn: () => consoleService.notifications(q), placeholderData: keepPreviousData, refetchInterval, staleTime: 0 });
