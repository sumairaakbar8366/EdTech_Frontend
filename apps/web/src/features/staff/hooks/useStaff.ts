import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { staffService, type StaffListQuery } from '@/features/staff/services/staffService';
import { useAction } from '@/lib/hooks/useAction';

export const STAFF_KEY = ['staff'] as const;

export const useStaffList = (q: StaffListQuery) => useQuery({ queryKey: [...STAFF_KEY, 'list', q], queryFn: () => staffService.list(q), placeholderData: keepPreviousData });
export const useStaffSummary = (enabled = true) => useQuery({ queryKey: [...STAFF_KEY, 'summary'], queryFn: staffService.summary, enabled });

/** A staff member's record, or the signed-in user's own (`own`). */
export function useStaffMember(id: string | undefined, own: boolean) {
  return useQuery({ queryKey: [...STAFF_KEY, 'detail', own ? 'me' : id], queryFn: () => (own ? staffService.me() : staffService.get(id!)), retry: false });
}

/** A staff write: toast, then refresh staff and academics (teacher assignments). */
export function useStaffAction<TVars, TResult = unknown>(fn: (vars: TVars) => Promise<TResult>, success: string, onDone?: (r: TResult) => void) {
  return useAction(fn, { success, invalidate: [STAFF_KEY, ['academics']], onDone });
}
