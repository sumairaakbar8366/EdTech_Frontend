import type { EmployeeRef, StaffSalary } from '@/features/payroll/types/payroll.types';

export const employeeName = (e: Pick<EmployeeRef, 'firstName' | 'lastName'>) => `${e.firstName} ${e.lastName}`;

/** Name and first/last day of the month `offset` months from now (UTC dates). */
export function monthRange(offset = 0) {
  const now = new Date();
  const first = new Date(Date.UTC(now.getFullYear(), now.getMonth() + offset, 1));
  const last = new Date(Date.UTC(now.getFullYear(), now.getMonth() + offset + 1, 0));
  return {
    name: first.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    startDate: first.toISOString().slice(0, 10),
    endDate: last.toISOString().slice(0, 10),
  };
}

/** Monthly gross of a salary structure: basic plus every allowance; null when no structure is set. */
export function monthlyGross(s: StaffSalary): number | null {
  if (!s.structure) return null;
  const basic = Number(s.structure.basicSalary);
  return s.structure.components.filter((c) => c.kind === 'earning').reduce((t, c) => t + (c.calc === 'fixed' ? Number(c.value) : (basic * Number(c.value)) / 100), basic);
}
