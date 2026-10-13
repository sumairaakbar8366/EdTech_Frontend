import { BadgeCheck, Copy, Globe, Plus, ShieldQuestion, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, IconButton, Input, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { useSubscription } from '@/features/billing/billing';
import { DomainAddon } from '@/features/billing/components/DomainAddon';
import { useSchoolSettings, useSettingsAction } from '@/features/settings/hooks/useSettings';
import { settingsService } from '@/features/settings/services/settingsService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Custom domains: add, prove ownership through DNS, choose the primary address. */
export function DomainsCard() {
  const toast = useToast();
  const view = useSchoolSettings();
  // Your own domain is a paid add-on (or part of a plan that includes it); otherwise our free address is used.
  const allowed = useSubscription().data?.features.includes('custom_domain') ?? false;
  const [hostname, setHostname] = useState('');
  const add = useSettingsAction(settingsService.addDomain, { success: 'Domain added; now add the DNS record', onDone: () => setHostname(''), toastErrors: false });
  const verify = useSettingsAction(settingsService.verifyDomain, { success: 'Domain verified; it works now', toastErrors: false });
  const primary = useSettingsAction(settingsService.makePrimary, { success: 'Primary domain set' });
  const remove = useSettingsAction(settingsService.removeDomain, { success: 'Domain removed' });
  const copy = (text: string) => void navigator.clipboard?.writeText(text).then(() => toast.success('Copied'));
  return (
    <Card title="Custom domains" icon={Globe} tone="sky">
      <p className="mb-4 text-slate-600 dark:text-slate-300">
        Your school always works at <strong>{view.data?.school.address}</strong>. You can also use your own address, such as portal.yourschool.edu.
      </p>
      {!allowed && <div className="mb-4"><DomainAddon /></div>}
      {allowed && <form onSubmit={onSubmit(() => add.mutate(hostname))} className="mb-4 flex flex-wrap gap-2">
        <div className="min-w-[16rem] flex-1"><Input aria-label="Domain" required value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="portal.yourschool.edu" /></div>
        <Button type="submit" icon={Plus} loading={add.isPending}>Add domain</Button>
      </form>}
      {add.error && <div className="mb-3"><Alert>{errorMessage(add.error)}</Alert></div>}
      {verify.error && <div className="mb-3"><Alert>{errorMessage(verify.error)}</Alert></div>}
      {view.isLoading && <Spinner />}
      {view.data?.domains.length === 0 && <EmptyState icon={Globe} title="No custom domains" tone="sky" />}
      <ul className="space-y-3">
        {view.data?.domains.map((d) => (
          <li key={d.id} className="rounded-xl bg-slate-500/5 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{d.hostname}</span>
              {d.verifiedAt ? <Badge tone="emerald"><BadgeCheck size={12} /> verified</Badge> : <Badge tone="amber"><ShieldQuestion size={12} /> awaiting DNS</Badge>}
              {d.isPrimary && <Badge tone="primary"><Star size={12} /> primary</Badge>}
              <span className="ml-auto flex gap-1">
                {!d.verifiedAt && <Button variant="secondary" loading={verify.isPending && verify.variables === d.id} onClick={() => verify.mutate(d.id)}>Verify</Button>}
                {d.verifiedAt && !d.isPrimary && <Button variant="ghost" icon={Star} onClick={() => primary.mutate(d.id)}>Make primary</Button>}
                <IconButton icon={Trash2} label="Remove domain" tone="danger" onClick={() => remove.mutate(d.id)} />
              </span>
            </div>
            {!d.verifiedAt && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-slate-600 dark:text-slate-300">At your domain provider, add <strong>one</strong> of these records, then press Verify:</p>
                {[
                  ['CNAME', d.hostname, d.cnameTarget],
                  ['TXT', d.txtName, d.txtValue],
                ].map(([type, name, value]) => (
                  <div key={type} className="grid grid-cols-[4rem_1fr_1fr_auto] items-center gap-2 rounded-lg bg-white/60 px-3 py-2 font-mono text-xs dark:bg-white/5">
                    <span className="font-bold">{type}</span>
                    <span className="truncate" title={name}>{name}</span>
                    <span className="truncate" title={value}>{value}</span>
                    <IconButton icon={Copy} label={`Copy ${type} value`} onClick={() => copy(value!)} />
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
