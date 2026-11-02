import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { inputClass, useFieldProps } from '@/components/ui/Field/Field';

export interface SearchOption {
  value: string;
  label: string;
  /** Second line (class, role, User ID…); also searched. */
  detail?: string;
}

/**
 * A select you can type into: the list narrows to options whose name or detail contains every word
 * typed. Keyboard: ↑ ↓ to move, Enter to pick, Esc to close. The list opens in place (no popover),
 * so it works inside modals and scrolling panels.
 */
export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Type to search…',
  disabled,
  emptyText = 'No match',
}: {
  options: SearchOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
}) {
  const field = useFieldProps();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.value === value);
  const matches = useMemo(() => {
    const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return options.filter((o) => words.every((w) => `${o.label} ${o.detail ?? ''}`.toLowerCase().includes(w))).slice(0, 100);
  }, [options, text]);

  const pick = (o: SearchOption) => {
    onChange(o.value);
    setText('');
    setOpen(false);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(matches.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && open && matches[active]) { e.preventDefault(); pick(matches[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false); }}>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={input}
          {...field}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          disabled={disabled}
          value={open ? text : selected ? `${selected.label}${selected.detail ? ` · ${selected.detail}` : ''}` : ''}
          placeholder={selected ? `${selected.label}` : placeholder}
          onFocus={() => { setOpen(true); setActive(0); }}
          onChange={(e) => { setText(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={onKey}
          className={`${inputClass} pl-9 pr-16 disabled:cursor-not-allowed disabled:opacity-60`}
        />
        <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 text-slate-400">
          {value && !disabled && (
            <button type="button" aria-label="Clear" onClick={() => { onChange(''); setText(''); input.current?.focus(); }} className="rounded p-1 hover:bg-slate-500/10 hover:text-slate-600"><X size={14} /></button>
          )}
          <ChevronDown size={16} />
        </span>
      </div>
      {open && !disabled && (
        <ul id={listId} role="listbox" className="mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#0e1626]">
          {matches.length === 0 && <li className="px-3 py-2 text-sm text-slate-500">{emptyText}</li>}
          {matches.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left ${i === active ? 'bg-primary-500/10' : ''}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{o.label}</span>
                  {o.detail && <span className="block truncate text-xs text-slate-500">{o.detail}</span>}
                </span>
                {o.value === value && <Check size={15} className="shrink-0 text-primary-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
