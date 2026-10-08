import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { auditService } from '@/features/audit/services/auditService';

export const useAuditLog = (q: { page: number; entity?: string; q?: string }) =>
  useQuery({ queryKey: ['audit', q], queryFn: () => auditService.list(q), placeholderData: keepPreviousData });
