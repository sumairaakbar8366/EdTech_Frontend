import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { STUDENTS_KEY } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

export interface PickedStudent {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
}

/** Search-as-you-type chooser of active students (name or admission number). */
export function StudentPicker({ value, onChange }: { value: PickedStudent | null; onChange: (s: PickedStudent | null) => void }) {
  const [text, setText] = useState('');
  const q = useDebouncedValue(text.trim(), 250);
  const results = useQuery({
    queryKey: [...STUDENTS_KEY, 'picker', q],
    queryFn: () => studentService.list({ q, page: 1, pageSize: 8, status: 'active' }),
    enabled: q.length >= 2 && !value,
  });

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-primary-300 bg-primary-500/5 px-3.5 py-2 dark:border-primary-500/40">
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {value.firstName} {value.lastName} <span className="text-sm font-normal text-slate-500">· {value.admissionNo}</span>
        </span>
        <button type="button" aria-label="Change student" onClick={() => { onChange(null); setText(''); }} className="rounded p-1 text-slate-500 hover:bg-slate-500/10">
          <X size={15} />
        </button>
      </div>
    );
  }
  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a name or admission no.…"
        aria-label="Find student"
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-base outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 dark:border-white/10 dark:bg-[#0e1626] dark:text-white"
      />
      {!!results.data?.items.length && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-depth-3 dark:border-white/10 dark:bg-[#111a2c]">
          {results.data.items.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => onChange({ id: s.id, firstName: s.firstName, lastName: s.lastName, admissionNo: s.admissionNo })} className="flex w-full items-center justify-between px-3.5 py-2 text-left hover:bg-primary-500/10">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{s.firstName} {s.lastName}</span>
                <span className="text-sm text-slate-500">{s.admissionNo}{s.enrollments[0] && ` · ${s.enrollments[0].section.schoolClass.name} ${s.enrollments[0].section.name}`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.length >= 2 && results.data?.items.length === 0 && <p className="mt-1 text-sm text-slate-500">No active students match.</p>}
    </div>
  );
}
