import { useQuery } from '@tanstack/react-query';
import { hiringService } from '@/features/hiring/services/hiringService';
import { STAFF_KEY } from '@/features/staff/hooks/useStaff';

/** Hiring lives under the staff key, so hiring a candidate also refreshes the staff directory. */
const HIRING_KEY = [...STAFF_KEY, 'hiring'] as const;

export const useJobPosts = () => useQuery({ queryKey: [...HIRING_KEY, 'posts'], queryFn: hiringService.posts });
export const useHiringSummary = () => useQuery({ queryKey: [...HIRING_KEY, 'summary'], queryFn: hiringService.summary });
export const usePipeline = (postId: string) => useQuery({ queryKey: [...HIRING_KEY, 'apps', postId], queryFn: () => hiringService.applications(postId) });

export { useStaffAction as useHiringAction } from '@/features/staff/hooks/useStaff';
