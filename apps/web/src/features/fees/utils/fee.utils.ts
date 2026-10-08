import { type Concession, type Invoice, type StudentRef } from '@/features/fees/types/fee.types';

/** "2500.00" -> "2,500.00" (with the school currency when given). */
export function money(value: string | number, currency?: string): string {
  const n = typeof value === 'number' ? value : Number(value);
  const text = n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${text}` : text;
}

export const balanceOf = (i: Pick<Invoice, 'total' | 'amountPaid'>) => Number(i.total) - Number(i.amountPaid);

export const studentName = (s: Pick<StudentRef, 'firstName' | 'lastName'>) => `${s.firstName} ${s.lastName}`;

/** "10%" or "1,500.00": how much a concession takes off. */
export const concessionValue = (c: Pick<Concession, 'valueType' | 'value'>) => (c.valueType === 'percentage' ? `${Number(c.value)}%` : money(c.value));
