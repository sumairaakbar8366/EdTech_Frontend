import { useQuery } from '@tanstack/react-query';
import type { PlanFeature, SubscriptionPhase } from '@schoolerp/shared';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';

// Plans & billing: types, service and hooks.

export interface SubscriptionState {
  phase: SubscriptionPhase;
  /** The trial / plan and its grace days are over: only sign-in and paying work until payment. */
  locked: boolean;
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

export type PaymentMethod = 'bank_transfer' | 'card' | 'bank_account' | 'jazzcash' | 'easypaisa';

export interface SubscriptionPayment {
  id: string;
  billingCycle: 'monthly' | 'annual';
  amount: string;
  currency: string;
  /** bank_transfer (owner confirms) or an online method (the gateway confirms). */
  method: PaymentMethod;
  provider: string;
  cardBrand: string | null;
  cardLast4: string | null;
  paidAt: string | null;
  failureReason: string | null;
  payerName: string | null;
  payerBank: string | null;
  payerAccount: string | null;
  reference: string | null;
  paidOn: string | null;
  note: string | null;
  status: 'initiated' | 'pending' | 'confirmed' | 'rejected' | 'failed';
  /** "plan" or "domain" (own-domain add-on). */
  purpose: 'plan' | 'domain';
  submittedByName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
  tier: { code: string; name: string } | null;
  school?: { id: string; name: string; slug: string };
}

export interface BillingOverview {
  state: SubscriptionState;
  plans: Plan[];
  features: { key: PlanFeature; label: string; description: string; plan: string }[];
  /** Manual bank transfer: only when the platform owner allows it. */
  bank: { bankName: string | null; accountTitle: string | null; accountNumber: string | null; iban: string | null; instructions: string | null } | null;
  onlinePayments: { provider: string; methods: Exclude<PaymentMethod, 'bank_transfer'>[] };
  /** Bought separately from the plan. */
  addons: { domain: { priceYearly: string | null; paidUntil: string | null; active: boolean; includedInPlan: boolean } };
  payments: SubscriptionPayment[];
}

export const METHOD_LABEL: Record<PaymentMethod, string> = { bank_transfer: 'Bank transfer', card: 'Card', bank_account: 'Bank account', jazzcash: 'JazzCash', easypaisa: 'Easypaisa' };

/** "Card (Visa ···· 4242)", "JazzCash ···· 4567", "Bank transfer" */
export const methodText = (p: Pick<SubscriptionPayment, 'method' | 'cardBrand' | 'cardLast4'>) =>
  `${METHOD_LABEL[p.method] ?? p.method}${p.cardBrand ? ` (${p.cardBrand}${p.cardLast4 ? ` ···· ${p.cardLast4}` : ''})` : p.cardLast4 ? ` ···· ${p.cardLast4}` : ''}`;

export const billingService = {
  state: () => api<SubscriptionState>('/subscription'),
  overview: () => api<BillingOverview>('/billing'),
  submit: (body: { tierCode: string; billingCycle: 'monthly' | 'annual'; amount: number; payerName: string; payerBank: string; payerAccount: string; reference: string; paidOn: string; note?: string | null }) =>
    api<SubscriptionPayment>('/billing/payments', { method: 'POST', body }),
  /** Opens an online checkout for the plan; the browser then goes to `redirectUrl` (the gateway). */
  checkout: (body: { tierCode: string; billingCycle: 'monthly' | 'annual' }) => api<{ paymentId: string; redirectUrl: string; expiresAt: string }>('/billing/checkout', { method: 'POST', body }),
  /** One year of the own-domain add-on. */
  checkoutDomain: () => api<{ paymentId: string; redirectUrl: string }>('/billing/checkout-domain', { method: 'POST' }),
  onlinePayment: (id: string) => api<SubscriptionPayment>(`/billing/online-payments/${id}`),
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
