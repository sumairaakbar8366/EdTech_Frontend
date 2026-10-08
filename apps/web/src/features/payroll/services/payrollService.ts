import type { PaymentMethod } from '@/features/fees/types/fee.types';
import type { MyPayslip, PayrollSummary, PayslipView, Run, RunAction, RunDetail, SalaryComponent, StaffSalary } from '@/features/payroll/types/payroll.types';
import { api } from '@/services/api/http';

/** Payroll API (page 9: structure → run → review → approve → pay → payslip). */
export const payrollService = {
  summary: () => api<PayrollSummary>('/payroll/summary'),

  structures: () => api<StaffSalary[]>('/payroll/structures'),
  /** Saves a new structure version for one employee. */
  saveStructure: (employeeId: string, body: { basicSalary: string; effectiveFrom: string; components: SalaryComponent[] }) =>
    api(`/payroll/structures/${employeeId}`, { method: 'PUT', body }),

  runs: () => api<Run[]>('/payroll/runs'),
  run: (id: string) => api<RunDetail>(`/payroll/runs/${id}`),
  createRun: (body: { name: string; startDate: string; endDate: string; applyAttendance: boolean }) => api<{ id: string }>('/payroll/runs', { method: 'POST', body }),
  runAction: (id: string, action: RunAction, body?: { note?: string; method?: PaymentMethod; reference?: string | null }) =>
    api(`/payroll/runs/${id}/${action}`, { method: 'POST', body: body ?? {} }),
  adjustItem: (itemId: string, body: { bonus: string; manualDeduction: string; manualDeductionLabel: string | null; note: string | null }) =>
    api(`/payroll/items/${itemId}`, { method: 'PATCH', body }),

  payslip: (itemId: string) => api<PayslipView>(`/payroll/payslips/${itemId}`),
  myPayslips: () => api<MyPayslip[]>('/payroll/payslips/me'),
};
