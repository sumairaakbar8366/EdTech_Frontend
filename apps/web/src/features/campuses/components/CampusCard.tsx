import { Building2, MapPin, Phone, Power, Star } from 'lucide-react';
import { Badge, Button, IconTile } from '@/components/ui';
import type { Campus } from '@/features/academics/types/academics.types';

/** One campus with its status; non-main campuses can be switched on and off. */
export function CampusCard({ campus: c, busy, onToggle }: { campus: Campus; busy: boolean; onToggle: () => void }) {
  return (
    <div
      className={`rounded-2xl p-4 ring-1 ring-inset transition ${
        c.isActive ? 'bg-white/60 ring-slate-500/10 dark:bg-white/5' : 'bg-slate-500/5 opacity-70 ring-slate-500/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <IconTile icon={Building2} tone={c.isMain ? 'magenta' : c.isActive ? 'primary' : 'slate'} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-100">{c.name}</span>
            <Badge>{c.code}</Badge>
            {c.isMain && <Badge tone="magenta"><Star size={11} /> Main</Badge>}
            {!c.isActive && <Badge tone="amber">Inactive</Badge>}
          </div>
          {c.address && (
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><MapPin size={12} /> {c.address}</div>
          )}
          {c.phone && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Phone size={12} /> {c.phone}</div>
          )}
        </div>
      </div>
      {!c.isMain && (
        <Button variant="secondary" icon={Power} className="mt-3 w-full py-1.5 text-xs" disabled={busy} onClick={onToggle}>
          {c.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      )}
    </div>
  );
}
