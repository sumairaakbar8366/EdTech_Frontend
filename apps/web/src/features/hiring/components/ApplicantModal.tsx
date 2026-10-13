import { Paperclip } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Field, FormSection, Input, Modal, Select, TextArea } from '@/components/ui';
import { documentService } from '@/features/documents/services/documentService';
import { useHiringAction } from '@/features/hiring/hooks/useHiring';
import { hiringService } from '@/features/hiring/services/hiringService';
import { QUALIFICATIONS } from '@/features/hiring/types/hiring.types';
import { onSubmit } from '@/lib/forms';

const BLANK = {
  firstName: '', lastName: '', fatherName: '', gender: '', dateOfBirth: '', cnic: '', email: '', phone: '', address: '', city: '',
  highestQualification: '', institution: '', graduationYear: '', majorSubjects: '', education: '',
  experienceYears: '', currentEmployer: '', currentDesignation: '', experience: '', previousSchools: '',
  subjects: '', expectedSalary: '', noticePeriod: '', availableFrom: '', languages: '', skills: '', linkedinUrl: '', references: '', coverNote: '',
};
type Form = typeof BLANK;
const NUMBERS: (keyof Form)[] = ['experienceYears', 'graduationYear', 'expectedSalary'];

/** Record a new applicant with the full application (personal, qualification, experience, preferences, CV). */
export function ApplicantModal({ open, postId, teaching = true, onClose }: { open: boolean; postId: string; teaching?: boolean; onClose: () => void }) {
  const [f, setF] = useState<Form>(BLANK);
  const [cv, setCv] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) { setF(BLANK); setCv(null); setCvError(null); }
  }, [open]);

  const save = useHiringAction(
    async () => {
      const body = Object.fromEntries(
        Object.entries(f).map(([k, v]) => [k, v.trim() === '' ? null : NUMBERS.includes(k as keyof Form) ? Number(v) : v.trim()]),
      ) as Record<string, string | number | null>;
      const app = await hiringService.addApplicant(postId, { ...body, firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim() });
      if (cv) {
        try {
          await documentService.upload({ ownerType: 'job_application', ownerId: app.id, category: 'cv', title: 'CV / résumé', file: cv });
        } catch {
          setCvError('The applicant was added, but the CV could not be uploaded. Open the profile to try again.');
        }
      }
      return app;
    },
    'Applicant added',
    onClose,
  );
  const text = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <Modal open={open} size="xl" title="Add applicant" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="app-form" loading={save.isPending}>Add applicant</Button></>}>
      <form id="app-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-6">
        {cvError && <Alert>{cvError}</Alert>}
        <FormSection title="Personal details">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={text('firstName')} /></Field>
            <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={text('lastName')} /></Field>
            <Field label="Father’s name"><Input maxLength={100} value={f.fatherName} onChange={text('fatherName')} /></Field>
            <Field label="Gender"><Select value={f.gender} onChange={text('gender')}><option value="">—</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></Select></Field>
            <Field label="Date of birth"><Input type="date" max={new Date().toISOString().slice(0, 10)} value={f.dateOfBirth} onChange={text('dateOfBirth')} /></Field>
            <Field label="CNIC" hint="35202-1234567-1"><Input maxLength={15} pattern="\d{5}-?\d{7}-?\d" value={f.cnic} onChange={text('cnic')} /></Field>
          </div>
        </FormSection>
        <FormSection title="Contact">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Email" hint="e.g. name@gmail.com"><Input type="email" required pattern="[^@\s]+@[^@\s]+\.[A-Za-z]{2,}" title="Enter a full email address, e.g. name@gmail.com" value={f.email} onChange={text('email')} /></Field>
            <Field label="Mobile"><Input type="tel" maxLength={32} value={f.phone} onChange={text('phone')} placeholder="0300 1234567" /></Field>
            <Field label="City"><Input maxLength={100} value={f.city} onChange={text('city')} /></Field>
            <div className="sm:col-span-3"><Field label="Address"><Input maxLength={500} value={f.address} onChange={text('address')} /></Field></div>
          </div>
        </FormSection>
        <FormSection title="Qualification">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Highest qualification"><Select value={f.highestQualification} onChange={text('highestQualification')}><option value="">—</option>{QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}</Select></Field>
            <Field label="Institution"><Input maxLength={200} value={f.institution} onChange={text('institution')} placeholder="University / board" /></Field>
            <Field label="Passing year"><Input type="number" min={1960} max={2100} value={f.graduationYear} onChange={text('graduationYear')} /></Field>
            <div className="sm:col-span-3"><Field label="Major subjects"><Input maxLength={300} value={f.majorSubjects} onChange={text('majorSubjects')} placeholder="e.g. Physics, Mathematics" /></Field></div>
            <div className="sm:col-span-3"><Field label="Other education & certificates"><TextArea rows={2} maxLength={2000} value={f.education} onChange={text('education')} placeholder="B.Ed, diplomas, short courses…" /></Field></div>
          </div>
        </FormSection>
        <FormSection title="Experience">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Years of experience"><Input type="number" min={0} max={60} value={f.experienceYears} onChange={text('experienceYears')} /></Field>
            <Field label="Current employer"><Input maxLength={200} value={f.currentEmployer} onChange={text('currentEmployer')} /></Field>
            <Field label="Current designation"><Input maxLength={150} value={f.currentDesignation} onChange={text('currentDesignation')} /></Field>
            <div className="sm:col-span-3"><Field label="Experience details"><TextArea rows={3} maxLength={3000} value={f.experience} onChange={text('experience')} /></Field></div>
            <div className="sm:col-span-3"><Field label="Previous schools"><TextArea rows={2} maxLength={2000} value={f.previousSchools} onChange={text('previousSchools')} /></Field></div>
          </div>
        </FormSection>
        <FormSection title="Job preferences">
          <div className="grid gap-3 sm:grid-cols-3">
            {teaching && <div className="sm:col-span-3"><Field label="Subjects / classes they can teach"><Input maxLength={500} value={f.subjects} onChange={text('subjects')} placeholder="e.g. Maths & Physics, grades 6–10" /></Field></div>}
            <Field label="Expected salary (PKR / month)"><Input type="number" min={0} step={500} value={f.expectedSalary} onChange={text('expectedSalary')} /></Field>
            <Field label="Notice period"><Input maxLength={100} value={f.noticePeriod} onChange={text('noticePeriod')} placeholder="e.g. 1 month" /></Field>
            <Field label="Available from"><Input type="date" value={f.availableFrom} onChange={text('availableFrom')} /></Field>
          </div>
        </FormSection>
        <FormSection title="More">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Languages"><Input maxLength={300} value={f.languages} onChange={text('languages')} placeholder="Urdu, English…" /></Field>
            <Field label="LinkedIn"><Input type="url" maxLength={300} value={f.linkedinUrl} onChange={text('linkedinUrl')} placeholder="https://linkedin.com/in/…" /></Field>
            <div className="sm:col-span-2"><Field label="Skills"><Input maxLength={1000} value={f.skills} onChange={text('skills')} placeholder="Classroom management, MS Office, lab work…" /></Field></div>
            <Field label="References"><TextArea rows={2} maxLength={2000} value={f.references} onChange={text('references')} /></Field>
            <Field label="Cover note"><TextArea rows={2} maxLength={3000} value={f.coverNote} onChange={text('coverNote')} /></Field>
            <div className="sm:col-span-2">
              <Field label="CV / résumé (optional)" hint="PDF, Word or an image. More certificates can be added on the profile.">
                <div className="flex items-center gap-3">
                  <input ref={fileInput} type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={(e) => setCv(e.target.files?.[0] ?? null)} />
                  <Button type="button" variant="secondary" icon={Paperclip} onClick={() => fileInput.current?.click()}>{cv ? 'Change file' : 'Choose file'}</Button>
                  <span className="truncate text-sm text-slate-500">{cv?.name ?? 'No file chosen'}</span>
                </div>
              </Field>
            </div>
          </div>
        </FormSection>
      </form>
    </Modal>
  );
}
