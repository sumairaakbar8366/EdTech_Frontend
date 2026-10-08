import { useQuery } from '@tanstack/react-query';
import { NOTIFICATIONS_KEY } from '@/features/communication/hooks/useCommunication';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';

// Staff bank accounts for salary payments: types, service and hooks (as features/tasks).

export type BankStatus = 'pending' | 'approved' | 'rejected' | 'replaced';

export interface BankAccount {
  id: string;
  employeeId: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string | null;
  branch: string | null;
  status: BankStatus;
  requestNote: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  employee?: { id: string; employeeNo: string; firstName: string; lastName: string; designation: string };
}

export interface BankForm {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branch: string;
  requestNote: string;
}

export interface PayslipRow {
  id: string;
  gross: string;
  totalDeductions: string;
  net: string;
  employee: { id: string; employeeNo: string; firstName: string; lastName: string; designation: string };
  payslip: { payslipNo: string } | null;
  payment: { method: string; reference: string | null; paidAt: string; payeeAccount: string | null } | null;
  run: { id: string; period: { name: string; startDate: string } };
}

/** Common Pakistani banks (free text is still allowed). */
export const BANKS = ['HBL', 'MCB', 'UBL', 'Meezan Bank', 'Allied Bank', 'Bank Alfalah', 'Bank Al Habib', 'National Bank of Pakistan', 'Faysal Bank', 'Askari Bank', 'Standard Chartered', 'JS Bank', 'Soneri Bank', 'Bank of Punjab', 'Dubai Islamic Bank', 'Habib Metro'];

const toBody = (f: BankForm) => ({ bankName: f.bankName, accountTitle: f.accountTitle, accountNumber: f.accountNumber, iban: f.iban.trim() || null, branch: f.branch.trim() || null, requestNote: f.requestNote.trim() || null });

export const bankService = {
  mine: () => api<{ current: BankAccount | null; pending: BankAccount | null; history: BankAccount[] }>('/payroll/bank-accounts/me'),
  submit: (f: BankForm) => api<BankAccount>('/payroll/bank-accounts/me', { method: 'POST', body: toBody(f) }),
  cancel: () => api('/payroll/bank-accounts/me/pending', { method: 'DELETE' }),
  list: (status?: BankStatus) => api<BankAccount[]>(`/payroll/bank-accounts${status ? `?status=${status}` : ''}`),
  review: ({ id, decision, note }: { id: string; decision: 'approved' | 'rejected'; note?: string }) => api<BankAccount>(`/payroll/bank-accounts/${id}/review`, { method: 'POST', body: { decision, note: note?.trim() || null } }),
  setFor: ({ employeeId, form }: { employeeId: string; form: BankForm }) => api<BankAccount>(`/payroll/bank-accounts/employee/${employeeId}`, { method: 'PUT', body: toBody(form) }),
  register: (q: { runId?: string; q?: string }) => {
    const p = new URLSearchParams();
    if (q.runId) p.set('runId', q.runId);
    if (q.q) p.set('q', q.q);
    return api<PayslipRow[]>(`/payroll/payslips?${p}`);
  },
};

const KEY = ['bank-accounts'] as const;
export const useMyBank = () => useQuery({ queryKey: [...KEY, 'mine'], queryFn: bankService.mine });
export const useBankList = (status?: BankStatus) => useQuery({ queryKey: [...KEY, 'list', status], queryFn: () => bankService.list(status) });
export const usePayslipRegister = (q: { runId?: string; q?: string }) => useQuery({ queryKey: ['payroll', 'register', q], queryFn: () => bankService.register(q) });
export function useBankAction<TVars, TResult = unknown>(fn: (v: TVars) => Promise<TResult>, success?: string, onDone?: () => void) {
  return useAction(fn, { success, onDone, invalidate: [KEY, NOTIFICATIONS_KEY] });
}
export const EMPTY_BANK: BankForm = { bankName: '', accountTitle: '', accountNumber: '', iban: '', branch: '', requestNote: '' };
