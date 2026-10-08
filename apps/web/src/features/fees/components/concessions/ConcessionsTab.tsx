import { Award as AwardIcon, Pencil, Percent, Plus, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, ConfirmDialog, EmptyState, IconButton, Spinner } from '@/components/ui';
import { AwardModal } from '@/features/fees/components/concessions/AwardModal';
import { ConcessionModal } from '@/features/fees/components/concessions/ConcessionModal';
import { CONCESSION_KIND_TONE } from '@/features/fees/constants';
import { useAwards, useConcessions, useFeesAction } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import type { Award, Concession } from '@/features/fees/types/fee.types';
import { concessionValue, studentName } from '@/features/fees/utils/fee.utils';
import { formatDate } from '@/lib/format';

/** Discounts, scholarships and reliefs, and their awards to students (page 8: concessions). */
export function ConcessionsTab({ canEdit, focus = 'all' }: { canEdit: boolean; focus?: 'all' | 'discounts' | 'scholarships' }) {
  const [editing, setEditing] = useState<Concession | 'new' | null>(null);
  const [granting, setGranting] = useState(false);
  const [revoking, setRevoking] = useState<Award | null>(null);
  const concessions = useConcessions();
  const awards = useAwards();
  const revoke = useFeesAction(feeService.revokeAward, { success: 'Award revoked; future invoices will not apply it', onDone: () => setRevoking(null) });
  const shown = concessions.data?.filter((c) => focus === 'all' || (focus === 'scholarships' ? c.kind === 'scholarship' : c.kind !== 'scholarship'));

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
      <Card title="Concessions" icon={Percent} tone="teal" padded={false} actions={canEdit && <Button icon={Plus} onClick={() => setEditing('new')}>New</Button>}>
        {concessions.isLoading && <div className="px-5"><Spinner /></div>}
        {shown?.length === 0 && <EmptyState icon={Percent} title="No concessions defined" tone="teal">Sibling discounts, merit scholarships, staff-child relief…</EmptyState>}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
          {shown?.map((c) => (
            <li key={c.id} className={`flex items-center gap-3 px-5 py-3 ${c.isActive ? '' : 'opacity-60'}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  {c.name} <Badge tone={CONCESSION_KIND_TONE[c.kind]}>{c.kind}</Badge> {!c.isActive && <Badge tone="slate">inactive</Badge>}
                </div>
                <div className="text-sm text-slate-500">
                  {concessionValue(c)} off {c.category ? c.category.name : 'all fees'} · {c._count.awards} active award(s)
                </div>
              </div>
              {canEdit && <IconButton icon={Pencil} label="Edit concession" onClick={() => setEditing(c)} />}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Awarded to students" icon={AwardIcon} tone="magenta" padded={false} actions={canEdit && <Button icon={Plus} onClick={() => setGranting(true)}>Award</Button>}>
        {awards.isLoading && <div className="px-5"><Spinner /></div>}
        {awards.data?.length === 0 && <EmptyState icon={AwardIcon} title="No awards yet" tone="magenta">Award a concession to a student; it applies to invoices issued within its dates.</EmptyState>}
        {!!awards.data?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Concession</th>
                  <th className="px-5 py-3 font-semibold">Valid</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
                {awards.data.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{studentName(a.student)}</div>
                      <div className="text-sm text-slate-500">{a.student.admissionNo}</div>
                    </td>
                    <td className="px-5 py-3">
                      {a.discount.name} <span className="text-sm text-slate-500">· {concessionValue(a.discount)}</span>
                      <div className="text-sm text-slate-500">{a.reason}</div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{formatDate(a.validFrom)} – {formatDate(a.validUntil)}</td>
                    <td className="px-5 py-3"><Badge tone={a.status === 'active' ? 'emerald' : 'slate'}>{a.status}</Badge></td>
                    <td className="px-3 py-3">{canEdit && a.status === 'active' && <IconButton icon={XCircle} label="Revoke award" tone="danger" onClick={() => setRevoking(a)} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {canEdit && <ConcessionModal concession={editing} onClose={() => setEditing(null)} />}
      {canEdit && <AwardModal open={granting} concessions={concessions.data?.filter((c) => c.isActive) ?? []} onClose={() => setGranting(false)} />}
      <ConfirmDialog
        open={!!revoking}
        title="Revoke award"
        message={revoking ? `Stop applying ${revoking.discount.name} to ${studentName(revoking.student)}? Invoices already issued are not changed.` : ''}
        confirmLabel="Revoke"
        loading={revoke.isPending}
        onConfirm={() => revoking && revoke.mutate(revoking.id)}
        onClose={() => setRevoking(null)}
      />
    </div>
  );
}
