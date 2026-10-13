import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Field, FormSection, Input, Modal, Select, TextArea } from '@/components/ui';
import { QUALIFICATIONS } from '@/features/hiring/types/hiring.types';
import { websiteService, type PublicSite } from '@/features/website/website';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

const BLANK = {
  firstName: '', lastName: '', fatherName: '', gender: '', dateOfBirth: '', cnic: '', email: '', phone: '', city: '', address: '',
  highestQualification: '', institution: '', graduationYear: '', majorSubjects: '',
  experienceYears: '', currentEmployer: '', currentDesignation: '', experience: '',
  subjects: '', expectedSalary: '', noticePeriod: '', availableFrom: '', languages: '', coverNote: '', website: '',
};
type Form = typeof BLANK;
const NUMBERS: (keyof Form)[] = ['experienceYears', 'graduationYear', 'expectedSalary'];

/** The school website's job application: the same detailed form the office uses (no file upload here). */
export function JobApplyModal({ job, onClose }: { job: PublicSite['jobs'][number] | null; onClose: () => void }) {
  const [f, setF] = useState<Form>(BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const close = () => { setF(BLANK); setDone(false); setError(null); onClose(); };
  if (!job) return null;
  const teaching = /teach|lecturer|instructor/i.test(job.title) || (job as { staffType?: string }).staffType === 'teaching';

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim() === '' ? null : NUMBERS.includes(k as keyof Form) ? Number(v) : v.trim()]));
      await websiteService.applyJob(job.id, { ...body, firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim(), website: f.website } as Parameters<typeof websiteService.applyJob>[1]);
      setDone(true);
    } catch (e) {
      setError(errorMessage(e, 'Could not send the application.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open size="xl" title={`Apply · ${job.title}`} onClose={close} footer={done ? <Button onClick={close}>Close</Button> : <><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" form="job-apply" loading={busy}>Send application</Button></>}>
      {done ? (
        <div className="py-6 text-center"><CheckCircle2 size={40} className="mx-auto text-emerald-600" /><p className="mt-3 text-lg font-semibold">Thank you, your application was received.</p><p className="text-slate-500">If you are shortlisted, the school will contact you by email or phone. Please keep your CV and certificates ready.</p></div>
      ) : (
        <form id="job-apply" onSubmit={onSubmit(() => void submit())} className="space-y-6">
          {error && <Alert>{error}</Alert>}
          <input type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} className="hidden" aria-hidden />
          <FormSection title="About you">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="First name"><Input required maxLength={100} value={f.firstName} onChange={set('firstName')} /></Field>
              <Field label="Last name"><Input required maxLength={100} value={f.lastName} onChange={set('lastName')} /></Field>
              <Field label="Father’s name"><Input maxLength={100} value={f.fatherName} onChange={set('fatherName')} /></Field>
              <Field label="Gender"><Select value={f.gender} onChange={set('gender')}><option value="">—</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></Select></Field>
              <Field label="Date of birth"><Input type="date" max={new Date().toISOString().slice(0, 10)} value={f.dateOfBirth} onChange={set('dateOfBirth')} /></Field>
              <Field label="CNIC" hint="35202-1234567-1"><Input maxLength={15} pattern="\d{5}-?\d{7}-?\d" value={f.cnic} onChange={set('cnic')} /></Field>
              <Field label="Email"><Input required type="email" pattern="[^@\s]+@[^@\s]+\.[A-Za-z]{2,}" title="e.g. name@gmail.com" maxLength={254} value={f.email} onChange={set('email')} /></Field>
              <Field label="Mobile number"><Input required type="tel" maxLength={32} value={f.phone} onChange={set('phone')} placeholder="0300 1234567" /></Field>
              <Field label="City"><Input maxLength={100} value={f.city} onChange={set('city')} /></Field>
              <div className="sm:col-span-3"><Field label="Address"><Input maxLength={500} value={f.address} onChange={set('address')} /></Field></div>
            </div>
          </FormSection>
          <FormSection title="Education">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Highest qualification"><Select required value={f.highestQualification} onChange={set('highestQualification')}><option value="">Choose…</option>{QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}</Select></Field>
              <Field label="Institution"><Input maxLength={200} value={f.institution} onChange={set('institution')} /></Field>
              <Field label="Passing year"><Input type="number" min={1960} max={2100} value={f.graduationYear} onChange={set('graduationYear')} /></Field>
              <div className="sm:col-span-3"><Field label="Major subjects"><Input maxLength={300} value={f.majorSubjects} onChange={set('majorSubjects')} placeholder="e.g. Physics, Mathematics" /></Field></div>
            </div>
          </FormSection>
          <FormSection title="Experience">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Years of experience"><Input type="number" min={0} max={60} value={f.experienceYears} onChange={set('experienceYears')} /></Field>
              <Field label="Current employer"><Input maxLength={200} value={f.currentEmployer} onChange={set('currentEmployer')} /></Field>
              <Field label="Current designation"><Input maxLength={150} value={f.currentDesignation} onChange={set('currentDesignation')} /></Field>
              <div className="sm:col-span-3"><Field label="Experience (schools, subjects, classes)"><TextArea rows={3} maxLength={3000} value={f.experience} onChange={set('experience')} /></Field></div>
            </div>
          </FormSection>
          <FormSection title="This job">
            <div className="grid gap-3 sm:grid-cols-3">
              {teaching && <div className="sm:col-span-3"><Field label="Subjects / classes you can teach"><Input maxLength={500} value={f.subjects} onChange={set('subjects')} /></Field></div>}
              <Field label="Expected salary (PKR / month)"><Input type="number" min={0} step={500} value={f.expectedSalary} onChange={set('expectedSalary')} /></Field>
              <Field label="Notice period"><Input maxLength={100} value={f.noticePeriod} onChange={set('noticePeriod')} placeholder="e.g. 1 month" /></Field>
              <Field label="Available from"><Input type="date" value={f.availableFrom} onChange={set('availableFrom')} /></Field>
              <div className="sm:col-span-3"><Field label="Languages"><Input maxLength={300} value={f.languages} onChange={set('languages')} placeholder="Urdu, English…" /></Field></div>
              <div className="sm:col-span-3"><Field label="Why would you like to join us?"><TextArea rows={3} maxLength={3000} value={f.coverNote} onChange={set('coverNote')} /></Field></div>
            </div>
          </FormSection>
        </form>
      )}
    </Modal>
  );
}
