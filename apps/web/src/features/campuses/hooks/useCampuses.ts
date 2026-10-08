import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/features/campuses/services/campusService';

export const CAMPUSES_KEY = ['campuses'] as const;

export function useCampuses(enabled = true) {
  return useQuery({ queryKey: CAMPUSES_KEY, queryFn: campusService.list, enabled });
}

/** Active campuses, for pickers (sections, rooms, staff). */
export function useActiveCampuses(enabled = true) {
  return useQuery({ queryKey: CAMPUSES_KEY, queryFn: campusService.list, enabled, select: (all) => all.filter((c) => c.isActive) });
}
