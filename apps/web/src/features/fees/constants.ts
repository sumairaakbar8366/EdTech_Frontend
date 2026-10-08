import { type Frequency, type InvoiceStatus, type PaymentMethod } from '@/features/fees/types/fee.types';
import { type Tone } from '@/components/ui';

export const FREQUENCY_LABEL: Record<Frequency, string> = { one_time: 'One-time', monthly: 'Monthly', termly: 'Termly', annual: 'Annual' };

export const METHOD_LABEL: Record<PaymentMethod, string> = { cash: 'Cash', bank_transfer: 'Bank transfer', card: 'Card', cheque: 'Cheque', online: 'Online' };

export const INVOICE_TONE: Record<InvoiceStatus, Tone> = { pending: 'amber', partial: 'sky', paid: 'emerald', overdue: 'rose', waived: 'slate', cancelled: 'slate' };

export const CONCESSION_KIND_TONE = { discount: 'teal', scholarship: 'magenta', relief: 'sky' } as const;
