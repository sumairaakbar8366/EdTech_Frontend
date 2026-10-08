import type { SchoolRoleKey } from '@schoolerp/shared';
import { useEffect, useState } from 'react';
import { Alert, Button, Modal } from '@/components/ui';
import { StaffRolePicker } from '@/features/users/components/GrantAccessModal';
import { usersService, useUsersAction, type SchoolLogin } from '@/features/users/users';
import { errorMessage } from '@/lib/errors';

/**
 * Change a login's roles. Staff can hold any staff roles; parent and student roles follow from the
 * linked record and stay as they are.
 */
export function EditRolesModal({ user, onClose }: { user: SchoolLogin | null; onClose: () => void }) {
  const [roles, setRoles] = useState<SchoolRoleKey[]>([]);
  const save = useUsersAction(usersService.setRoles, { success: 'Roles updated', onDone: onClose, toastErrors: false });
  const isStaff = !!user?.people.some((p) => p.type === 'staff');
  const fixed = (user?.roles ?? []).filter((r) => r.key === 'parent' || r.key === 'student').map((r) => r.key);

  useEffect(() => {
    if (!user) return;
    setRoles(user.roles.map((r) => r.key).filter((k) => k !== 'parent' && k !== 'student'));
    save.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;
  return (
    <Modal
      open
      title={`Roles · ${user.firstName} ${user.lastName}`}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={save.isPending} disabled={!isStaff || roles.length + fixed.length === 0} onClick={() => save.mutate({ id: user.id, roles: [...roles, ...fixed] })}>Save roles</Button>
        </>
      }
    >
      <div className="space-y-4">
        {save.error && <Alert>{errorMessage(save.error, 'Could not update the roles.')}</Alert>}
        {isStaff ? (
          <StaffRolePicker value={roles} onChange={setRoles} />
        ) : (
          <Alert tone="info">This login belongs to a {fixed.includes('parent') ? 'parent' : 'student'}; its role comes from that record and cannot be changed here.</Alert>
        )}
        {isStaff && fixed.length > 0 && <p className="text-sm text-slate-500">Also keeps: {fixed.join(', ')} (from the linked record).</p>}
      </div>
    </Modal>
  );
}
