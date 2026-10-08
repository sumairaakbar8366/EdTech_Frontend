import { STAFF_LOGIN_ROLES } from '@/features/staff/constants';

/** Checkbox pills for the roles of a staff login. */
export function RolePicker({ value, onChange }: { value: string[]; onChange: (roles: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STAFF_LOGIN_ROLES.map((r) => {
        const checked = value.includes(r.key);
        return (
          <label key={r.key} className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-base ring-1 ring-inset ${checked ? 'bg-primary-500/10 ring-primary-500/40' : 'ring-slate-300 dark:ring-white/10'}`}>
            <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={checked} onChange={() => onChange(checked ? value.filter((k) => k !== r.key) : [...value, r.key])} />
            {r.label}
          </label>
        );
      })}
    </div>
  );
}
