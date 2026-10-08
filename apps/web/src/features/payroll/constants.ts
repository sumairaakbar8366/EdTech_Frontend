import type { Tone } from '@/components/ui';
import type { RunAction, RunStatus } from '@/features/payroll/types/payroll.types';

export const RUN_TONE: Record<RunStatus, Tone> = { draft: 'amber', reviewed: 'sky', approved: 'primary', paid: 'emerald', cancelled: 'slate' };
export const RUN_LABEL: Record<RunStatus, string> = { draft: 'Draft', reviewed: 'Awaiting approval', approved: 'Approved', paid: 'Paid', cancelled: 'Cancelled' };

/** The page-9 approval chain, in order. */
export const RUN_STEPS: { status: RunStatus; label: string }[] = [
  { status: 'draft', label: 'Calculated' },
  { status: 'reviewed', label: 'Accounts review' },
  { status: 'approved', label: 'Admin approval' },
  { status: 'paid', label: 'Paid & payslips' },
];

export const RUN_ACTION_SUCCESS: Record<RunAction, string> = {
  recalculate: 'Recalculated',
  submit: 'Sent for admin approval',
  approve: 'Payroll approved',
  return: 'Returned to accounts',
  cancel: 'Run cancelled',
  pay: 'Marked paid; payslips generated',
};
