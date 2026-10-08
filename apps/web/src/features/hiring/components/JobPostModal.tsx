import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal, Select, TextArea } from '@/components/ui';
import { useActiveCampuses } from '@/features/campuses/hooks/useCampuses';
import { useHiringAction } from '@/features/hiring/hooks/useHiring';
import { hiringService } from '@/features/hiring/services/hiringService';
import type { JobPost } from '@/features/hiring/types/hiring.types';
import type { StaffType } from '@/features/staff/types/staff.types';
import { onSubmit } from '@/lib/forms';

/** Create (post = 'new') or edit a vacancy. The staff type is fixed once created. */
export function JobPostModal({ post, onClose, onCreated }: { post: JobPost | 'new' | null; onClose: () => void; onCreated: (id: string) => void }) {
  const editing = post && post !== 'new' ? post : null;
  const campuses = useActiveCampuses();
  const blank = { campusId: '', title: '', staffType: 'teaching' as StaffType, department: '', description: '', openings: '1', status: 'open' as JobPost['status'], closingDate: '' };
  const [f, setF] = useState(blank);
  useEffect(() => {
    if (!post) return;
    setF(
      editing
        ? { campusId: editing.campusId, title: editing.title, staffType: editing.staffType, department: editing.department ?? '', description: editing.description ?? '', openings: String(editing.openings), status: editing.status, closingDate: editing.closingDate?.slice(0, 10) ?? '' }
        : { ...blank, campusId: campuses.data?.[0]?.id ?? '' },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);
  const save = useHiringAction(
    () => {
      const body = { campusId: f.campusId, title: f.title, department: f.department || null, description: f.description || null, openings: Number(f.openings), status: f.status, closingDate: f.closingDate || null };
      return editing ? hiringService.updatePost(editing.id, body) : hiringService.createPost({ ...body, staffType: f.staffType });
    },
    editing ? 'Job post updated' : 'Job post created',
    (p) => {
      onCreated(p.id);
      onClose();
    },
  );
  const text = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open={!!post} size="lg" title={editing ? 'Edit job post' : 'New job post'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="post-form" loading={save.isPending}>Save</Button></>}>
      <form id="post-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Job title"><Input required maxLength={120} value={f.title} onChange={text('title')} /></Field></div>
        <Field label="Staff type"><Select value={f.staffType} disabled={!!editing} onChange={text('staffType')}><option value="teaching">Teaching</option><option value="non_teaching">Non-teaching</option></Select></Field>
        <Field label="Department"><Input maxLength={100} value={f.department} onChange={text('department')} /></Field>
        <Field label="Campus"><Select required value={f.campusId} onChange={text('campusId')}><option value="" disabled>Select…</option>{campuses.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Openings"><Input type="number" min={1} max={500} required value={f.openings} onChange={text('openings')} /></Field>
        <Field label="Status"><Select value={f.status} onChange={text('status')}><option value="draft">Draft</option><option value="open">Open</option><option value="closed">Closed</option></Select></Field>
        <Field label="Closing date (optional)"><Input type="date" value={f.closingDate} onChange={text('closingDate')} /></Field>
        <div className="sm:col-span-2"><Field label="Description"><TextArea rows={4} maxLength={5000} value={f.description} onChange={text('description')} /></Field></div>
      </form>
    </Modal>
  );
}
