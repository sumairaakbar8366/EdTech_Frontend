import { Field, FormSection, Input, Select } from '@/components/ui';
import { GuardianSearch } from '@/features/students/components/forms/GuardianSearch';
import { RELATION_LABEL } from '@/features/students/constants';
import type { AddStudentForm } from '@/features/students/utils/student.utils';

type Props = { form: AddStudentForm; set: (patch: Partial<AddStudentForm>) => void; open: boolean };

/** "Parent / guardian" section: a new parent, or link an existing one (siblings). */
export function GuardianFields({ form: f, set, open }: Props) {
  const text = (k: keyof AddStudentForm) => (e: { target: { value: string } }) => set({ [k]: e.target.value } as Partial<AddStudentForm>);
  return (
    <FormSection title="Parent / guardian">
      <div className="flex flex-wrap gap-2">
        {(['new', 'existing'] as const).map((m) => (
          <label key={m} className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-base ring-1 ring-inset ${f.guardianMode === m ? 'bg-primary-500/10 ring-primary-500/40' : 'ring-slate-300 dark:ring-white/10'}`}>
            <input type="radio" className="accent-primary-600" checked={f.guardianMode === m} onChange={() => set({ guardianMode: m })} />
            {m === 'new' ? 'New parent' : 'Existing parent (sibling)'}
          </label>
        ))}
        <div className="w-44">
          <Select aria-label="Relationship" value={f.relationship} onChange={text('relationship')}>
            {Object.entries(RELATION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
      </div>
      {f.guardianMode === 'existing' ? (
        <GuardianSearch
          enabled={open}
          selectedId={f.guardianId}
          selectedLabel={f.guardianLabel}
          onSelect={(g) => set({ guardianId: g.id, guardianLabel: `${g.firstName} ${g.lastName} (${g.phone})` })}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="First name"><Input required maxLength={100} value={f.gFirst} onChange={text('gFirst')} /></Field>
          <Field label="Last name"><Input required maxLength={100} value={f.gLast} onChange={text('gLast')} /></Field>
          <Field label="Phone"><Input type="tel" required maxLength={32} value={f.gPhone} onChange={text('gPhone')} /></Field>
          <Field label={f.parentLogin ? 'Email (gets the User ID)' : 'Email'}><Input type="email" value={f.gEmail} onChange={text('gEmail')} /></Field>
          <Field label="Occupation"><Input maxLength={100} value={f.gOccupation} onChange={text('gOccupation')} /></Field>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 pb-2 text-base"><input type="checkbox" className="h-4 w-4 accent-primary-600" checked={f.parentLogin} onChange={(e) => set({ parentLogin: e.target.checked })} /> Parent login</label>
          </div>
          {f.parentLogin && <p className="text-sm text-slate-500 sm:col-span-2 sm:pt-6">A User ID (PAR-year-number) and a temporary password are generated and shown once after saving.</p>}
        </div>
      )}
    </FormSection>
  );
}
