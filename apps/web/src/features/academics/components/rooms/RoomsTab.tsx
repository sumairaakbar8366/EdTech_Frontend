import { DoorOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, ConfirmDialog, EmptyState, Spinner } from '@/components/ui';
import { SheetActions } from '@/components/shared/SheetActions';
import { ROOM_EXPORT, ROOM_IMPORT } from '@/features/academics/utils/academicsSheet';
import { RoomFormModal } from '@/features/academics/components/rooms/RoomFormModal';
import { RoomTable } from '@/features/academics/components/rooms/RoomTable';
import { useAcademicsAction, useRooms } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { Room } from '@/features/academics/types/academics.types';

export function RoomsTab({ readOnly }: { readOnly: boolean }) {
  const rooms = useRooms();
  const [editing, setEditing] = useState<Room | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);
  const remove = useAcademicsAction((id: string) => academicsService.deleteRoom(id), 'Room deleted', () => setDeleting(null));

  return (
    <>
      <Card
        title="Rooms"
        icon={DoorOpen}
        tone="sky"
        padded={false}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SheetActions compact fileName="Rooms" columns={ROOM_EXPORT} rows={async () => rooms.data ?? []} importSpec={readOnly ? undefined : ROOM_IMPORT} />
            {!readOnly && <Button icon={Plus} className="px-3 py-1.5 text-xs" onClick={() => setEditing('new')}>New room</Button>}
          </div>
        }
      >
        {rooms.isLoading && <div className="px-5"><Spinner /></div>}
        {rooms.data?.length === 0 && <EmptyState icon={DoorOpen} title="No rooms yet" tone="sky">Rooms belong to a campus and are used when building the timetable.</EmptyState>}
        {!!rooms.data?.length && <RoomTable rooms={rooms.data} readOnly={readOnly} onEdit={setEditing} onDelete={setDeleting} />}
      </Card>
      {!readOnly && <RoomFormModal room={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        title="Delete room?"
        message={`“${deleting?.name}” will be permanently deleted.`}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
