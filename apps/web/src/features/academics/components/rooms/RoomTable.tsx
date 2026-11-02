import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { Badge, DataTable, IconButton, type Column } from '@/components/ui';
import type { Room } from '@/features/academics/types/academics.types';

export function RoomTable({ rooms, readOnly, onEdit, onDelete }: { rooms: Room[]; readOnly: boolean; onEdit: (r: Room) => void; onDelete: (r: Room) => void }) {
  const columns: Column<Room>[] = [
    { header: 'Room', cell: (r) => r.name, className: 'font-semibold text-slate-800 dark:text-slate-100' },
    { header: 'Campus', cell: (r) => <Badge tone="sky"><MapPin size={11} /> {r.campus.name}</Badge> },
    { header: 'Capacity', cell: (r) => r.capacity ?? '—', className: 'text-slate-500 dark:text-slate-400' },
    ...(readOnly
      ? []
      : [{
          header: '',
          cell: (r: Room) => (
            <div className="flex justify-end">
              <IconButton icon={Pencil} label={`Edit ${r.name}`} onClick={() => onEdit(r)} />
              <IconButton icon={Trash2} label={`Delete ${r.name}`} tone="danger" onClick={() => onDelete(r)} />
            </div>
          ),
        }]),
  ];
  return <DataTable columns={columns} rows={rooms} rowKey={(r) => r.id} searchText={(r) => [r.name, r.campus.name]} searchPlaceholder="Search room or campus…" rowClassName={() => 'transition-colors hover:bg-slate-500/5'} />;
}
