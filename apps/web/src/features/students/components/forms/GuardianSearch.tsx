import { useState } from 'react';
import { SearchInput } from '@/components/ui';
import { useGuardianSearch } from '@/features/students/hooks/useStudents';
import type { GuardianHit } from '@/features/students/types/student.types';

/** Find an existing parent (for siblings) by name, phone or email. */
export function GuardianSearch({ enabled, selectedId, selectedLabel, onSelect }: { enabled: boolean; selectedId: string; selectedLabel: string; onSelect: (g: GuardianHit) => void }) {
  const [search, setSearch] = useState('');
  const hits = useGuardianSearch(search, enabled);
  return (
    <div>
      <div className="flex"><SearchInput value={search} onChange={setSearch} placeholder="Search parent by name, phone or email…" label="Search parent" /></div>
      {selectedId && <p className="mt-2 text-base font-semibold text-emerald-700 dark:text-emerald-300">Selected: {selectedLabel}</p>}
      <ul className="mt-2 max-h-44 divide-y divide-slate-200 overflow-y-auto rounded-lg ring-1 ring-slate-200 empty:hidden dark:divide-white/5 dark:ring-white/10">
        {hits.data?.map((g) => (
          <li key={g.id}>
            <button type="button" onClick={() => onSelect(g)} className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-primary-500/5 ${selectedId === g.id ? 'bg-primary-500/10' : ''}`}>
              <span className="font-semibold">{g.firstName} {g.lastName}</span>
              <span className="text-sm text-slate-500">{g.phone}{g.email ? ` · ${g.email}` : ''} · {g._count.children} child(ren)</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
