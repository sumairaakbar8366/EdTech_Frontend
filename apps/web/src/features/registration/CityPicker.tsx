import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui';

/** A city box that filters as you type: names that start with the text first, then names containing it. */
export function CityPicker({ value, cities, disabled, placeholder, onChange }: { value: string; cities: string[]; disabled?: boolean; placeholder?: string; onChange: (city: string) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return cities;
    return [...cities.filter((c) => c.toLowerCase().startsWith(q)), ...cities.filter((c) => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q))];
  }, [cities, value]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={box} className="relative">
      <Input required disabled={disabled} autoComplete="off" value={value} placeholder={placeholder} onFocus={() => setOpen(true)} onChange={(e) => { onChange(e.target.value); setOpen(true); }} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }} />
      {open && !disabled && cities.length > 0 && (
        <ul className="surface absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl p-1 shadow-depth-3" role="listbox">
          {matches.length === 0 && <li className="px-3 py-2 text-sm text-slate-500">Not in the list — keep typing your city’s name.</li>}
          {matches.map((c) => (
            <li key={c} role="option" aria-selected={c === value}>
              <button type="button" onClick={() => { onChange(c); setOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">
                {c}{c === value && <Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
