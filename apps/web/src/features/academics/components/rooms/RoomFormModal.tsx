import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { useAcademicsAction } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { Room } from '@/features/academics/types/academics.types';
import { useActiveCampuses } from '@/features/campuses/hooks/useCampuses';
import { onSubmit, optionalNumber } from '@/lib/forms';

/** Create (room = 'new') or edit a room. A room's campus is fixed once created. */
export function RoomFormModal({ room, onClose }: { room: Room | 'new' | null; onClose: () => void }) {
  const campuses = useActiveCampuses(!!room);
  const [form, setForm] = useState({ campusId: '', name: '', capacity: '' });
  const existing = room && room !== 'new' ? room : null;
  useEffect(() => {
    if (!room) return;
    setForm(existing ? { campusId: existing.campusId, name: existing.name, capacity: existing.capacity?.toString() ?? '' } : { campusId: campuses.data?.[0]?.id ?? '', name: '', capacity: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);
  const save = useAcademicsAction(
    () =>
      existing
        ? academicsService.updateRoom(existing.id, { name: form.name, capacity: optionalNumber(form.capacity, null) as number | null })
        : academicsService.createRoom({ campusId: form.campusId, name: form.name, capacity: optionalNumber(form.capacity) ?? undefined }),
    'Room saved',
    onClose,
  );
  return (
    <Modal
      open={!!room}
      title={existing ? 'Edit room' : 'New room'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="room-form" loading={save.isPending}>Save</Button>
        </>
      }
    >
      <form id="room-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-4">
        {!existing && (
          <Field label="Campus">
            <Select required value={form.campusId} onChange={(e) => setForm({ ...form, campusId: e.target.value })}>
              <option value="" disabled>Select a campus…</option>
              {campuses.data?.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </Select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" hint="e.g. Room 101, Science Lab">
            <Input required maxLength={50} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Capacity (optional)">
            <Input type="number" min={1} max={5000} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
