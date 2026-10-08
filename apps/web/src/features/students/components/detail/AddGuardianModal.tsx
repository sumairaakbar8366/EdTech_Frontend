import { useState } from 'react';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { RELATION_LABEL } from '@/features/students/constants';
import { useStudentsAction } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import { onSubmit } from '@/lib/forms';
import type { Relation } from '@/types/common';

export function AddGuardianModal({ open, studentId, onClose }: { open: boolean; studentId: string; onClose: () => void }) {
  const [f, setF] = useState({ firstName: '', lastName: '', phone: '', email: '', occupation: '', relationship: 'mother' as Relation, isPrimary: false });
  const save = useStudentsAction(
    () =>
      studentService.addGuardian(studentId, {
        details: { firstName: f.firstName, lastName: f.lastName, phone: f.phone, email: f.email || null, occupation: f.occupation || null },
        relationship: f.relationship,
        isPrimary: f.isPrimary,
      }),
    'Guardian added',
    onClose,
  );
  const text = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open={open} size="lg" title="Add parent / guardian" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="add-guardian" loading={save.isPending}>Add</Button></>}>
      <form id="add-guardian" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-3 sm:grid-cols-2">
        <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={text('firstName')} /></Field>
        <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={text('lastName')} /></Field>
        <Field label="Phone"><Input type="tel" required maxLength={32} value={f.phone} onChange={text('phone')} /></Field>
        <Field label="Email"><Input type="email" value={f.email} onChange={text('email')} /></Field>
        <Field label="Occupation"><Input maxLength={100} value={f.occupation} onChange={text('occupation')} /></Field>
        <Field label="Relationship"><Select value={f.relationship} onChange={text('relationship')}>{Object.entries(RELATION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
        <label className="flex items-center gap-2 text-base"><input type="checkbox" className="h-4 w-4 accent-primary-600" checked={f.isPrimary} onChange={(e) => setF({ ...f, isPrimary: e.target.checked })} /> Primary contact</label>
      </form>
    </Modal>
  );
}
