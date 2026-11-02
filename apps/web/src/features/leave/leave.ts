import { useQuery } from '@tanstack/react-query';
import type { Tone } from '@/components/ui';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';

// --- Types -------------------------------------------------------------------------------

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  decisionNote: string | null;
  leaveType: { id: string; name: string; code: string; isPaid: boolean };
  employee: { id: string; firstName: string; lastName: string; employeeNo: string; designation: string; photoKey?: string | null };
}

export interface LeaveBalance {
  leaveTypeId: string;
  name: string;
  code: string;
  isPaid: boolean;
  quota: number | null;
  used: number;
  pending: number;
  remaining: number | null;
}

export const LEAVE_TONE: Record<LeaveStatus, Tone> = { pending: 'amber', approved: 'emerald', rejected: 'rose', cancelled: 'slate' };

// --- Service -----------------------------------------------------------------------------

/** Leave API: staff requests, balances and admin decisions (page 6). */
export const leaveService = {
  list: (status: LeaveStatus | '') => api<LeaveRequest[]>(`/leave${status ? `?status=${status}` : ''}`),
  decide: (id: string, decision: 'approved' | 'rejected') => api(`/leave/${id}/decision`, { method: 'POST', body: { decision } }),
  mine: () => api<{ year: number; balances: LeaveBalance[]; requests: LeaveRequest[] }>('/leave/me'),
  apply: (body: { leaveTypeId: string; startDate: string; endDate: string; reason: string }) => api('/leave', { method: 'POST', body }),
  cancel: (id: string) => api(`/leave/${id}/cancel`, { method: 'POST' }),
};

// --- Hooks -------------------------------------------------------------------------------

const LEAVE_KEY = ['attendance', 'leave'] as const;
export const useLeaveRequests = (status: LeaveStatus | '') => useQuery({ queryKey: [...LEAVE_KEY, status], queryFn: () => leaveService.list(status) });
export const useMyLeave = () => useQuery({ queryKey: [...LEAVE_KEY, 'me'], queryFn: leaveService.mine });
export function useLeaveAction<T>(fn: (v: T) => Promise<unknown>, success: string, onDone?: () => void) {
  return useAction(fn, { success, invalidate: [LEAVE_KEY], onDone });
}

export const daysLabel = (days: number) => `${days} day${days === 1 ? '' : 's'}`;
