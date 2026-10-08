import { useQuery } from '@tanstack/react-query';
import type { PlanFeature, SubscriptionPhase } from '@schoolerp/shared';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';

// Plans & billing: types, service and hooks.

export interface SubscriptionState {
  phase: SubscriptionPhase;
  readOnly: boolean;
  tier: { code: string; name: string } | null;
  status: string | null;
  billingCycle: 'monthly' | 'annual' | null;
  endsAt: string | null;
  graceEndsAt: string | null;
  daysLeft: number | null;
  features: PlanFeature[];
}

export interface Plan {
  code: string;
  name: string;
  priceMonthly: string | null;
  priceAnnual: string | null;
  currency: string;
  maxCampuses: number | null;
  maxStudents: number | null;
  maxStaff: number | null;
  features: PlanFeature[];
}

export interface SubscriptionPayment {
  id: string;
  billingCycle: 'monthly' | 'annual';
  amount: string;
  currency: string;
  payerName: string;
  payerBank: string;
  payerAccount: string;
  reference: string;
  paidOn: string;
  note: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  submittedByName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
  tier: { code: string; name: string };
  school?: { id: string; name: string; slug: string };
}

export interface BillingOverview {
  state: SubscriptionState;
  plans: Plan[];
  features: { key: PlanFeature; label: string; description: string; plan: string }[];
  bank: { bankName: string | null; accountTitle: string | null; accountNumber: string | null; iban: string | null; instructions: string | null } | null;
  payments: SubscriptionPayment[];
}

export const billingService = {
  state: () => api<SubscriptionState>('/subscription'),
  overview: () => api<BillingOverview>('/billing'),
  submit: (body: { tierCode: string; billingCycle: 'monthly' | 'annual'; amount: number; payerName: string; payerBank: string; payerAccount: string; reference: string; paidOn: string; note?: string | null }) =>
    api<SubscriptionPayment>('/billing/payments', { method: 'POST', body }),
};

const KEY = ['billing'] as const;
/** Plan state for any school user; refreshed every few minutes and on focus. */
export const useSubscription = (enabled = true) => useQuery({ queryKey: [...KEY, 'state'], queryFn: billingService.state, enabled, staleTime: 120_000 });
export const useBillingOverview = () => useQuery({ queryKey: [...KEY, 'overview'], queryFn: billingService.overview });
export function useBillingAction<TVars, TResult = unknown>(fn: (v: TVars) => Promise<TResult>, success?: string, onDone?: () => void) {
  return useAction(fn, { success, onDone, invalidate: [KEY] });
}

/** Which plan feature a page belongs to (second URL segment, e.g. /teacher/exams-marks). */
export const FEATURE_BY_SEGMENT: Record<string, PlanFeature> = {
  'exams-and-results': 'exams', exams: 'exams', 'exams-marks': 'exams', results: 'exams', 'student-performance': 'exams',
  lms: 'lms', 'learning-material': 'lms', assignments: 'lms', 'my-classes': 'lms', homework: 'lms',
  payroll: 'payroll', 'staff-payroll': 'payroll', 'salary-processing': 'payroll', payslips: 'payroll', 'salary-payslips': 'payroll',
  'document-requests': 'document_requests',
  'my-attendance': 'gps_attendance',
};

export const priceOf = (p: Plan, cycle: 'monthly' | 'annual') => (cycle === 'annual' ? p.priceAnnual : p.priceMonthly);
export const formatMoney = (amount: string | number | null, currency: string) => (amount === null ? '—' : `${currency} ${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
