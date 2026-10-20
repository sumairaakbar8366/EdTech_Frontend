import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ReplaceAdminModal } from '@/features/staff/components/ReplaceAdminModal';
import { useSchoolUser } from '@/features/auth/usePermissions';
import { ArrowRight, Landmark } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import { Avatar, Badge, Button, Card, EmptyState, Spinner, StatusBadge } from '@/components/ui';
import { STATUS_LABEL, STATUS_TONE } from '@/features/staff/constants';
import type { EmployeeStatus } from '@/features/staff/types/staff.types';
import { api } from '@/services/api/http';
import { formatDate } from '@/lib/format';

interface Leader {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string | null;
  designation: string;
  status: EmployeeStatus;
  joinDate: string;
  photoKey: string | null;
  loginId: string | null;
  loginStatus: 'active' | 'disabled' | 'invited' | null;
  roles: string[];
  left: { toStatus: string; reason: string | null; changedAt: string } | null;
}

/**
 * Every administrator and principal as staff, current and former, for the principal: open a record
 * to handle their leave, salary and, when they leave, their clearance (status "Resigned").
 */
export function AdministrationCard({ className = '' }: { className?: string }) {
  const list = useQuery({ queryKey: ['staff', 'administration'], queryFn: () => api<Leader[]>('/staff/administration') });
  const me = useSchoolUser();
  const [replacing, setReplacing] = useState<Leader | null>(null);
  const canReplace = me.roles.some((r) => r.key === 'principal' || r.key === 'school_admin');
  const current = list.data?.filter((l) => !l.left) ?? [];
  const former = list.data?.filter((l) => l.left) ?? [];
  const row = (l: Leader) => (
    <li key={l.id} className="flex items-center">
      <AreaLink to={`/staff/${l.id}`} className="flex min-w-0 flex-1 flex-wrap items-center gap-3 px-5 py-3 transition hover:bg-slate-500/5">
        <Avatar photoKey={l.photoKey} name={`${l.firstName} ${l.lastName}`} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
            {l.firstName} {l.lastName}
            {l.roles.map((r) => <Badge key={r} tone={r === 'Principal' ? 'amber' : 'primary'}>{r}</Badge>)}
          </div>
          <div className="text-sm text-slate-500">
            {l.designation} · {l.employeeNo}{l.loginId ? ` · ${l.loginId}` : ''} · joined {formatDate(l.joinDate)}
            {l.left && <> · left {formatDate(l.left.changedAt)}{l.left.reason ? ` (${l.left.reason})` : ''}</>}
          </div>
        </div>
        <StatusBadge status={l.status} tones={STATUS_TONE} labels={STATUS_LABEL} />
        {l.loginStatus === 'disabled' && !l.left && <Badge tone="rose">Access suspended</Badge>}
        <ArrowRight size={15} className="text-slate-400" />
      </AreaLink>
      {canReplace && !l.left && l.loginStatus === 'active' && l.roles.includes('School Admin') && l.loginId !== me.user.loginId && (
        <span className="pr-4"><Button variant="secondary" onClick={() => setReplacing(l)}>Replace</Button></span>
      )}
    </li>
  );
  return (
    <Card title="Administration" icon={Landmark} padded={false} className={className}>
      {list.isLoading && <div className="p-6"><Spinner /></div>}
      {list.data?.length === 0 && <EmptyState icon={Landmark} title="No administrators recorded yet" />}
      {current.length > 0 && <ul className="divide-y divide-(--surface-border)">{current.map(row)}</ul>}
      {former.length > 0 && (
        <>
          <div className="border-t border-(--surface-border) bg-slate-500/5 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Former administrators</div>
          <ul className="divide-y divide-(--surface-border) opacity-80">{former.map(row)}</ul>
        </>
      )}
      <ReplaceAdminModal open={!!replacing} admin={replacing} onClose={() => setReplacing(null)} />
      <p className="border-t border-(--surface-border) px-5 py-2.5 text-xs text-slate-500">Open a record to approve leave, set the salary, or, when someone leaves, change the status to Resigned for their clearance (their login is closed, the record stays here).</p>
    </Card>
  );
}
