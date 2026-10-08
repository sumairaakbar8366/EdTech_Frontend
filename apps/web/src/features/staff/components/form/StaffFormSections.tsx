import { Field, FormSection, Input, Select } from '@/components/ui';
import { useActiveCampuses } from '@/features/campuses/hooks/useCampuses';
import { RolePicker } from '@/features/staff/components/RolePicker';
import { defaultRoleFor } from '@/features/staff/constants';
import type { EmploymentType, StaffType } from '@/features/staff/types/staff.types';
import type { StaffForm } from '@/features/staff/utils/staff.utils';
import { BLOOD_GROUPS } from '@/features/students/constants';

type Props = { form: StaffForm; set: (patch: Partial<StaffForm>) => void };
const text = (set: Props['set'], k: keyof StaffForm) => (e: { target: { value: string } }) => set({ [k]: e.target.value } as Partial<StaffForm>);

export function PersonalSection({ form: f, set }: Props) {
  return (
    <FormSection title="Personal details">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={text(set, 'firstName')} /></Field>
        <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={text(set, 'lastName')} /></Field>
        <Field label={f.createLogin ? 'Email (used to sign in)' : 'Email'}><Input type="email" required={f.createLogin} maxLength={254} value={f.email} onChange={text(set, 'email')} /></Field>
        <Field label="Phone"><Input type="tel" maxLength={32} value={f.phone} onChange={text(set, 'phone')} /></Field>
        <Field label="Gender">
          <Select value={f.gender} onChange={(e) => set({ gender: e.target.value as StaffForm['gender'] })}>
            <option value="">Not specified</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Date of birth"><Input type="date" max={f.joinDate} value={f.dateOfBirth} onChange={text(set, 'dateOfBirth')} /></Field>
      </div>
    </FormSection>
  );
}

export function EmploymentSection({ form: f, set, editing }: Props & { editing: boolean }) {
  const campuses = useActiveCampuses();
  return (
    <FormSection title="Employment">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Staff type">
          <Select value={f.staffType} onChange={(e) => set({ staffType: e.target.value as StaffType, roles: [defaultRoleFor(e.target.value as StaffType)] })}>
            <option value="teaching">Teaching</option><option value="non_teaching">Non-teaching</option>
          </Select>
        </Field>
        <Field label="Designation" hint="e.g. Senior Teacher, Accountant"><Input required maxLength={100} value={f.designation} onChange={text(set, 'designation')} /></Field>
        <Field label="Department"><Input maxLength={100} value={f.department} onChange={text(set, 'department')} /></Field>
        <Field label="Employment type">
          <Select value={f.employmentType} onChange={(e) => set({ employmentType: e.target.value as EmploymentType })}>
            <option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option>
          </Select>
        </Field>
        <Field label="Campus">
          <Select required value={f.campusId} onChange={text(set, 'campusId')}>
            <option value="" disabled>Select…</option>
            {campuses.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Joining date"><Input type="date" required value={f.joinDate} onChange={text(set, 'joinDate')} /></Field>
        {!editing && (
          <Field label="Employee no. (optional)" hint="Leave empty to auto-number (EMP-0001)"><Input pattern="[A-Za-z0-9-]{1,20}" value={f.employeeNo} onChange={text(set, 'employeeNo')} /></Field>
        )}
        {f.staffType === 'teaching' && (
          <Field label="Specialization" hint="e.g. Physics, Early years"><Input maxLength={120} value={f.specialization} onChange={text(set, 'specialization')} /></Field>
        )}
      </div>
    </FormSection>
  );
}

export function ProfileSection({ form: f, set }: Props) {
  return (
    <FormSection title="Profile & emergency contact">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Field label="Address"><Input maxLength={500} value={f.address} onChange={text(set, 'address')} /></Field></div>
        <Field label="National ID / CNIC"><Input maxLength={40} value={f.nationalId} onChange={text(set, 'nationalId')} /></Field>
        <Field label="Emergency contact"><Input maxLength={120} value={f.emergencyContactName} onChange={text(set, 'emergencyContactName')} /></Field>
        <Field label="Emergency phone"><Input type="tel" maxLength={32} value={f.emergencyContactPhone} onChange={text(set, 'emergencyContactPhone')} /></Field>
        <Field label="Blood group">
          <Select value={f.bloodGroup} onChange={text(set, 'bloodGroup')}>
            <option value="">Unknown</option>{BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
        </Field>
      </div>
    </FormSection>
  );
}

export function AccessSection({ form: f, set }: Props) {
  return (
    <FormSection title="System access">
      <label className="flex items-center gap-2 text-base text-slate-700 dark:text-slate-200">
        <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={f.createLogin} onChange={(e) => set({ createLogin: e.target.checked })} />
        Create a login for this staff member
      </label>
      {f.createLogin && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Roles</span>
            <RolePicker value={f.roles} onChange={(roles) => set({ roles })} />
          </div>
          <p className="text-sm text-slate-500 sm:pt-6">The login gets a school email by role (e.g. name.teacher@…) and a temporary password, shown once after saving. The personal email above stays as their contact.</p>
        </div>
      )}
    </FormSection>
  );
}
