import { useEffect, useState } from 'react';
import { Button, Field, FormSection, Input, Modal, Select } from '@/components/ui';
import { BLOOD_GROUPS } from '@/features/students/constants';
import { useStudentsAction } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import type { StudentDetail } from '@/features/students/types/student.types';
import { toEditForm, toUpdatePayload, type EditStudentForm } from '@/features/students/utils/student.utils';
import { onSubmit } from '@/lib/forms';

export function EditStudentModal({ open, student, onClose }: { open: boolean; student: StudentDetail; onClose: () => void }) {
  const [f, setF] = useState<EditStudentForm>(() => toEditForm(student));
  useEffect(() => {
    if (open) setF(toEditForm(student));
  }, [open, student]);
  const text = (k: keyof EditStudentForm) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = useStudentsAction(() => studentService.update(student.id, toUpdatePayload(f)), 'Student updated', onClose);
  return (
    <Modal
      open={open}
      size="xl"
      title={`Edit ${student.firstName} ${student.lastName}`}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="edit-student" loading={save.isPending}>Save changes</Button></>}
    >
      <form id="edit-student" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-6">
        <FormSection title="Student">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={text('firstName')} /></Field>
            <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={text('lastName')} /></Field>
            <Field label="Gender"><Select value={f.gender} onChange={text('gender')}><option value="">Not specified</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></Select></Field>
            <Field label="Date of birth"><Input type="date" required value={f.dateOfBirth} onChange={text('dateOfBirth')} /></Field>
            <Field label="Admission date"><Input type="date" required value={f.admissionDate} onChange={text('admissionDate')} /></Field>
            <Field label="B-Form / national ID"><Input maxLength={40} value={f.nationalId} onChange={text('nationalId')} /></Field>
            <Field label="Religion"><Input maxLength={60} value={f.religion} onChange={text('religion')} /></Field>
            <Field label="Nationality"><Input maxLength={60} value={f.nationality} onChange={text('nationality')} /></Field>
            <Field label="Blood group"><Select value={f.bloodGroup} onChange={text('bloodGroup')}><option value="">Unknown</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</Select></Field>
            <div className="sm:col-span-3"><Field label="Home address"><Input maxLength={500} value={f.address} onChange={text('address')} /></Field></div>
          </div>
        </FormSection>
        <FormSection title="Medical">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Allergies"><Input maxLength={1000} value={f.allergies} onChange={text('allergies')} /></Field>
            <Field label="Conditions"><Input maxLength={1000} value={f.conditions} onChange={text('conditions')} /></Field>
            <Field label="Medications"><Input maxLength={1000} value={f.medications} onChange={text('medications')} /></Field>
            <Field label="Doctor"><Input maxLength={120} value={f.doctorName} onChange={text('doctorName')} /></Field>
            <Field label="Doctor phone"><Input type="tel" maxLength={32} value={f.doctorPhone} onChange={text('doctorPhone')} /></Field>
          </div>
        </FormSection>
      </form>
    </Modal>
  );
}
