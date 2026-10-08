import { api } from '@/services/api/http';

export interface AuditEntry {
  id: string;
  actorName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  method: string;
  path: string;
  ip: string | null;
  createdAt: string;
}

export interface AuditPage {
  items: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  entities: { entity: string; count: number }[];
}

const qs = (o: Record<string, string | number | undefined>) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));

/** Audit trail of changes made in the school (page 14). */
export const auditService = {
  list: (q: { page: number; entity?: string; q?: string }) => api<AuditPage>(`/audit-logs?${qs(q)}`),
};
