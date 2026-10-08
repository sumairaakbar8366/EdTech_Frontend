import { KeyRound } from 'lucide-react';
import { DataTable, StatusBadge, type Column } from '@/components/ui';
import { STATUS_LABEL, STATUS_TONE, TYPE_LABEL, TYPE_TONE } from '@/features/staff/constants';
import type { EmployeeListItem } from '@/features/staff/types/staff.types';
import { fullName } from '@/features/staff/utils/staff.utils';

const COLUMNS: Column<EmployeeListItem>[] = [
  {
    header: 'Staff member',
    cell: (e) => (
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${e.staffType === 'teaching' ? 'bg-primary-800' : 'bg-slate-600'}`}>{e.firstName[0]}{e.lastName[0]}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
            {fullName(e)}
            {e.userId && <KeyRound size={13} className="text-primary-500" aria-label="Has login" />}
          </div>
          <div className="truncate text-sm text-slate-500 dark:text-slate-400">{e.email ?? e.phone ?? '—'}</div>
        </div>
      </div>
    ),
  },
  { header: 'Emp. no.', cell: (e) => e.employeeNo, className: 'tabular-nums text-slate-600 dark:text-slate-300' },
  { header: 'Type', cell: (e) => <StatusBadge status={e.staffType} tones={TYPE_TONE} labels={TYPE_LABEL} /> },
  { header: 'Designation', cell: (e) => <>{e.designation}{e.department && <div className="text-sm text-slate-500 dark:text-slate-400">{e.department}</div>}</>, className: 'text-slate-700 dark:text-slate-200' },
  { header: 'Campus', cell: (e) => e.campus.name, className: 'text-slate-600 dark:text-slate-300' },
  { header: 'Status', cell: (e) => <StatusBadge status={e.status} tones={STATUS_TONE} labels={STATUS_LABEL} /> },
];

export function StaffTable({ staff, onOpen }: { staff: EmployeeListItem[]; onOpen: (e: EmployeeListItem) => void }) {
  return <DataTable columns={COLUMNS} rows={staff} rowKey={(e) => e.id} onRowClick={onOpen} />;
}
