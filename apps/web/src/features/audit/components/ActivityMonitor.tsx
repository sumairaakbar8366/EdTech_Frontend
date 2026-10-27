import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, KeyRound, LogIn, Pencil, ShieldAlert, ShieldCheck, Trash2, TriangleAlert, UserX } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Modal, SearchInput, Select, Spinner, StatCard, TextArea } from '@/components/ui';
import type { ActivityFilters, ActivityItem, ActivityPage, LogEdit } from '@/features/audit/services/activityService';
import { useAction } from '@/lib/hooks/useAction';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

const ROW: Record<ActivityItem['level'], string> = {
  critical: 'bg-rose-500/[0.07] hover:bg-rose-500/10 border-l-rose-500',
  warning: 'hover:bg-amber-500/5 border-l-amber-400',
  info: 'hover:bg-slate-500/5 border-l-transparent',
};
const DOT: Record<ActivityItem['level'], string> = {
  critical: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  info: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
};

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Main admin / owner: change a log entry's title and note. */
function EditLogModal({ item, onClose, save, saving }: { item: ActivityItem | null; onClose: () => void; save: (body: LogEdit) => void; saving: boolean }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => {
    if (item) { setTitle(item.title); setNote(item.note ?? ''); }
  }, [item]);
  return (
    <Modal open={!!item} title="Edit log entry" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={() => save({ title: title.trim() === item?.title ? undefined : title, note })}>Save</Button></>}>
      <div className="space-y-4">
        <Field label="Title"><Input maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Note" hint="e.g. checked with the teacher, this was correct"><TextArea rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

export interface LogManager {
  edit: (i: ActivityItem, body: LogEdit) => Promise<unknown>;
  remove: (i: ActivityItem) => Promise<unknown>;
}

function icon(i: ActivityItem) {
  if (i.kind === 'signin') return i.level === 'critical' ? UserX : i.level === 'warning' ? KeyRound : LogIn;
  return i.level === 'critical' ? ShieldAlert : TriangleAlert;
}

/**
 * Who signed in and who changed something sensitive (deletions, access, marks and results, money),
 * newest first. Risky rows are tinted red. Filters: search, campus, severity, kind and period;
 * `extraFilters` adds the platform owner's school picker in front. With `manage` (main admin / main
 * owner only) each entry can be edited or deleted. `simple` hides the tiles and the campus / kind
 * filters (the owner team's own log).
 */
export function ActivityMonitor({ queryKey, fetch, enabled = true, extraFilters, manage, simple = false }: { queryKey: unknown[]; fetch: (f: ActivityFilters) => Promise<ActivityPage>; enabled?: boolean; extraFilters?: ReactNode; manage?: LogManager; simple?: boolean }) {
  const [f, setF] = useState<Omit<ActivityFilters, 'q'>>({ page: 1, days: 30, level: '', kind: '', campusId: '' });
  const [text, setText] = useState('');
  const q = useDebouncedValue(text.trim(), 300);
  const filters = { ...f, q };
  const log = useQuery({ queryKey: [...queryKey, filters], queryFn: () => fetch(filters), enabled, placeholderData: keepPreviousData, refetchInterval: 60_000 });
  const d = log.data;
  const set = (patch: Partial<typeof f>) => setF((s) => ({ ...s, ...patch, page: 1 }));
  const [editing, setEditing] = useState<ActivityItem | null>(null);
  const [deleting, setDeleting] = useState<ActivityItem | null>(null);
  const saveEdit = useAction((body: LogEdit) => manage!.edit(editing!, body), { success: 'Log entry updated', invalidate: [queryKey.slice(0, 1)], onDone: () => setEditing(null) });
  const remove = useAction(() => manage!.remove(deleting!), { success: 'Log entry deleted', invalidate: [queryKey.slice(0, 1)], onDone: () => setDeleting(null) });

  return (
    <div className="dash space-y-5">
      {!simple && <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Risky changes (7 days)" value={d?.summary.critical ?? '–'} icon={ShieldAlert} tone="rose" hint="Deletions, password resets, access and report-card corrections" />
        <StatCard label="Sensitive changes (7 days)" value={d?.summary.warning ?? '–'} icon={TriangleAlert} tone="amber" hint="Marks, results, payments, salaries, settings" />
        <StatCard label="Sign-ins (7 days)" value={d?.summary.signins ?? '–'} icon={ShieldCheck} tone="emerald" hint="Successful sign-ins" />
        <StatCard label="Failed sign-ins (7 days)" value={d?.summary.failedSignins ?? '–'} icon={UserX} tone="rose" hint="Wrong password, unknown or disabled account" />
      </div>}

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-(--surface-border) p-4">
          {extraFilters}
          <div className="min-w-[14rem] flex-1"><SearchInput label="Search activity" value={text} onChange={(v) => { setText(v); setF((s) => ({ ...s, page: 1 })); }} placeholder="Search person, User ID or page…" /></div>
          {!simple && <div className="w-44">
            <Select aria-label="Campus" value={f.campusId} onChange={(e) => set({ campusId: e.target.value })}>
              <option value="">All campuses</option>
              {d?.campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>}
          {!simple && <div className="w-40">
            <Select aria-label="Severity" value={f.level} onChange={(e) => set({ level: e.target.value as ActivityFilters['level'] })}>
              <option value="">All severities</option>
              <option value="critical">Risky (red)</option>
              <option value="warning">Sensitive</option>
              <option value="info">Normal sign-ins</option>
            </Select>
          </div>}
          {!simple && <div className="w-36">
            <Select aria-label="Kind" value={f.kind} onChange={(e) => set({ kind: e.target.value as ActivityFilters['kind'] })}>
              <option value="">Everything</option>
              <option value="signin">Sign-ins</option>
              <option value="change">Changes</option>
            </Select>
          </div>}
          <div className="w-36">
            <Select aria-label="Period" value={f.days} onChange={(e) => set({ days: Number(e.target.value) })}>
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </Select>
          </div>
        </div>

        {!enabled && <div className="p-6 text-sm text-slate-500">Choose a school to see its activity.</div>}
        {enabled && log.isLoading && <div className="p-6"><Spinner /></div>}
        {d && d.items.length === 0 && <EmptyState icon={ShieldCheck} title="Nothing to show for these filters" />}
        {!!d?.items.length && (
          <ul className="divide-y divide-(--surface-border)">
            {d.items.map((i) => {
              const Icon = icon(i);
              return (
                <li key={`${i.kind}-${i.id}`} className={`flex items-start gap-3 border-l-[3px] px-4 py-3 transition-colors sm:px-5 ${ROW[i.level]}`}>
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${DOT[i.level]}`}><Icon size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={`text-sm font-bold ${i.level === 'critical' ? 'text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-slate-100'}`}>{i.title}</span>
                      {i.newDevice && <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">New device</span>}
                      {i.edited && <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">edited</span>}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                      <strong className="font-semibold">{i.actorName ?? 'Unknown'}</strong>
                      {i.roles && <span className="text-slate-500"> · {i.roles.split(',').map((r) => r.replace(/_/g, ' ')).join(', ')}</span>}
                      {i.campus && <span className="text-slate-500"> · {i.campus}</span>}
                    </div>
                    {i.detail && <div className="mt-0.5 truncate font-mono text-xs text-slate-500" title={i.detail}>{i.detail}</div>}
                    {i.note && <div className="mt-1 rounded-md bg-slate-500/5 px-2 py-1 text-xs text-slate-600 dark:text-slate-300">Note: {i.note}</div>}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="whitespace-nowrap text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">{when(i.at)}</div>
                    {i.ip && <div className="font-mono text-[11px] text-slate-400">{i.ip}</div>}
                    {manage && (
                      <div className="mt-1 flex justify-end gap-0.5">
                        <IconButton icon={Pencil} label="Edit log entry" onClick={() => setEditing(i)} />
                        <IconButton icon={Trash2} label="Delete log entry" tone="danger" onClick={() => setDeleting(i)} />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {d && (d.page > 1 || d.hasMore) && (
          <div className="flex items-center justify-end gap-1 border-t border-(--surface-border) px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
            <IconButton icon={ChevronLeft} label="Newer" disabled={f.page <= 1} onClick={() => setF((s) => ({ ...s, page: s.page - 1 }))} />
            <span className="px-2">Page {f.page}</span>
            <IconButton icon={ChevronRight} label="Older" disabled={!d.hasMore} onClick={() => setF((s) => ({ ...s, page: s.page + 1 }))} />
          </div>
        )}
      </Card>
      {manage && <EditLogModal item={editing} onClose={() => setEditing(null)} save={(body) => saveEdit.mutate(body)} saving={saveEdit.isPending} />}
      {manage && (
        <ConfirmDialog
          open={!!deleting}
          title="Delete this log entry?"
          message={`"${deleting?.title}" by ${deleting?.actorName ?? 'Unknown'} will be removed from the activity log for good.`}
          confirmLabel="Delete"
          loading={remove.isPending}
          onConfirm={() => remove.mutate(undefined)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
