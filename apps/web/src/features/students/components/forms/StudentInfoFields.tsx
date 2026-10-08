import { Field, FormSection, Input, Select } from '@/components/ui';
import { BLOOD_GROUPS } from '@/features/students/constants';
import type { AddStudentForm } from '@/features/students/utils/student.utils';

type Props = { form: AddStudentForm; set: (patch: Partial<AddStudentForm>) => void };

/** "Student" section of the add-student form. */
export function StudentInfoFields({ form: f, set }: Props) {
  const text = (k: keyof AddStudentForm) => (e: { target: { value: string } }) => set({ [k]: e.target.value } as Partial<AddStudentForm>);
  return (
    <FormSection title="Student">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={text('firstName')} /></Field>
        <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={text('lastName')} /></Field>
        <Field label="Gender">
          <Select value={f.gender} onChange={text('gender')}>
            <option value="">Not specified</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Date of birth"><Input type="date" required max={f.admissionDate} value={f.dateOfBirth} onChange={text('dateOfBirth')} /></Field>
        <Field label="Admission date"><Input type="date" required value={f.admissionDate} onChange={text('admissionDate')} /></Field>
        <Field label="Admission no. (optional)" hint="Empty = auto (ADM-0001)"><Input pattern="[A-Za-z0-9-]{1,20}" value={f.admissionNo} onChange={text('admissionNo')} /></Field>
        <Field label="B-Form / national ID"><Input maxLength={40} value={f.nationalId} onChange={text('nationalId')} /></Field>
        <Field label="Blood group">
          <Select value={f.bloodGroup} onChange={text('bloodGroup')}>
            <option value="">Unknown</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </Select>
        </Field>
        <Field label="Allergies"><Input maxLength={1000} value={f.allergies} onChange={text('allergies')} placeholder="None" /></Field>
        <div className="sm:col-span-3"><Field label="Home address"><Input maxLength={500} value={f.address} onChange={text('address')} /></Field></div>
      </div>
    </FormSection>
  );
}
