import { KeyRound, Pencil, RefreshCcw } from 'lucide-react';
import { Badge, Button, StatusBadge } from '@/components/ui';
import { STATUS_LABEL, STATUS_TONE, TYPE_LABEL, TYPE_TONE } from '@/features/staff/constants';
import type { EmployeeDetail } from '@/features/staff/types/staff.types';
import { fullName } from '@/features/staff/utils/staff.utils';

export function StaffHeader({ employee: e, editable, onLogin, onStatus, onEdit }: { employee: EmployeeDetail; editable: boolean; onLogin: () => void; onStatus: () => void; onEdit: () => void }) {
  return (
    <div className="surface mb-6 flex flex-wrap items-center gap-5 rounded-xl p-5 animate-fade-up">
      <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl font-display text-2xl font-bold text-white ${e.staffType === 'teaching' ? 'bg-primary-800' : 'bg-slate-600'}`}>{e.firstName[0]}{e.lastName[0]}</span>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{fullName(e)}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-base text-slate-600 dark:text-slate-300">
          <span>{e.designation}</span>
          <span className="text-slate-300">•</span>
          <span className="tabular-nums">{e.employeeNo}</span>
          <StatusBadge status={e.staffType} tones={TYPE_TONE} labels={TYPE_LABEL} />
          <StatusBadge status={e.status} tones={STATUS_TONE} labels={STATUS_LABEL} />
          {e.user && <Badge tone="teal"><KeyRound size={12} /> Login</Badge>}
        </div>
      </div>
      {editable && (
        <div className="flex flex-wrap gap-2">
          {!e.user && (e.status === 'active' || e.status === 'on_leave') && <Button variant="secondary" icon={KeyRound} onClick={onLogin}>Create login</Button>}
          <Button variant="secondary" icon={RefreshCcw} onClick={onStatus}>Change status</Button>
          <Button icon={Pencil} onClick={onEdit}>Edit</Button>
        </div>
      )}
    </div>
  );
}
