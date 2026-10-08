import { Select } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';

/** Class → section picker (grouped by class), optionally limited to one class. */
export function SectionPicker({ value, onChange, classId, required }: { value: string; onChange: (id: string) => void; classId?: string; required?: boolean }) {
  const classes = useClasses();
  return (
    <Select required={required} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{required ? 'Select a section…' : 'Not enrolled yet'}</option>
      {classes.data
        ?.filter((c) => !classId || c.id === classId)
        .map((c) => (
          <optgroup key={c.id} label={c.name}>
            {c.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {c.name} – {s.name} ({s.campus.code}){s.capacity ? ` · ${s.capacity} seats` : ''}
              </option>
            ))}
          </optgroup>
        ))}
    </Select>
  );
}
