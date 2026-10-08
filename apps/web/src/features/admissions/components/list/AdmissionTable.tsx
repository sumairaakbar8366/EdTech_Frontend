import { DataTable, StatusBadge, type Column } from '@/components/ui';
import { ADMISSION_LABEL, ADMISSION_TONE } from '@/features/admissions/constants';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';
import { formatDate } from '@/lib/format';

const COLUMNS: Column<AdmissionApplication>[] = [
  { header: 'Application', cell: (a) => a.applicationNo, className: 'tabular-nums font-semibold text-slate-700 dark:text-slate-200' },
  { header: 'Applicant', cell: (a) => `${a.firstName} ${a.lastName}`, className: 'font-semibold text-slate-800 dark:text-slate-100' },
  { header: 'Class', cell: (a) => <>{a.schoolClass.name} · {a.campus.code}<div className="text-sm text-slate-500">{a.academicYear.name}</div></>, className: 'text-slate-600 dark:text-slate-300' },
  { header: 'Parent', cell: (a) => <>{a.guardianFirstName} {a.guardianLastName}<div className="text-sm text-slate-500">{a.guardianPhone}</div></>, className: 'text-slate-600 dark:text-slate-300' },
  { header: 'Received', cell: (a) => formatDate(a.createdAt), className: 'text-slate-600 dark:text-slate-300' },
  { header: 'Status', cell: (a) => <StatusBadge status={a.status} tones={ADMISSION_TONE} labels={ADMISSION_LABEL} /> },
];

export function AdmissionTable({ applications, onOpen }: { applications: AdmissionApplication[]; onOpen: (a: AdmissionApplication) => void }) {
  return <DataTable columns={COLUMNS} rows={applications} rowKey={(a) => a.id} onRowClick={onOpen} />;
}
