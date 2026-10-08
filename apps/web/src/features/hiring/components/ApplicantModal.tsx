import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal, TextArea } from '@/components/ui';
import { useHiringAction } from '@/features/hiring/hooks/useHiring';
import { hiringService } from '@/features/hiring/services/hiringService';
import { onSubmit } from '@/lib/forms';

const BLANK = { firstName: '', lastName: '', email: '', phone: '', education: '', experienceYears: '', experience: '', previousSchools: '', references: '', coverNote: '' };

/** Record a new applicant for a vacancy. Empty optional fields are sent as null. */
export function ApplicantModal({ open, postId, onClose }: { open: boolean; postId: string; onClose: () => void }) {
  const [f, setF] = useState(BLANK);
  useEffect(() => {
    if (open) setF(BLANK);
  }, [open]);
  const save = useHiringAction(
    () =>
      hiringService.addApplicant(postId, {
        ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim() === '' ? null : v])),
        firstName: f.firstName,
        lastName: f.lastName,
        email: f.email,
        experienceYears: f.experienceYears ? Number(f.experienceYears) : null,
      }),
    'Applicant added',
    onClose,
  );
  const text = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open={open} size="xl" title="Add applicant" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="app-form" loading={save.isPending}>Add applicant</Button></>}>
      <form id="app-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-3 sm:grid-cols-2">
        <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={text('firstName')} /></Field>
        <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={text('lastName')} /></Field>
        <Field label="Email" hint="e.g. name@gmail.com"><Input type="email" required pattern="[^@\s]+@[^@\s]+\.[A-Za-z]{2,}" title="Enter a full email address, e.g. name@gmail.com" value={f.email} onChange={text('email')} /></Field>
        <Field label="Phone"><Input type="tel" maxLength={32} value={f.phone} onChange={text('phone')} /></Field>
        <Field label="Education"><Input maxLength={2000} value={f.education} onChange={text('education')} /></Field>
        <Field label="Years of experience"><Input type="number" min={0} max={60} value={f.experienceYears} onChange={text('experienceYears')} /></Field>
        <div className="sm:col-span-2"><Field label="Experience"><TextArea rows={3} maxLength={3000} value={f.experience} onChange={text('experience')} /></Field></div>
        <Field label="Previous schools"><TextArea rows={2} maxLength={2000} value={f.previousSchools} onChange={text('previousSchools')} /></Field>
        <Field label="References"><TextArea rows={2} maxLength={2000} value={f.references} onChange={text('references')} /></Field>
        <div className="sm:col-span-2"><Field label="Cover note"><TextArea rows={3} maxLength={3000} value={f.coverNote} onChange={text('coverNote')} /></Field></div>
      </form>
    </Modal>
  );
}
