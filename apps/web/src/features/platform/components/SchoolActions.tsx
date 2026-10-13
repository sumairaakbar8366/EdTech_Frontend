import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, Modal, Select } from '@/components/ui';
import { CONSOLE_KEY } from '@/features/platform/hooks/useConsole';
import { SCHOOLS_KEY, useTiers } from '@/features/platform/hooks/usePlatform';
import { consoleService } from '@/features/platform/services/consoleService';
import type { Phase } from '@/features/platform/types/console.types';
import { errorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { onSubmit } from '@/lib/forms';
import { useAction } from '@/lib/hooks/useAction';

export const PHASE_LABEL: Record<Phase, string> = { trial: 'Free trial', active: 'Paid', grace: 'Grace', expired: 'Locked' };
export const PHASE_TONE = { trial: 'primary', active: 'emerald', grace: 'amber', expired: 'rose' } as const;

/**
 * Opens a school as its admin in a new tab. The tab is opened first (in the click) so pop-up
 * blockers allow it, then pointed at the one-time support link.
 */
export async function openAsAdmin(schoolId: string): Promise<void> {
  const tab = window.open('about:blank', '_blank');
  try {
    const { url } = await consoleService.support(schoolId);
    if (tab) tab.location.href = url;
    else window.location.assign(url);
  } catch (e) {
    tab?.close();
    throw e;
  }
}

export interface PlanTarget {
  id: string;
  name: string;
  phase: Phase;
  tier: { code: string; name: string } | null;
  billingCycle: string | null;
  endsAt: string | null;
}

/** Owner sets a school's plan by hand: extend / restart a trial, or grant a paid plan until a date. */
export function ManagePlanModal({ school, onClose }: { school: PlanTarget | null; onClose: () => void }) {
  const tiers = useTiers({ status: 'active' });
  const [f, setF] = useState({ tierCode: '', status: 'trialing' as 'trialing' | 'active', endsOn: '', billingCycle: 'monthly' as 'monthly' | 'annual' });
  useEffect(() => {
    if (!school) return;
    const end = school.endsAt ? new Date(school.endsAt) : new Date();
    const next = new Date(Math.max(end.getTime(), Date.now()) + 14 * 86_400_000);
    setF({ tierCode: school.tier?.code ?? 'growth', status: school.phase === 'active' ? 'active' : 'trialing', endsOn: next.toISOString().slice(0, 10), billingCycle: (school.billingCycle as 'monthly' | 'annual') ?? 'monthly' });
  }, [school]);
  const save = useAction(consoleService.setSubscription, { success: 'Plan updated', invalidate: [CONSOLE_KEY, SCHOOLS_KEY], onDone: onClose, toastErrors: false });
  if (!school) return null;
  return (
    <Modal open title={`Plan · ${school.name}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="plan-form" loading={save.isPending}>Save</Button></>}>
      <form id="plan-form" onSubmit={onSubmit(() => save.mutate({ id: school.id, ...f }))} className="space-y-4">
        {save.error && <Alert>{errorMessage(save.error)}</Alert>}
        <p className="text-sm text-slate-600 dark:text-slate-300">Now: <strong>{PHASE_LABEL[school.phase]}</strong>{school.tier && <> · {school.tier.name}</>}{school.endsAt && <> · ends {formatDate(school.endsAt)}</>}. Saving replaces it at once (a locked school unlocks).</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kind">
            <Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as 'trialing' | 'active' })}>
              <option value="trialing">Free trial (every feature)</option>
              <option value="active">Paid plan (granted by you)</option>
            </Select>
          </Field>
          <Field label="Plan">
            <Select value={f.tierCode} onChange={(e) => setF({ ...f, tierCode: e.target.value })}>{tiers.data?.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}</Select>
          </Field>
          <Field label="Ends on"><Input type="date" required min={new Date().toISOString().slice(0, 10)} value={f.endsOn} onChange={(e) => setF({ ...f, endsOn: e.target.value })} /></Field>
          {f.status === 'active' && (
            <Field label="Billing cycle"><Select value={f.billingCycle} onChange={(e) => setF({ ...f, billingCycle: e.target.value as 'monthly' | 'annual' })}><option value="monthly">Monthly</option><option value="annual">Yearly</option></Select></Field>
          )}
        </div>
      </form>
    </Modal>
  );
}
