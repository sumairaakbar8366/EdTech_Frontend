import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';
import { useAdmissionsAction } from '@/features/admissions/hooks/useAdmissions';
import { admissionService } from '@/features/admissions/services/admissionService';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';
import { toApplicationForm, toApplicationPayload, type ApplicationForm } from '@/features/admissions/utils/admission.utils';
import { useActiveCampuses } from '@/features/campuses/hooks/useCampuses';
import { RELATION_LABEL } from '@/features/students/constants';
import { onSubmit } from '@/lib/forms';

/** New application, or edit an open one. */
export function ApplicationFormModal({ open, application, onClose, onSaved }: { open: boolean; application?: AdmissionApplication; onClose: () => void; onSaved?: (id: string) => void }) {
  const classes = useClasses(open);
  const campuses = useActiveCampuses(open);
  const [f, setF] = useState<ApplicationForm>(() => toApplicationForm(application));
  useEffect(() => {
    if (open) setF(toApplicationForm(application));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  // Default to the first campus once campuses load.
  useEffect(() => {
    if (!f.campusId && campuses.data?.[0]) setF((s) => ({ ...s, campusId: campuses.data![0]!.id }));
  }, [campuses.data, f.campusId]);
  const text = (k: keyof ApplicationForm) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = useAdmissionsAction(
    () => (application ? admissionService.update(application.id, { ...toApplicationPayload(f), academicYearId: application.academicYearId }) : admissionService.create(toApplicationPayload(f))),
    application ? 'Application updated' : 'Application received',
    (a) => {
      onClose();
      onSaved?.(a.id);
    },
  );
  return (
    <Modal
      open={open}
      size="xl"
      title={application ? `Edit ${application.applicationNo}` : 'New admission application'}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="application-form" loading={save.isPending}>{application ? 'Save' : 'Submit application'}</Button></>}
    >
      <form id="application-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-3 sm:grid-cols-3">
        <Field label="Applying for class"><Select required value={f.classId} onChange={text('classId')}><option value="">Select…</option>{classes.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Campus"><Select required value={f.campusId} onChange={text('campusId')}><option value="">Select…</option>{campuses.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <div />
        <Field label="Child first name"><Input required maxLength={100} value={f.firstName} onChange={text('firstName')} /></Field>
        <Field label="Child last name"><Input required maxLength={100} value={f.lastName} onChange={text('lastName')} /></Field>
        <Field label="Gender"><Select value={f.gender} onChange={text('gender')}><option value="">Not specified</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></Select></Field>
        <Field label="Date of birth"><Input type="date" required value={f.dateOfBirth} onChange={text('dateOfBirth')} /></Field>
        <div className="sm:col-span-2"><Field label="Previous school"><Input maxLength={150} value={f.previousSchool} onChange={text('previousSchool')} /></Field></div>
        <Field label="Parent first name"><Input required maxLength={100} value={f.guardianFirstName} onChange={text('guardianFirstName')} /></Field>
        <Field label="Parent last name"><Input required maxLength={100} value={f.guardianLastName} onChange={text('guardianLastName')} /></Field>
        <Field label="Relationship"><Select value={f.guardianRelation} onChange={text('guardianRelation')}>{Object.entries(RELATION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
        <Field label="Parent phone"><Input type="tel" required maxLength={32} value={f.guardianPhone} onChange={text('guardianPhone')} /></Field>
        <Field label="Parent email"><Input type="email" value={f.guardianEmail} onChange={text('guardianEmail')} /></Field>
        <div />
        <div className="sm:col-span-3"><Field label="Address"><Input maxLength={500} value={f.address} onChange={text('address')} /></Field></div>
        <div className="sm:col-span-3"><Field label="Notes"><Input maxLength={3000} value={f.notes} onChange={text('notes')} /></Field></div>
      </form>
    </Modal>
  );
}
