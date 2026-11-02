import { CalendarClock, HandHeart, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Modal, PageHeader, Select, Spinner, TextArea } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';
import { onSubmit } from '@/lib/forms';

interface SchoolEvent { id: string; title: string; kind: string; startsOn: string; endsOn: string | null; description: string | null; shareWithSponsors: boolean }
const KEY = ['school-events'] as const;
const svc = {
  list: () => api<SchoolEvent[]>('/events'),
  meta: () => api<{ kinds: { key: string; label: string }[] }>('/events/meta'),
  save: (id: string | null, b: Omit<SchoolEvent, 'id'>) => (id ? api<SchoolEvent>(`/events/${id}`, { method: 'PUT', body: b }) : api<SchoolEvent>('/events', { method: 'POST', body: b })),
  remove: (id: string) => api(`/events/${id}`, { method: 'DELETE' }),
};
const day = (v: string) => v.slice(0, 10);

/**
 * School events: admissions opening, a science fair, sports day, a function. Events you share with
 * Skool EdTech reach its sponsorship team, who may offer a scholarship or sponsorship for them.
 */
export function EventsPage() {
  const events = useQuery({ queryKey: KEY, queryFn: svc.list });
  const meta = useQuery({ queryKey: [...KEY, 'meta'], queryFn: svc.meta, staleTime: Infinity });
  const [editing, setEditing] = useState<SchoolEvent | 'new' | null>(null);
  const [removing, setRemoving] = useState<SchoolEvent | null>(null);
  const label = (k: string) => meta.data?.kinds.find((x) => x.key === k)?.label ?? k;
  const remove = useAction((id: string) => svc.remove(id), { success: 'Event removed', invalidate: [KEY], onDone: () => setRemoving(null) });
  const today = new Date().toISOString().slice(0, 10);
  const list = events.data ?? [];
  const upcoming = list.filter((e) => day(e.endsOn ?? e.startsOn) >= today).sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  const past = list.filter((e) => day(e.endsOn ?? e.startsOn) < today);

  const row = (e: SchoolEvent) => (
    <li key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900 dark:text-white">{e.title}</span><Badge tone="primary">{label(e.kind)}</Badge>{e.shareWithSponsors && <Badge tone="emerald"><HandHeart size={12} /> shared with sponsors</Badge>}</div>
        <div className="mt-0.5 text-sm text-slate-500">{formatDate(e.startsOn)}{e.endsOn && e.endsOn !== e.startsOn ? ` – ${formatDate(e.endsOn)}` : ''}</div>
        {e.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{e.description}</p>}
      </div>
      <IconButton icon={Pencil} label="Edit event" onClick={() => setEditing(e)} />
      <IconButton icon={Trash2} label="Remove event" tone="danger" onClick={() => setRemoving(e)} />
    </li>
  );
  return (
    <div>
      <PageHeader title="Events" sub="Admissions, fairs, functions: share them so sponsors can support your school" icon={CalendarClock} tone="amber" actions={<Button icon={Plus} onClick={() => setEditing('new')} data-tour="event-new">Add event</Button>} />
      {events.isLoading && <Spinner />}
      {events.data && list.length === 0 && <Card><EmptyState icon={CalendarClock} title="No events yet" tone="amber">Add your science fair, sports day or admission drive. If you share it, Skool EdTech may offer a scholarship or sponsorship for it.</EmptyState></Card>}
      {upcoming.length > 0 && <Card title="Coming up" icon={CalendarClock} tone="amber" padded={false} className="mb-5"><ul className="divide-y divide-slate-200/70 dark:divide-white/5">{upcoming.map(row)}</ul></Card>}
      {past.length > 0 && <Card title="Earlier" icon={CalendarClock} tone="slate" padded={false}><ul className="divide-y divide-slate-200/70 dark:divide-white/5">{past.map(row)}</ul></Card>}
      {editing && <EventModal event={editing === 'new' ? null : editing} kinds={meta.data?.kinds ?? []} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!removing} title="Remove this event?" message={`“${removing?.title ?? ''}” will be deleted.`} confirmLabel="Remove" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing.id)} onClose={() => setRemoving(null)} />
    </div>
  );
}

function EventModal({ event, kinds, onClose }: { event: SchoolEvent | null; kinds: { key: string; label: string }[]; onClose: () => void }) {
  const [f, setF] = useState({ title: '', kind: 'science_fair', startsOn: '', endsOn: '', description: '', shareWithSponsors: true });
  useEffect(() => { if (event) setF({ title: event.title, kind: event.kind, startsOn: day(event.startsOn), endsOn: event.endsOn ? day(event.endsOn) : '', description: event.description ?? '', shareWithSponsors: event.shareWithSponsors }); }, [event]);
  const save = useAction(() => svc.save(event?.id ?? null, { title: f.title.trim(), kind: f.kind, startsOn: f.startsOn, endsOn: f.endsOn || null, description: f.description.trim() || null, shareWithSponsors: f.shareWithSponsors }), { success: event ? 'Event updated' : 'Event added', invalidate: [KEY], onDone: onClose });
  return (
    <Modal open size="lg" title={event ? 'Edit event' : 'Add event'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="event-form" loading={save.isPending} disabled={!f.title.trim() || !f.startsOn}>Save</Button></>}>
      <form id="event-form" className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit(() => save.mutate(undefined))}>
        <div className="sm:col-span-2"><Field label="Title" required><Input required maxLength={150} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Annual Science Fair 2026" /></Field></div>
        <Field label="Kind" required><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{kinds.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Starts" required><Input required type="date" value={f.startsOn} onChange={(e) => setF({ ...f, startsOn: e.target.value })} /></Field><Field label="Ends"><Input type="date" min={f.startsOn} value={f.endsOn} onChange={(e) => setF({ ...f, endsOn: e.target.value })} /></Field></div>
        <div className="sm:col-span-2"><Field label="Details"><TextArea maxLength={2000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field></div>
        <label className="flex items-start gap-3 rounded-xl border border-slate-300 p-3.5 sm:col-span-2 dark:border-white/10"><input type="checkbox" className="mt-1 h-4 w-4" checked={f.shareWithSponsors} onChange={(e) => setF({ ...f, shareWithSponsors: e.target.checked })} /><span className="text-sm text-slate-700 dark:text-slate-200"><strong className="inline-flex items-center gap-1.5"><HandHeart size={15} /> Tell Skool EdTech</strong><span className="block">Our sponsorship team is told about this event and may offer a scholarship or sponsorship. We email the school administrator a private form.</span></span></label>
      </form>
    </Modal>
  );
}
