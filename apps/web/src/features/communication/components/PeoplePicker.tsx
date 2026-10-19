import { useQuery } from '@tanstack/react-query';
import { SCHOOL_ROLES } from '@schoolerp/shared';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SearchInput, Select, Spinner } from '@/components/ui';
import { COMMUNICATION_KEY } from '@/features/communication/hooks/useCommunication';
import { communicationService, type PersonOption } from '@/features/communication/services/communicationService';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

/**
 * Pick individual recipients: type a name, User ID, email or class, optionally narrow by role, and add
 * people from the results. The chosen people show as removable chips.
 */
export function PeoplePicker({ value, onChange }: { value: PersonOption[]; onChange: (people: PersonOption[]) => void }) {
  const [text, setText] = useState('');
  const [role, setRole] = useState('');
  const q = useDebouncedValue(text.trim(), 300);
  const search = useQuery({
    queryKey: [...COMMUNICATION_KEY, 'people', q, role],
    queryFn: () => communicationService.people({ q, role }),
    enabled: q.length >= 2 || !!role,
  });
  const chosen = new Set(value.map((p) => p.id));
  const results = (search.data ?? []).filter((p) => !chosen.has(p.id));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <div className="min-w-0 flex-1"><SearchInput value={text} onChange={setText} placeholder="Search name, User ID or class…" label="Search people" /></div>
        <div className="w-40">
          <Select aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            {SCHOOL_ROLES.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
          </Select>
        </div>
      </div>
      {(q.length >= 2 || role) && (
        <ul className="max-h-56 divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
          {search.isLoading && <li className="p-3"><Spinner /></li>}
          {search.isSuccess && results.length === 0 && <li className="px-3 py-2 text-sm text-slate-500">Nobody matches.</li>}
          {results.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => onChange([...value, p])} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-500/5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{p.name} <span className="font-normal text-slate-400">· {p.loginId}</span></span>
                  <span className="block truncate text-xs text-slate-500">{[p.roles.join(', '), p.detail].filter(Boolean).join(' · ')}</span>
                </span>
                <Plus size={16} className="shrink-0 text-primary-600" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 py-1 pl-3 pr-1 text-sm font-semibold text-primary-700 dark:text-primary-200">
              {p.name}
              <button type="button" aria-label={`Remove ${p.name}`} onClick={() => onChange(value.filter((x) => x.id !== p.id))} className="rounded-full p-0.5 hover:bg-primary-500/20"><X size={13} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
