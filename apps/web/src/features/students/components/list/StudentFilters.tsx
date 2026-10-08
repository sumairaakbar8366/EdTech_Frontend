import { FilterBar, FilterSlot, SearchInput, Select } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';
import { STUDENT_STATUS_LABEL } from '@/features/students/constants';
import type { StudentStatus } from '@/features/students/types/student.types';

export interface StudentFilterValues {
  search: string;
  classId: string;
  sectionId: string;
  status: '' | StudentStatus;
}

/** Search box plus class → section and status filters. Changing the class clears the section. */
export function StudentFilters({ value, onChange }: { value: StudentFilterValues; onChange: (v: StudentFilterValues) => void }) {
  const classes = useClasses();
  const sections = classes.data?.find((c) => c.id === value.classId)?.sections ?? [];
  return (
    <FilterBar>
      <SearchInput value={value.search} onChange={(search) => onChange({ ...value, search })} placeholder="Search name, admission no., parent name or phone…" label="Search students" />
      <FilterSlot>
        <Select aria-label="Class" value={value.classId} onChange={(e) => onChange({ ...value, classId: e.target.value, sectionId: '' })}>
          <option value="">All classes</option>
          {classes.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </FilterSlot>
      <FilterSlot width="w-44">
        <Select aria-label="Section" value={value.sectionId} disabled={!value.classId} onChange={(e) => onChange({ ...value, sectionId: e.target.value })}>
          <option value="">{value.classId ? 'All sections' : 'Section (choose a class)'}</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.campus.code})</option>)}
        </Select>
      </FilterSlot>
      <FilterSlot width="w-36">
        <Select aria-label="Status" value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as '' | StudentStatus })}>
          <option value="">All statuses</option>
          {(Object.keys(STUDENT_STATUS_LABEL) as StudentStatus[]).map((s) => <option key={s} value={s}>{STUDENT_STATUS_LABEL[s]}</option>)}
        </Select>
      </FilterSlot>
    </FilterBar>
  );
}
