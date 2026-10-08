import type { AreaRoutes } from '@/app/router/types';
import { AccountsDashboard } from '@/features/dashboards/pages/AccountsDashboard';
import { FinancePage } from '@/features/fees/pages/FinancePage';
import { PayrollPage } from '@/features/payroll/pages/PayrollPage';
import { RunDetailPage } from '@/features/payroll/pages/RunDetailPage';
import { NotificationsPage } from '@/features/communication/pages/NotificationsPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';

/** Accounts (board page 4): each finance menu entry opens the fees workspace on its tab. */
export const accountsRoutes: AreaRoutes = (can) => {
  const edit = can('fees.create');
  return [
    { path: '', element: <AccountsDashboard /> },
    { path: 'fee-structures', capability: 'fees.view', element: <FinancePage key="fee-structures" canEdit={edit} initialTab="structures" title="Fee structures" sub="What each class pays: tuition, exam and annual charges" /> },
    { path: 'student-invoices', capability: 'fees.view', element: <FinancePage key="student-invoices" canEdit={edit} initialTab="invoices" title="Student invoices" sub="Generate monthly invoices and follow each one" /> },
    { path: 'payments', capability: 'fees.view', element: <FinancePage key="payments" canEdit={edit} initialTab="payments" title="Payments" sub="Record fee payments and print receipts" /> },
    { path: 'pending-fees', capability: 'fees.view', element: <FinancePage key="pending-fees" canEdit={edit} initialTab="invoices" invoiceStatus="pending" title="Pending fees" sub="Invoices issued and not yet due" /> },
    { path: 'overdue-fees', capability: 'fees.view', element: <FinancePage key="overdue-fees" canEdit={edit} initialTab="invoices" invoiceStatus="overdue" title="Overdue fees" sub="Families past the due date: follow up" /> },
    { path: 'discounts', capability: 'fees.view', element: <FinancePage key="discounts" canEdit={edit} initialTab="concessions" concessionFocus="discounts" title="Discounts" sub="Sibling, staff-child and other discounts" /> },
    { path: 'scholarships', capability: 'fees.view', element: <FinancePage key="scholarships" canEdit={edit} initialTab="concessions" concessionFocus="scholarships" title="Scholarships" sub="Merit scholarships and hardship relief" /> },
    { path: 'staff-payroll', capability: 'payroll.view', element: <PayrollPage key="staff-payroll" canEdit={can('payroll.process')} initialTab="structures" /> },
    { path: 'salary-processing', capability: 'payroll.view', element: <PayrollPage key="salary-processing" canEdit={can('payroll.process')} /> },
    { path: 'payslips', capability: 'payroll.view', element: <PayrollPage key="payslips" canEdit={can('payroll.process')} initialTab="payslips" /> },
    { path: 'payroll', capability: 'payroll.view', element: <PayrollPage key="payroll" canEdit={can('payroll.process')} /> },
    { path: 'payroll/runs/:id', capability: 'payroll.view', element: <RunDetailPage canEdit={can('payroll.process')} canApprove={can('payroll.approve')} /> },
    { path: 'notifications', capability: 'communication.any', element: <NotificationsPage /> },
    { path: 'financial-reports', capability: 'reports.finance', element: <ReportsPage financeOnly /> },
];
};
