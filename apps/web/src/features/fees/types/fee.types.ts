export type Frequency = 'one_time' | 'monthly' | 'termly' | 'annual';

export type InvoiceStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'waived' | 'cancelled';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'cheque' | 'online';

export interface StudentRef {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
}

export interface FeeCategory {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface FeeStructure {
  id: string;
  name: string;
  isActive: boolean;
  academicYear: { id: string; name: string };
  schoolClass: { id: string; name: string; level: number };
  items: { id: string; categoryId: string; amount: string; frequency: Frequency; category: { id: string; name: string; code: string } }[];
  _count: { assignments: number };
}

export interface Concession {
  id: string;
  kind: 'discount' | 'scholarship' | 'relief';
  name: string;
  valueType: 'percentage' | 'fixed';
  value: string;
  categoryId: string | null;
  isActive: boolean;
  category: { id: string; name: string } | null;
  _count: { awards: number };
}

export interface Award {
  id: string;
  reason: string;
  status: 'active' | 'revoked';
  validFrom: string;
  validUntil: string;
  discount: { id: string; name: string; kind: Concession['kind']; valueType: Concession['valueType']; value: string; category: { name: string } | null };
  student: StudentRef;
  academicYear: { name: string };
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  periodLabel: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  discountTotal: string;
  total: string;
  amountPaid: string;
  status: InvoiceStatus;
  notes: string | null;
  studentId: string;
  student: StudentRef;
}

export interface InvoiceDetail extends Invoice {
  academicYear: { name: string };
  items: { id: string; description: string; amount: string; discount: string; net: string; category: { name: string; code: string } }[];
  allocations: { id: string; amount: string; payment: { id: string; paidAt: string; method: PaymentMethod; status: string; receipt: { receiptNo: string } | null } }[];
}

export interface Payment {
  id: string;
  amount: string;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
  status: 'completed' | 'voided';
  voidReason: string | null;
  notes: string | null;
  student: StudentRef;
  receipt: { receiptNo: string } | null;
  allocations: { amount: string; invoice: { invoiceNo: string; periodLabel: string } }[];
}

export interface FeesSummary {
  currency: string;
  outstanding: string;
  overdueInvoices: number;
  collectedThisMonth: string;
  byStatus: Partial<Record<InvoiceStatus, number>>;
}

export interface Statement {
  student: StudentRef;
  totals: { billed: string; paid: string; balance: string; overdue: number };
  invoices: (Invoice & { items: { description: string; net: string }[] })[];
  payments: (Omit<Payment, 'student' | 'allocations'>)[];
  awards: { id: string; discount: { name: string; kind: Concession['kind']; valueType: Concession['valueType']; value: string } }[];
}

export interface ReceiptView {
  school: string;
  currency: string;
  payment: Payment & {
    receipt: { receiptNo: string; issuedAt: string };
    student: StudentRef & { enrollments: { section: { name: string; schoolClass: { name: string } } }[] };
    allocations: { amount: string; invoice: { invoiceNo: string; periodLabel: string; total: string; amountPaid: string } }[];
  };
}
