import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { feeService } from '@/features/fees/services/feeService';
import type { InvoiceStatus } from '@/features/fees/types/fee.types';
import { useAction } from '@/lib/hooks/useAction';

export const FEES_KEY = ['fees'] as const;

export const useFeesSummary = () => useQuery({ queryKey: [...FEES_KEY, 'summary'], queryFn: feeService.summary });
export const useFeeCategories = (enabled = true) => useQuery({ queryKey: [...FEES_KEY, 'categories'], queryFn: feeService.categories, enabled });
export const useFeeStructures = (academicYearId: string) => useQuery({ queryKey: [...FEES_KEY, 'structures', academicYearId], queryFn: () => feeService.structures(academicYearId || undefined) });
export const useConcessions = () => useQuery({ queryKey: [...FEES_KEY, 'concessions'], queryFn: feeService.concessions });
export const useAwards = () => useQuery({ queryKey: [...FEES_KEY, 'awards'], queryFn: feeService.awards });
export const useInvoices = (q: { page: number; pageSize: number; q?: string; status?: InvoiceStatus | '' }) =>
  useQuery({ queryKey: [...FEES_KEY, 'invoices', q], queryFn: () => feeService.invoices(q), placeholderData: keepPreviousData });
export const useInvoice = (id: string | null) => useQuery({ queryKey: [...FEES_KEY, 'invoice', id], queryFn: () => feeService.invoice(id!), enabled: !!id });
export const usePayments = (q: { page: number; pageSize: number; from?: string; to?: string; q?: string }) =>
  useQuery({ queryKey: [...FEES_KEY, 'payments', q], queryFn: () => feeService.payments(q), placeholderData: keepPreviousData });
export const useReceipt = (paymentId: string | null) => useQuery({ queryKey: [...FEES_KEY, 'receipt', paymentId], queryFn: () => feeService.receipt(paymentId!), enabled: !!paymentId });
export const useStatement = (studentId: string | null | undefined) =>
  useQuery({ queryKey: [...FEES_KEY, 'statement', studentId], queryFn: () => feeService.statement(studentId!), enabled: !!studentId });
export const useMyFeeStudents = () => useQuery({ queryKey: [...FEES_KEY, 'my-students'], queryFn: feeService.myStudents });

/** A fees write: optional toast, then refresh every fees query. Errors are left to the caller when `toastErrors` is false. */
export function useFeesAction<TVars, TResult = unknown>(
  fn: (v: TVars) => Promise<TResult>,
  options: { success?: string | ((r: TResult) => string); onDone?: (r: TResult) => void; toastErrors?: boolean } = {},
) {
  return useAction(fn, { ...options, invalidate: [FEES_KEY] });
}
