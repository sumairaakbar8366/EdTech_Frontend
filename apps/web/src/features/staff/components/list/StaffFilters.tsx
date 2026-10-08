import { FilterBar, FilterSlot, SearchInput, Select } from '@/components/ui';
import { useCampuses } from '@/features/campuses/hooks/useCampuses';
import { STATUS_LABEL } from '@/features/staff/constants';
import type { EmployeeStatus, StaffType } from '@/features/staff/types/staff.types';

export interface StaffFilterValues {
  search: string;
  staffType: '' | StaffType;
  status: '' | EmployeeStatus;
  campusId: string;
}

/** Search plus type, status and (for multi-campus schools) campus filters. */
export function StaffFilters({ value, onChange, showCampus }: { value: StaffFilterValues; onChange: (v: StaffFilterValues) => void; showCampus: boolean }) {
  const campuses = useCampuses(showCampus);
  return (
    <FilterBar>
      <SearchInput value={value.search} onChange={(search) => onChange({ ...value, search })} placeholder="Search name, employee no., email, designation…" label="Search staff" />
      <FilterSlot>
        <Select aria-label="Staff type" value={value.staffType} onChange={(e) => onChange({ ...value, staffType: e.target.value as '' | StaffType })}>
          <option value="">All types</option><option value="teaching">Teaching</option><option value="non_teaching">Non-teaching</option>
        </Select>
      </FilterSlot>
      <FilterSlot>
        <Select aria-label="Status" value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as '' | EmployeeStatus })}>
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABEL) as EmployeeStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </Select>
      </FilterSlot>
      {!!campuses.data && campuses.data.length > 1 && (
        <FilterSlot width="w-44">
          <Select aria-label="Campus" value={value.campusId} onChange={(e) => onChange({ ...value, campusId: e.target.value })}>
            <option value="">All campuses</option>
            {campuses.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </FilterSlot>
      )}
    </FilterBar>
  );
}
