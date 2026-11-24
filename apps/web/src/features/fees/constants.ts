import { type Frequency, type InvoiceStatus, type PaymentMethod } from '@/features/fees/types/fee.types';
import { type Tone } from '@/components/ui';

export const FREQUENCY_LABEL: Record<Frequency, string> = { one_time: 'One-time', monthly: 'Monthly', termly: 'Termly', annual: 'Annual' };
/** What each kind of charge is called, and when it is paid (shown to admins and on the school's website). */
export const FREQUENCY_CHARGE: Record<Frequency, { title: string; when: string; option: string }> = {
  one_time: { title: 'Admission charges', when: 'paid once, at admission', option: 'One-time charge (at admission)' },
  monthly: { title: 'Monthly charges', when: 'paid every month', option: 'Monthly charge (every month)' },
  termly: { title: 'Term charges', when: 'paid every term', option: 'Term charge (every term)' },
  annual: { title: 'Annual charges', when: 'paid once a year', option: 'Annual charge (once a year)' },
};

export const METHOD_LABEL: Record<PaymentMethod, string> = { cash: 'Cash', bank_transfer: 'Bank transfer', card: 'Card', cheque: 'Cheque', online: 'Online' };

export const INVOICE_TONE: Record<InvoiceStatus, Tone> = { pending: 'amber', partial: 'sky', paid: 'emerald', overdue: 'rose', waived: 'slate', cancelled: 'slate' };

export const CONCESSION_KIND_TONE = { discount: 'teal', scholarship: 'magenta', relief: 'sky' } as const;
