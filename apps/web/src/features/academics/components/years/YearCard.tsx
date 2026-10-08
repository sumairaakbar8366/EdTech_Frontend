import { CalendarDays, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Badge, Button, Card, IconButton } from '@/components/ui';
import type { AcademicYear, Term } from '@/features/academics/types/academics.types';
import { formatDate } from '@/lib/format';

interface YearCardProps {
  year: AcademicYear;
  readOnly: boolean;
  settingCurrent: boolean;
  onMakeCurrent: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddTerm: () => void;
  onEditTerm: (t: Term) => void;
  onDeleteTerm: (t: Term) => void;
}

/** One academic year with its terms. */
export function YearCard({ year: y, readOnly, settingCurrent, onMakeCurrent, onEdit, onDelete, onAddTerm, onEditTerm, onDeleteTerm }: YearCardProps) {
  return (
    <Card
      title={y.name}
      icon={CalendarDays}
      tone={y.isCurrent ? 'magenta' : 'slate'}
      actions={
        <div className="flex items-center gap-1">
          {y.isCurrent ? (
            <Badge tone="magenta"><Star size={12} /> Current</Badge>
          ) : (
            !readOnly && <Button variant="ghost" className="px-2.5 py-1.5 text-xs" onClick={onMakeCurrent} disabled={settingCurrent}>Make current</Button>
          )}
          {!readOnly && (
            <>
              <IconButton icon={Pencil} label="Edit year" onClick={onEdit} />
              <IconButton icon={Trash2} label="Delete year" tone="danger" disabled={y.isCurrent} onClick={onDelete} />
            </>
          )}
        </div>
      }
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(y.startDate)} – {formatDate(y.endDate)}</p>
      <div className="mt-4 space-y-2">
        {y.terms.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-500/5 px-3.5 py-2.5 ring-1 ring-inset ring-slate-500/10">
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(t.startDate)} – {formatDate(t.endDate)}</div>
            </div>
            {!readOnly && (
              <div className="flex">
                <IconButton icon={Pencil} label="Edit term" onClick={() => onEditTerm(t)} />
                <IconButton icon={Trash2} label="Delete term" tone="danger" onClick={() => onDeleteTerm(t)} />
              </div>
            )}
          </div>
        ))}
        {y.terms.length === 0 && <p className="text-sm text-slate-400">No terms yet.</p>}
      </div>
      {!readOnly && <Button variant="secondary" icon={Plus} className="mt-4 w-full" onClick={onAddTerm}>Add term</Button>}
    </Card>
  );
}
