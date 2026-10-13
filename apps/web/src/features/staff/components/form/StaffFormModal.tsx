import { useEffect, useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { useActiveCampuses } from '@/features/campuses/hooks/useCampuses';
import { AccessSection, EmploymentSection, PersonalSection, ProfileSection } from '@/features/staff/components/form/StaffFormSections';
import { roleLabel } from '@/features/staff/constants';
import { useStaffAction } from '@/features/staff/hooks/useStaff';
import { staffService } from '@/features/staff/services/staffService';
import type { EmployeeDetail } from '@/features/staff/types/staff.types';
import { toStaffForm, toStaffPayload, type StaffForm } from '@/features/staff/utils/staff.utils';
import { CredentialsModal } from '@/features/users/components/CredentialsModal';
import { handover, type ApiCredentials, type LoginHandover } from '@/features/users/users';
import { onSubmit } from '@/lib/forms';

/** Add a staff member, or edit one (`employee` given). */
export function StaffFormModal({ open, employee, onClose }: { open: boolean; employee?: EmployeeDetail; onClose: () => void }) {
  const editing = !!employee;
  const [form, setForm] = useState<StaffForm>(() => toStaffForm(employee));
  const campuses = useActiveCampuses();
  useEffect(() => {
    if (open) setForm(toStaffForm(employee));
  }, [open, employee]);
  useEffect(() => {
    if (!form.campusId && campuses.data?.[0]) setForm((s) => ({ ...s, campusId: campuses.data![0]!.id }));
  }, [campuses.data, form.campusId]);
  const set = (patch: Partial<StaffForm>) => setForm((s) => ({ ...s, ...patch }));
  const [login, setLogin] = useState<LoginHandover | null>(null);

  const save = useStaffAction(
    () => {
      const body = toStaffPayload(form);
      if (editing) return staffService.update(employee!.id, body);
      return staffService.create({
        ...body,
        ...(form.employeeNo.trim() && { employeeNo: form.employeeNo.trim() }),
        ...(form.createLogin && { login: { roles: form.roles } }),
      });
    },
    editing ? 'Staff record updated' : 'Staff member added',
    (r) => {
      const c = (r as { credentials?: ApiCredentials | null }).credentials;
      if (c) setLogin(handover(form.firstName, form.lastName, form.roles.map(roleLabel).join(', '), c));
      onClose();
    },
  );
  if (login) return <CredentialsModal credentials={login} title="Staff member added · login details" onClose={() => setLogin(null)} />;

  return (
    <Modal
      open={open}
      size="xl"
      title={editing ? `Edit ${employee!.firstName} ${employee!.lastName}` : 'Add staff member'}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="staff-form" loading={save.isPending}>{editing ? 'Save changes' : 'Add staff'}</Button></>}
    >
      <form id="staff-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-6">
        <PersonalSection form={form} set={set} />
        <EmploymentSection form={form} set={set} editing={editing} />
        <ProfileSection form={form} set={set} />
        {!editing && <AccessSection form={form} set={set} />}
      </form>
    </Modal>
  );
}
