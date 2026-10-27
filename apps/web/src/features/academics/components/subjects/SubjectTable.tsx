import { Pencil, Trash2 } from 'lucide-react';
import { Badge, DataTable, IconButton, type Column } from '@/components/ui';
import type { Subject } from '@/features/academics/types/academics.types';

export function SubjectTable({ subjects, readOnly, onEdit, onDelete }: { subjects: Subject[]; readOnly: boolean; onEdit: (s: Subject) => void; onDelete: (s: Subject) => void }) {
  const columns: Column<Subject>[] = [
    { header: 'Subject', cell: (s) => s.name, className: 'font-semibold text-slate-800 dark:text-slate-100' },
    { header: 'Code', cell: (s) => <Badge tone="amber">{s.code}</Badge> },
    {
      header: 'Taught in',
      cell: (s) => {
        const used = s._count?.classSubjects ?? 0;
        return `${used} class${used === 1 ? '' : 'es'}`;
      },
      className: 'text-slate-500 dark:text-slate-400',
    },
    ...(readOnly
      ? []
      : [{
          header: '',
          cell: (s: Subject) => (
            <div className="flex justify-end">
              <IconButton icon={Pencil} label={`Edit ${s.name}`} onClick={() => onEdit(s)} />
              <IconButton icon={Trash2} label={`Delete ${s.name}`} tone="danger" onClick={() => onDelete(s)} />
            </div>
          ),
        }]),
  ];
  return <DataTable columns={columns} rows={subjects} rowKey={(s) => s.id} searchText={(s) => [s.name, s.code]} searchPlaceholder="Search subject or code…" rowClassName={() => 'transition-colors hover:bg-slate-500/5'} />;
}
