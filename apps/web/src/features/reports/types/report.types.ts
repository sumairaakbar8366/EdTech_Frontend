export interface FinanceReport {
  byMonth: { month: string; collected: number; payments: number }[];
  byClass: { className: string; billed: number; paid: number; outstanding: number; overdueInvoices: number }[];
  byStatus: { status: string; invoices: number; total: number; paid: number }[];
  byMethod: { method: string; payments: number; amount: number }[];
}

export interface AttendanceReport {
  days: number;
  byClass: { className: string; present: number; late: number; absent: number; excused: number; rate: number | null }[];
  sessions: Partial<Record<'live' | 'completed' | 'cancelled', number>>;
  staff: { valid: number; flagged: number; unknown: number; pendingReview: number };
}

export type AcademicReport = { examId: string; name: string; startDate: string; classes: { className: string; students: number; passRate: number; average: number }[] }[];
