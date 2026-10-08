import { Crown, Plus } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, ConfirmDialog, EmptyState, PageHeader, SearchInput, Spinner } from '@/components/ui';
import { TierCard } from '@/features/platform/components/TierCard';
import { TierFormModal } from '@/features/platform/components/TierFormModal';
import { TIERS_KEY, useTiers } from '@/features/platform/hooks/usePlatform';
import { platformService } from '@/features/platform/services/platformService';
import type { Tier, TierFilter } from '@/features/platform/types/platform.types';
import { useAction } from '@/lib/hooks/useAction';

const STATUS: { id: NonNullable<TierFilter['status']>; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Available' },
  { id: 'inactive', label: 'Hidden' },
];

/** Page 1: the plan catalogue. The owner sets and changes each plan's prices, limits and features. */
export function TiersPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<NonNullable<TierFilter['status']>>('all');
  const tiers = useTiers({ q: q.trim() || undefined, status });
  const [editing, setEditing] = useState<Tier | null | 'new'>(null);
  const [deleting, setDeleting] = useState<Tier | null>(null);
  const invalidate = [TIERS_KEY, ['public', 'plans']];
  const toggle = useAction((t: Tier) => platformService.updateTier({ id: t.id, isActive: !t.isActive }), { success: (r) => (r.isActive ? 'Plan is available again' : 'Plan hidden; schools already on it keep it'), invalidate });
  const remove = useAction((t: Tier) => platformService.deleteTier(t.id), { success: 'Plan deleted', invalidate, onDone: () => setDeleting(null) });

  return (
    <div>
      <PageHeader
        title="Subscription Plans"
        sub="Set and change each plan's price, limits and features. Every new school starts with a 1-month full-featured trial."
        icon={Crown}
        tone="magenta"
        actions={<Button icon={Plus} onClick={() => setEditing('new')}>Add plan</Button>}
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72"><SearchInput value={q} onChange={setQ} placeholder="Search plans…" label="Search plans" /></div>
        <div role="radiogroup" aria-label="Status" className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-white/5">
          {STATUS.map((s) => (
            <button key={s.id} type="button" role="radio" aria-checked={status === s.id} onClick={() => setStatus(s.id)} className={`rounded-md px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${status === s.id ? 'bg-white text-slate-900 shadow-depth-1 dark:bg-white/15 dark:text-white' : 'text-slate-500'}`}>
              {s.label}
            </button>
          ))}
        </div>
        {tiers.data && <span className="text-sm text-slate-500">{tiers.data.length} plan{tiers.data.length === 1 ? '' : 's'}</span>}
      </div>
      {tiers.isLoading && <Spinner />}
      {tiers.error && <Alert>Could not load plans.</Alert>}
      {tiers.data?.length === 0 && <EmptyState icon={Crown} title="No plans match">Change the search or status filter, or add a plan.</EmptyState>}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {tiers.data?.map((t) => (
          <TierCard key={t.id} tier={t} onEdit={() => setEditing(t)} onToggle={() => toggle.mutate(t)} onDelete={() => setDeleting(t)} busy={toggle.isPending && toggle.variables?.id === t.id} />
        ))}
      </div>
      <TierFormModal open={editing !== null} tier={editing && editing !== 'new' ? editing : undefined} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        title="Delete plan?"
        message={<>Delete <strong>{deleting?.name}</strong>? No school has used it, so nothing else changes.</>}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
