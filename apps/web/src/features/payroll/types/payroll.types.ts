export type RunStatus = 'draft' | 'reviewed' | 'approved' | 'paid' | 'cancelled';

export interface EmployeeRef {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  designation: string;
  staffType: 'teaching' | 'non_teaching';
  userId: string | null;
  photoKey?: string | null;
}

export interface SalaryComponent {
  id?: string;
  kind: 'earning' | 'deduction';
  name: string;
  calc: 'fixed' | 'percent_of_basic';
  value: string;
}

export interface SalaryStructure {
  id: string;
  basicSalary: string;
  effectiveFrom: string;
  isActive: boolean;
  components: SalaryComponent[];
}

export interface StaffSalary extends EmployeeRef {
  joinDate: string;
  structure: SalaryStructure | null;
}

export interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Run {
  id: string;
  status: RunStatus;
  applyAttendance: boolean;
  workingDays: number;
  totalGross: string;
  totalDeductions: string;
  totalNet: string;
  calculatedAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  notes: string | null;
  period: Period;
  _count?: { items: number };
}

export interface Deduction {
  id: string;
  type: 'attendance' | 'leave' | 'component' | 'manual';
  label: string;
  amount: string;
}

export interface PayItem {
  id: string;
  employeeId: string;
  basic: string;
  allowances: string;
  bonus: string;
  gross: string;
  attendanceDeduction: string;
  leaveDeduction: string;
  otherDeductions: string;
  totalDeductions: string;
  net: string;
  workingDays: number;
  payableDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  earnings: { name: string; amount: string }[];
  note: string | null;
  employee: EmployeeRef;
  deductions: Deduction[];
  payslip: { payslipNo: string; generatedAt: string } | null;
  payment: { method: string; reference: string | null; paidAt: string; payeeAccount?: string | null } | null;
}

export interface RunDetail extends Run {
  items: PayItem[];
}

export interface PayslipView {
  school: string;
  currency: string;
  item: Omit<PayItem, 'employee'> & {
    employee: EmployeeRef & { department: string | null; joinDate: string };
    run: { status: RunStatus; period: Period };
  };
}

export interface MyPayslip {
  id: string;
  gross: string;
  totalDeductions: string;
  net: string;
  payslip: { payslipNo: string } | null;
  run: { period: Period; paidAt: string | null };
}


export interface PayrollSummary {
  staff: number;
  withStructure: number;
  pendingRuns: number;
  lastPaid: Run | null;
}

export type RunAction = 'recalculate' | 'submit' | 'approve' | 'return' | 'cancel' | 'pay';
