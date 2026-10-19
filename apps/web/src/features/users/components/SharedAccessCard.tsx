import { Pencil, Share2, UserMinus, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Modal } from '@/components/ui';
import { SHAREABLE, sharedService, useSharedAccess, useUsersAction, type Credentials, type SharedAccess } from '@/features/users/users';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

type Access = Record<string, string>;
const toList = (a: Access) => Object.entries(a).filter(([, level]) => level).map(([module, level]) => ({ module, level }));
const levelLabel = (module: string, level: string) => SHAREABLE.find((s) => s.module === module)?.levels.find((l) => l.level === level)?.label ?? level;
const moduleLabel = (module: string) => SHAREABLE.find((s) => s.module === module)?.label ?? module;

/** Ticks for each shareable area: off, or one of its levels. */
function AccessPicker({ value, onChange }: { value: Access; onChange: (a: Access) => void }) {
  return (
    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
      {SHAREABLE.map((s) => (
        <div key={s.module} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s.label}</span>
          <div className="flex flex-wrap gap-1">
            {[{ level: '', label: 'No access' }, ...s.levels].map((l) => {
              const on = (value[s.module] ?? '') === l.level;
              return (
                <button
                  key={l.level || 'none'}
                  type="button"
                  onClick={() => onChange({ ...value, [s.module]: l.level })}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 transition ${on ? (l.level ? 'bg-primary-500/15 text-primary-700 ring-primary-400 dark:text-primary-200' : 'bg-slate-500/10 text-slate-600 ring-slate-300 dark:text-slate-300') : 'text-slate-500 ring-slate-200 hover:bg-slate-500/5 dark:ring-white/10'}`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShareModal({ open, editing, onClose, onCreated }: { open: boolean; editing: SharedAccess | null; onClose: () => void; onCreated: (c: Credentials) => void }) {
  const [f, setF] = useState({ firstName: '', lastName: '', email: '' });
  const [access, setAccess] = useState<Access>({});
  useEffect(() => {
    if (!open) return;
    setF({ firstName: '', lastName: '', email: '' });
    setAccess(editing ? Object.fromEntries(editing.access.map((a) => [a.module, a.level])) : { communication: 'crud' });
  }, [open, editing]);
  const share = useUsersAction(sharedService.share, { success: 'Access shared', onDone: (c) => { onClose(); onCreated(c); }, toastErrors: false });
  const update = useUsersAction(sharedService.update, { success: 'Access updated', onDone: onClose, toastErrors: false });
  const error = share.error ?? update.error;
  const list = toList(access);
  return (
    <Modal
      open={open}
      size="lg"
      title={editing ? `Change access · ${editing.label}` : 'Share access'}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="share-form" disabled={!list.length} loading={share.isPending || update.isPending}>{editing ? 'Save' : 'Share access'}</Button></>}
    >
      <form id="share-form" onSubmit={onSubmit(() => (editing ? update.mutate({ roleId: editing.roleId, access: list }) : share.mutate({ ...f, access: list })))} className="space-y-4">
        {error && <Alert>{errorMessage(error, 'Could not save the access.')}</Alert>}
        {!editing && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              They get their own login (an ADM User ID) and appear as <strong>Admin 2, Admin 3…</strong> in the activity log, so everything they do is traced to them.
              They never see school settings, billing, Users &amp; Access or the logs.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name"><Input required maxLength={80} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
              <Field label="Last name"><Input required maxLength={80} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="Their own email" hint="They sign in with this email; their User ID is emailed to them."><Input required type="email" maxLength={254} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field></div>
            </div>
          </>
        )}
        <div>
          <div className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">What they may use</div>
          <AccessPicker value={access} onChange={setAccess} />
        </div>
      </form>
    </Modal>
  );
}

/**
 * Shared access: the admin hands part of the work (e.g. sending notifications) to someone by email.
 * Each person is "Admin 2", "Admin 3"… with only the areas ticked; access can be changed or taken back.
 */
export function SharedAccessCard({ onCreated }: { onCreated: (c: Credentials) => void }) {
  const shared = useSharedAccess();
  const [modal, setModal] = useState<{ editing: SharedAccess | null } | null>(null);
  const [revoking, setRevoking] = useState<SharedAccess | null>(null);
  const revoke = useUsersAction(sharedService.revoke, { success: 'Access taken back', onDone: () => setRevoking(null) });
  const active = shared.data?.filter((s) => s.user?.status === 'active') ?? [];
  const past = shared.data?.filter((s) => s.user?.status !== 'active') ?? [];

  return (
    <Card title="Shared access (Admin 2, Admin 3…)" icon={Share2} className="mb-4" actions={<Button icon={UserPlus} onClick={() => setModal({ editing: null })}>Share access</Button>} padded={false}>
      {shared.data && active.length === 0 && (
        <EmptyState icon={Share2} title="You have not shared access yet">Too much to handle alone? Share only the parts you choose, e.g. sending notifications.</EmptyState>
      )}
      <ul className="divide-y divide-(--surface-border)">
        {active.map((s) => (
          <li key={s.roleId} className="flex flex-wrap items-start gap-3 px-5 py-3">
            <Badge tone="primary">{s.label}</Badge>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-800 dark:text-slate-100">{s.user?.firstName} {s.user?.lastName} <span className="font-mono text-sm font-normal text-slate-500">{s.user?.loginId}</span></div>
              <div className="text-sm text-slate-500">{s.user?.email}{s.sharedBy && ` · shared by ${s.sharedBy}`}{` · last sign-in ${s.user?.lastLoginAt ? new Date(s.user.lastLoginAt).toLocaleDateString() : 'never'}`}</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {s.access.map((a) => <span key={a.module} className="rounded-md bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">{moduleLabel(a.module)}: {levelLabel(a.module, a.level)}</span>)}
              </div>
            </div>
            <div className="flex gap-1">
              <IconButton icon={Pencil} label={`Change ${s.label}'s access`} onClick={() => setModal({ editing: s })} />
              <IconButton icon={UserMinus} label={`Take back ${s.label}'s access`} tone="danger" onClick={() => setRevoking(s)} />
            </div>
          </li>
        ))}
      </ul>
      {past.length > 0 && <p className="border-t border-(--surface-border) px-5 py-2.5 text-xs text-slate-500">Taken back: {past.map((s) => `${s.label} (${s.user?.firstName ?? '—'} ${s.user?.lastName ?? ''})`).join(', ')}. Their past activity stays in the log.</p>}

      <ShareModal open={!!modal} editing={modal?.editing ?? null} onClose={() => setModal(null)} onCreated={onCreated} />
      <ConfirmDialog
        open={!!revoking}
        title={`Take back ${revoking?.label}'s access?`}
        message={`${revoking?.user?.firstName ?? 'They'} will be signed out and cannot sign in again. What they did stays in the activity log.`}
        confirmLabel="Take back access"
        loading={revoke.isPending}
        onConfirm={() => revoking && revoke.mutate(revoking.roleId)}
        onClose={() => setRevoking(null)}
      />
    </Card>
  );
}
