import { Field, FormSection, Input } from '@/components/ui';
import { SectionPicker } from '@/features/academics/components/SectionPicker';
import type { AddStudentForm } from '@/features/students/utils/student.utils';

type Props = { form: AddStudentForm; set: (patch: Partial<AddStudentForm>) => void };

/** "Class & access" section: optional enrollment and student login. */
export function ClassAccessFields({ form: f, set }: Props) {
  return (
    <FormSection title="Class & access">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Field label="Class & section (current year)"><SectionPicker value={f.sectionId} onChange={(sectionId) => set({ sectionId })} /></Field></div>
        <Field label="Roll no."><Input type="number" min={1} max={9999} disabled={!f.sectionId} value={f.rollNo} onChange={(e) => set({ rollNo: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-base"><input type="checkbox" className="h-4 w-4 accent-primary-600" checked={f.studentLogin} onChange={(e) => set({ studentLogin: e.target.checked })} /> Student login</label>
        {f.studentLogin && (
          <>
            <Field label="Student email"><Input type="email" required value={f.studentEmail} onChange={(e) => set({ studentEmail: e.target.value })} /></Field>
            <Field label="Temporary password"><Input type="password" autoComplete="new-password" required minLength={12} value={f.studentPassword} onChange={(e) => set({ studentPassword: e.target.value })} /></Field>
          </>
        )}
      </div>
    </FormSection>
  );
}
