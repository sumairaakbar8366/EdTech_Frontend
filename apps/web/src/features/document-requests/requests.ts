import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Tone } from '@/components/ui';
import { NOTIFICATIONS_KEY } from '@/features/communication/hooks/useCommunication';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';

// Small feature: types, service and hooks in one module (as features/tasks).

export type RequestType = 'marksheet' | 'report_card' | 'character_certificate' | 'leaving_certificate' | 'bonafide_certificate' | 'transcript' | 'fee_clearance' | 'other';
export type RequestStatus = 'submitted' | 'in_review' | 'ready' | 'completed' | 'rejected' | 'cancelled';
export type Delivery = 'pickup' | 'digital';

export interface DocumentRequest {
  id: string;
  requestNo: string;
  studentId: string;
  type: RequestType;
  purpose: string;
  details: string | null;
  copies: number;
  delivery: Delivery;
  status: RequestStatus;
  adminNote: string | null;
  documentId: string | null;
  readyAt: string | null;
  completedAt: string | null;
  createdAt: string;
  student: { id: string; firstName: string; lastName: string; admissionNo: string; enrollments: { section: { name: string; schoolClass: { name: string } } }[] };
  events: { id: string; status: RequestStatus; note: string | null; actorName: string | null; createdAt: string }[];
  requester?: { id: string; firstName: string; lastName: string; email: string; phone: string | null } | null;
}

export const TYPE_LABEL: Record<RequestType, string> = {
  marksheet: 'Marksheet',
  report_card: 'Report card',
  character_certificate: 'Character certificate',
  leaving_certificate: 'School leaving certificate',
  bonafide_certificate: 'Bonafide (enrolment) certificate',
  transcript: 'Transcript',
  fee_clearance: 'Fee clearance certificate',
  other: 'Other document',
};
export const TYPE_HINT: Record<RequestType, string> = {
  marksheet: 'Marks of a specific exam',
  report_card: 'Term / annual report card',
  character_certificate: 'Conduct and character',
  leaving_certificate: 'When leaving the school',
  bonafide_certificate: 'Proof the child studies here (bank, visa, travel)',
  transcript: 'All years’ results',
  fee_clearance: 'No dues outstanding',
  other: 'Describe it in the details',
};
export const STATUS_LABEL: Record<RequestStatus, string> = { submitted: 'Submitted', in_review: 'In process', ready: 'Ready', completed: 'Completed', rejected: 'Declined', cancelled: 'Cancelled' };
export const STATUS_TONE: Record<RequestStatus, Tone> = { submitted: 'amber', in_review: 'primary', ready: 'emerald', completed: 'slate', rejected: 'rose', cancelled: 'slate' };
/** Next steps the administration can take from each status. */
export const NEXT_STEPS: Record<RequestStatus, RequestStatus[]> = { submitted: ['in_review', 'rejected'], in_review: ['ready', 'rejected'], ready: ['completed'], completed: [], rejected: [], cancelled: [] };

export const requestService = {
  create: (body: { studentId: string; type: RequestType; purpose: string; details?: string | null; copies: number; delivery: Delivery }) =>
    api<DocumentRequest>('/document-requests', { method: 'POST', body }),
  mine: () => api<DocumentRequest[]>('/document-requests/mine'),
  cancel: (id: string) => api<DocumentRequest>(`/document-requests/${id}/cancel`, { method: 'POST' }),
  list: (q: { page: number; pageSize: number; status?: RequestStatus | ''; type?: RequestType | ''; q?: string }) => {
    const p = new URLSearchParams({ page: String(q.page), pageSize: String(q.pageSize) });
    if (q.status) p.set('status', q.status);
    if (q.type) p.set('type', q.type);
    if (q.q) p.set('q', q.q);
    return api<{ items: DocumentRequest[]; total: number; page: number; pageSize: number }>(`/document-requests?${p}`);
  },
  summary: () => api<Partial<Record<RequestStatus, number>>>('/document-requests/summary'),
  move: ({ id, ...body }: { id: string; status: RequestStatus; note?: string | null; documentId?: string | null }) =>
    api<DocumentRequest>(`/document-requests/${id}/status`, { method: 'POST', body }),
};

const KEY = ['document-requests'] as const;
export const useMyRequests = () => useQuery({ queryKey: [...KEY, 'mine'], queryFn: requestService.mine });
export const useRequestList = (q: Parameters<typeof requestService.list>[0]) => useQuery({ queryKey: [...KEY, 'list', q], queryFn: () => requestService.list(q), placeholderData: keepPreviousData });
export const useRequestSummary = (enabled = true) => useQuery({ queryKey: [...KEY, 'summary'], queryFn: requestService.summary, enabled });
export function useRequestAction<TVars, TResult = unknown>(fn: (v: TVars) => Promise<TResult>, success?: string, onDone?: () => void) {
  return useAction(fn, { success, onDone, invalidate: [KEY, NOTIFICATIONS_KEY] });
}
