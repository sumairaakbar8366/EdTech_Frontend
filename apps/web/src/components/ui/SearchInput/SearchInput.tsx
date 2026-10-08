import { Search } from 'lucide-react';

/** Search box with a leading icon. Pair with useDebouncedValue for server-side search. */
export function SearchInput({ value, onChange, placeholder, label }: { value: string; onChange: (value: string) => void; placeholder: string; label: string }) {
  return (
    <div className="relative min-w-[16rem] flex-1">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-base outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 dark:border-white/10 dark:bg-[#0e1626] dark:text-white"
      />
    </div>
  );
}
