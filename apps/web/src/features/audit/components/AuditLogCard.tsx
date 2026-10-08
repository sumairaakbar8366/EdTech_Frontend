import { ChevronLeft, ChevronRight, ScrollText } from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, EmptyState, IconButton, SearchInput, Select, Spinner, type Tone } from '@/components/ui';
import { useAuditLog } from '@/features/audit/hooks/useAudit';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

const ACTION_TONE: Record<string, Tone> = { create: 'emerald', update: 'sky', delete: 'rose' };

/** Who changed what and when: every write made through the school API (page 14 audit_logs). */
export function AuditLogCard() {
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [text, setText] = useState('');
  const q = useDebouncedValue(text.trim(), 300);
  const log = useAuditLog({ page, entity, q });
  const d = log.data;
  const pages = d ? Math.max(1, Math.ceil(d.total / d.pageSize)) : 1;
  return (
    <Card title="Audit log" icon={ScrollText} tone="slate" padded={false}>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-white/5">
        <div className="min-w-[14rem] flex-1"><SearchInput label="Search audit log" value={text} onChange={(v) => { setText(v); setPage(1); }} placeholder="Search person or path…" /></div>
        <div className="w-48">
          <Select aria-label="Module" value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }}>
            <option value="">All modules</option>
            {d?.entities.map((e) => <option key={e.entity} value={e.entity}>{e.entity} ({e.count})</option>)}
          </Select>
        </div>
      </div>
      {log.isLoading && <div className="p-5"><Spinner /></div>}
      {d?.items.length === 0 && <EmptyState icon={ScrollText} title="No changes recorded yet" tone="slate" />}
      {!!d?.items.length && (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02]">
                <th className="px-5 py-3 font-semibold">When</th>
                <th className="px-5 py-3 font-semibold">Who</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Module</th>
                <th className="px-5 py-3 font-semibold">Request</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
              {d.items.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-5 py-2.5 text-sm text-slate-600 dark:text-slate-300">{new Date(e.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-5 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{e.actorName ?? '—'}</td>
                  <td className="px-5 py-2.5"><Badge tone={ACTION_TONE[e.action] ?? 'primary'}>{e.action}</Badge></td>
                  <td className="px-5 py-2.5 capitalize text-slate-700 dark:text-slate-200">{e.entity}</td>
                  <td className="max-w-[22rem] truncate px-5 py-2.5 font-mono text-xs text-slate-500" title={`${e.method} ${e.path}${e.ip ? ` · ${e.ip}` : ''}`}>{e.method} {e.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="flex items-center justify-end gap-1 border-t border-slate-200 px-5 py-3 text-slate-600 dark:border-white/5 dark:text-slate-300">
          <IconButton icon={ChevronLeft} label="Newer" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
          <span className="px-2">Page {page} of {pages}</span>
          <IconButton icon={ChevronRight} label="Older" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} />
        </div>
      )}
    </Card>
  );
}
