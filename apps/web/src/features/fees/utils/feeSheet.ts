import type { ImportSpec } from '@/components/shared/ImportDialog';
import { FEES_KEY } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import type { FeeCategory, Invoice, Payment, PaymentMethod } from '@/features/fees/types/fee.types';
import { studentService } from '@/features/students/services/studentService';
import { parseChoice, parseNumber, parseYesNo } from '@/lib/importParsers';
import type { ExportColumn } from '@/lib/spreadsheet';

const num = (s: string) => Number(s);

export const INVOICE_EXPORT: ExportColumn<Invoice>[] = [
  { header: 'Invoice no.', value: (i) => i.invoiceNo },
  { header: 'Admission no.', value: (i) => i.student.admissionNo },
  { header: 'Student', value: (i) => `${i.student.firstName} ${i.student.lastName}` },
  { header: 'Period', value: (i) => i.periodLabel },
  { header: 'Issue date', value: (i) => new Date(i.issueDate) },
  { header: 'Due date', value: (i) => new Date(i.dueDate) },
  { header: 'Subtotal', value: (i) => num(i.subtotal) },
  { header: 'Discount', value: (i) => num(i.discountTotal) },
  { header: 'Total', value: (i) => num(i.total) },
  { header: 'Paid', value: (i) => num(i.amountPaid) },
  { header: 'Balance', value: (i) => num(i.total) - num(i.amountPaid) },
  { header: 'Status', value: (i) => i.status },
];

export const PAYMENT_EXPORT: ExportColumn<Payment>[] = [
  { header: 'Receipt no.', value: (p) => p.receipt?.receiptNo ?? '' },
  { header: 'Paid at', value: (p) => new Date(p.paidAt) },
  { header: 'Admission no.', value: (p) => p.student.admissionNo },
  { header: 'Student', value: (p) => `${p.student.firstName} ${p.student.lastName}` },
  { header: 'Amount', value: (p) => num(p.amount) },
  { header: 'Method', value: (p) => p.method.replace('_', ' ') },
  { header: 'Reference', value: (p) => p.reference ?? '' },
  { header: 'Invoices', value: (p) => p.allocations.map((a) => `${a.invoice.invoiceNo} (${a.invoice.periodLabel})`).join('; '), width: 36 },
  { header: 'Status', value: (p) => p.status },
  { header: 'Notes', value: (p) => p.notes ?? '' },
];

export const CATEGORY_EXPORT: ExportColumn<FeeCategory>[] = [
  { header: 'Code', value: (c) => c.code },
  { header: 'Name', value: (c) => c.name },
  { header: 'Active', value: (c) => (c.isActive ? 'Yes' : 'No') },
];

export const CATEGORY_IMPORT: ImportSpec<{ name: string; code: string; isActive: boolean }> = {
  title: 'Import fee categories',
  name: 'Fee categories',
  columns: [
    { key: 'name', header: 'Name', required: true, example: 'Transport Fee' },
    { key: 'code', header: 'Code', required: true, hint: 'Letters, digits, hyphens (max 15)', example: 'TRANSPORT' },
    { key: 'active', header: 'Active', hint: 'Yes / No (empty = Yes)', example: 'Yes' },
  ],
  toPayload: (r) => {
    const code = r.code!.toUpperCase().replace(/\s+/g, '-');
    if (!/^[A-Z0-9-]{1,15}$/.test(code)) return `Code "${r.code}" must be up to 15 letters, digits or hyphens`;
    const isActive = parseYesNo(r.active ?? '', true);
    if (isActive === null) return `Active "${r.active}" should be Yes or No`;
    return { name: r.name!, code, isActive };
  },
  create: (p) => feeService.saveCategory(undefined, p),
  invalidate: [FEES_KEY],
};

const METHODS: Record<PaymentMethod, string[]> = { cash: [], bank_transfer: ['bank', 'transfer', 'ibft'], card: ['debit card', 'credit card'], cheque: ['check', 'chq'], online: ['jazzcash', 'easypaisa', 'raast'] };

/**
 * Payments import (e.g. from a bank statement). Each payment is applied to the student's oldest
 * open invoices first, exactly like "Record payment".
 */
export const PAYMENT_IMPORT: ImportSpec<{ admissionNo: string; amount: string; method: PaymentMethod; reference: string | null; notes: string | null }> = {
  title: 'Import fee payments',
  name: 'Fee payments',
  notes: ['Each payment is applied to the student’s oldest unpaid invoices first, and a receipt is issued, exactly like “Record payment”. Payments are dated today.'],
  columns: [
    { key: 'admissionNo', header: 'Admission no.', required: true, example: 'ADM-0002' },
    { key: 'amount', header: 'Amount', required: true, hint: 'Number, e.g. 4500', example: '4500' },
    { key: 'method', header: 'Method', hint: 'Cash / Bank transfer / Card / Cheque / Online (empty = Cash)', example: 'Bank transfer' },
    { key: 'reference', header: 'Reference', hint: 'Transaction or cheque no.', example: 'TXN-123456' },
    { key: 'notes', header: 'Notes', example: '' },
  ],
  toPayload: (r) => {
    const amount = parseNumber(r.amount!);
    if (amount === null || amount <= 0) return `Amount "${r.amount}" should be a positive number`;
    const method = r.method ? parseChoice(r.method, METHODS) : 'cash';
    if (!method) return `Method "${r.method}" is not allowed`;
    return { admissionNo: r.admissionNo!.toUpperCase(), amount: amount.toFixed(2), method, reference: r.reference?.trim() || null, notes: r.notes?.trim() || null };
  },
  create: async ({ admissionNo, ...p }) => {
    const hit = (await studentService.list({ page: 1, pageSize: 5, q: admissionNo })).items.find((s) => s.admissionNo === admissionNo);
    if (!hit) throw new Error(`No student with admission no. ${admissionNo}`);
    return feeService.recordPayment({ studentId: hit.id, ...p });
  },
  invalidate: [FEES_KEY],
};
