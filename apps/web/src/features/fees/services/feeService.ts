import type {
  Award,
  Concession,
  FeeCategory,
  FeeStructure,
  FeesSummary,
  Frequency,
  Invoice,
  InvoiceDetail,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  ReceiptView,
  Statement,
} from '@/features/fees/types/fee.types';
import { api } from '@/services/api/http';
import type { Paged } from '@/types/common';

export interface StructurePayload {
  classId: string;
  name: string;
  isActive: boolean;
  items: { categoryId: string; amount: string; frequency: Frequency }[];
}
export interface ConcessionPayload {
  kind: Concession['kind'];
  name: string;
  valueType: Concession['valueType'];
  value: string;
  categoryId: string | null;
  isActive: boolean;
}

const qs = (o: Record<string, string | number | undefined>) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));

/** Fees & finance API (page 8: structure → invoice → payment → receipt). */
export const feeService = {
  summary: () => api<FeesSummary>('/fees/summary'),

  categories: () => api<FeeCategory[]>('/fees/categories'),
  saveCategory: (id: string | undefined, body: { name: string; code: string; isActive: boolean }) =>
    id ? api(`/fees/categories/${id}`, { method: 'PATCH', body }) : api('/fees/categories', { method: 'POST', body }),

  structures: (academicYearId?: string) => api<FeeStructure[]>(`/fees/structures${academicYearId ? `?academicYearId=${academicYearId}` : ''}`),
  saveStructure: (id: string | undefined, body: StructurePayload) => (id ? api(`/fees/structures/${id}`, { method: 'PUT', body }) : api('/fees/structures', { method: 'POST', body })),
  assignStructure: (id: string, sectionId?: string) => api<{ assigned: number; alreadyAssigned: number }>(`/fees/structures/${id}/assign`, { method: 'POST', body: { sectionId } }),

  concessions: () => api<Concession[]>('/fees/concessions'),
  saveConcession: (id: string | undefined, body: ConcessionPayload) => (id ? api(`/fees/concessions/${id}`, { method: 'PATCH', body }) : api('/fees/concessions', { method: 'POST', body })),
  awards: () => api<Award[]>('/fees/awards'),
  grantAward: (body: { studentId: string; discountId: string; reason: string; validFrom: string; validUntil: string }) => api('/fees/awards', { method: 'POST', body }),
  revokeAward: (id: string) => api(`/fees/awards/${id}/revoke`, { method: 'POST' }),

  invoices: (q: { page: number; pageSize: number; q?: string; status?: InvoiceStatus | '' }) => api<Paged<Invoice>>(`/fees/invoices?${qs(q)}`),
  invoice: (id: string) => api<InvoiceDetail>(`/fees/invoices/${id}`),
  /** Waive or cancel an invoice, with a reason. */
  closeInvoice: (id: string, action: 'waive' | 'cancel', note: string) => api(`/fees/invoices/${id}/${action}`, { method: 'POST', body: { note } }),
  generateInvoices: (body: { academicYearId?: string; classId: string; sectionId?: string; periodLabel: string; issueDate: string; dueDate: string; frequencies: Frequency[] }) =>
    api<{ created: number; skipped: number }>('/fees/invoices/generate', { method: 'POST', body }),

  payments: (q: { page: number; pageSize: number; from?: string; to?: string; q?: string }) => api<Paged<Payment>>(`/fees/payments?${qs(q)}`),
  recordPayment: (body: { studentId: string; amount: string; method: PaymentMethod; reference: string | null; notes: string | null }) =>
    api<{ paymentId: string; receiptNo: string }>('/fees/payments', { method: 'POST', body }),
  voidPayment: (id: string, note: string) => api(`/fees/payments/${id}/void`, { method: 'POST', body: { note } }),
  receipt: (paymentId: string) => api<ReceiptView>(`/fees/payments/${paymentId}/receipt`),

  statement: (studentId: string) => api<Statement>(`/fees/students/${studentId}/statement`),
  myStudents: () => api<{ id: string; firstName: string; lastName: string }[]>('/fees/my-students'),
};
