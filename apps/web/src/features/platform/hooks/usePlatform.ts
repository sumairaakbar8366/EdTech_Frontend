import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { platformService } from '@/features/platform/services/platformService';
import type { TierFilter } from '@/features/platform/types/platform.types';

export const PLATFORM_KEY = ['platform'] as const;
export const SCHOOLS_KEY = [...PLATFORM_KEY, 'schools'] as const;
export const APPLICATIONS_KEY = [...PLATFORM_KEY, 'school-applications'] as const;

export const TIERS_KEY = [...PLATFORM_KEY, 'tiers'] as const;
export const useTiers = (filter: TierFilter = {}) => useQuery({ queryKey: [...TIERS_KEY, filter], queryFn: () => platformService.tiers(filter), placeholderData: keepPreviousData });
export const useSchools = () => useQuery({ queryKey: SCHOOLS_KEY, queryFn: platformService.schools });
export const useSchoolApplications = () => useQuery({ queryKey: APPLICATIONS_KEY, queryFn: platformService.applications });
