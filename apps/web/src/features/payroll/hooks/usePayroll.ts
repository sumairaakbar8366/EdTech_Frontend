import { useQuery } from '@tanstack/react-query';
import { payrollService } from '@/features/payroll/services/payrollService';
import { useAction } from '@/lib/hooks/useAction';

export const PAYROLL_KEY = ['payroll'] as const;

export const usePayrollSummary = () => useQuery({ queryKey: [...PAYROLL_KEY, 'summary'], queryFn: payrollService.summary });
export const useSalaryStructures = () => useQuery({ queryKey: [...PAYROLL_KEY, 'structures'], queryFn: payrollService.structures });
export const usePayrollRuns = () => useQuery({ queryKey: [...PAYROLL_KEY, 'runs'], queryFn: payrollService.runs });
export const usePayrollRun = (id: string | undefined) => useQuery({ queryKey: [...PAYROLL_KEY, 'run', id], queryFn: () => payrollService.run(id!), enabled: !!id });
export const usePayslip = (itemId: string | null) => useQuery({ queryKey: [...PAYROLL_KEY, 'payslip', itemId], queryFn: () => payrollService.payslip(itemId!), enabled: !!itemId });
export const useMyPayslips = () => useQuery({ queryKey: [...PAYROLL_KEY, 'mine'], queryFn: payrollService.myPayslips });

/** A payroll write: optional toast, then refresh every payroll query. */
export function usePayrollAction<TVars, TResult = unknown>(
  fn: (v: TVars) => Promise<TResult>,
  options: { success?: string | ((r: TResult) => string); onDone?: (r: TResult) => void; toastErrors?: boolean } = {},
) {
  return useAction(fn, { ...options, invalidate: [PAYROLL_KEY] });
}
