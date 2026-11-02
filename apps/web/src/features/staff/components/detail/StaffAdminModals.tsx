import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, Modal, Select } from '@/components/ui';
import { RolePicker } from '@/features/staff/components/RolePicker';
import { STATUS_LABEL, defaultRoleFor, roleLabel } from '@/features/staff/constants';
import { useStaffAction } from '@/features/staff/hooks/useStaff';
import { staffService } from '@/features/staff/services/staffService';
import type { EmployeeDetail, EmployeeStatus } from '@/features/staff/types/staff.types';
import { CredentialsModal } from '@/features/users/components/CredentialsModal';
import { handover, type LoginHandover } from '@/features/users/users';
import { onSubmit } from '@/lib/forms';

type Props = { open: boolean; employee: EmployeeDetail; onClose: () => void };

/** Change employment status (recorded in history; leaving disables the login). */
export function StaffStatusModal({ open, employee, onClose, onReplaceAdmin }: Props & { onReplaceAdmin?: () => void }) {
  const options = (Object.keys(STATUS_LABEL) as EmployeeStatus[]).filter((s) => s !== employee.status);
  const [status, setStatus] = useState<EmployeeStatus>(options[0]!);
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (open) {
      setStatus(options[0]!);
      setReason('');
    }
    // Reset each time the dialog opens; `options` follows the current status.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee.status]);
  const save = useStaffAction(() => staffService.setStatus(employee.id, status, reason || null), 'Status updated', onClose);
  const leaving = status === 'resigned' || status === 'terminated';
  const isAdmin = !!employee.user?.userRoles.some((r) => r.role.key === 'school_admin');
  return (
    <Modal open={open} title="Change employment status" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={leaving ? 'danger' : 'primary'} loading={save.isPending} onClick={() => save.mutate(undefined)}>Confirm</Button></>}>
      <div className="space-y-4">
        <Field label="New status"><Select value={status} onChange={(ev) => setStatus(ev.target.value as EmployeeStatus)}>{options.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</Select></Field>
        <Field label="Reason (recorded in history)"><Input maxLength={500} value={reason} onChange={(ev) => setReason(ev.target.value)} /></Field>
        {leaving && employee.user && <Alert tone="info">Their login will be disabled. It is re-enabled automatically if they return.</Alert>}
        {leaving && isAdmin && (
          <Alert tone="info">
            {employee.firstName} is a School Admin. Use <strong>Replace admin</strong> so a new admin is made first and the school is never without one.
            {onReplaceAdmin && <span className="mt-2 block"><Button onClick={() => { onClose(); onReplaceAdmin(); }}>Replace admin</Button></span>}
          </Alert>
        )}
      </div>
    </Modal>
  );
}

/** Give an existing staff member a login: a User ID and a temporary password, shown once. */
export function StaffLoginModal({ open, employee, onClose }: Props) {
  const [roles, setRoles] = useState<string[]>([defaultRoleFor(employee.staffType)]);
  const [login, setLogin] = useState<LoginHandover | null>(null);
  const save = useStaffAction(() => staffService.createLogin(employee.id, roles), 'Login created', (r) => setLogin(handover(employee.firstName, employee.lastName, roles.map(roleLabel).join(', '), r.credentials)));
  if (login) return <CredentialsModal credentials={login} title="Login created" onClose={() => { setLogin(null); onClose(); }} />;
  return (
    <Modal open={open} title="Create login" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="login-form" loading={save.isPending}>Create login</Button></>}>
      <form id="login-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-4">
        <p className="text-base text-slate-600 dark:text-slate-300">A User ID (e.g. TCH-{employee.joinDate.slice(0, 4)}-0007) and a temporary password are generated and shown once.{employee.email ? ` The User ID is also emailed to ${employee.email}.` : ''}</p>
        <RolePicker value={roles} onChange={setRoles} />
      </form>
    </Modal>
  );
}
