import { useQueryClient } from '@tanstack/react-query';
import { Crown, Lock, Pencil, UserMinus, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Alert, Badge, Button, Card, ConfirmDialog, Field, IconButton, Input, Modal } from '@/components/ui';
import { EmailProofField } from '@/features/users/components/EmailProofField';
import { DASHBOARD_SECTIONS, LEADERSHIP_KEY, leadershipService, useLeadership, type AddLeaderResult, type LeaderSeat } from '@/features/users/leadership';
import { useUsersAction, type EmailProof } from '@/features/users/users';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Ticks for the parts of the principal's dashboard this person sees. */
function SectionPicker({ hidden, onChange }: { hidden: string[]; onChange: (h: string[]) => void }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {DASHBOARD_SECTIONS.map((s) => {
        const shown = !hidden.includes(s.key);
        return (
          <label key={s.key} className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 transition ${shown ? 'bg-primary-500/10 ring-primary-300 dark:ring-primary-500/40' : 'bg-slate-500/5 text-slate-500 ring-slate-200 dark:ring-white/10'}`}>
            <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={shown} onChange={() => onChange(shown ? [...hidden, s.key] : hidden.filter((k) => k !== s.key))} />
            {s.label}
          </label>
        );
      })}
    </div>
  );
}

function LeaderModal({ open, editing, onClose, onCreated }: { open: boolean; editing: LeaderSeat | null; onClose: () => void; onCreated: (r: AddLeaderResult) => void }) {
  const { data } = useLeadership();
  const qc = useQueryClient();
  const titles = data?.titles ?? [];
  const hasPrincipal = !!data?.seats.some((s) => s.titleKey === 'principal' && s.user.status === 'active');
  const [titleKey, setTitleKey] = useState('principal');
  const [custom, setCustom] = useState('');
  const [f, setF] = useState({ firstName: '', lastName: '', email: '' });
  const [proof, setProof] = useState<EmailProof | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const pick = (key: string) => { setTitleKey(key); setHidden(titles.find((t) => t.key === key)?.hidden ?? []); };

  useEffect(() => {
    if (!open) return;
    setF({ firstName: '', lastName: '', email: '' });
    setProof(null);
    if (editing) { setTitleKey(editing.titleKey); setCustom(editing.titleKey === 'custom' ? editing.titleLabel : ''); setHidden(editing.hiddenSections); }
    else { const first = hasPrincipal ? titles.find((t) => t.key !== 'principal')?.key ?? 'director' : 'principal'; setTitleKey(first); setCustom(''); setHidden(titles.find((t) => t.key === first)?.hidden ?? []); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, titles.length]);

  const add = useUsersAction(leadershipService.add, { success: 'Access given', onDone: (r) => { void qc.invalidateQueries({ queryKey: LEADERSHIP_KEY }); void qc.invalidateQueries({ queryKey: ['users'] }); onClose(); onCreated(r); }, toastErrors: false });
  const update = useUsersAction(leadershipService.update, { success: 'Saved', onDone: () => { void qc.invalidateQueries({ queryKey: LEADERSHIP_KEY }); onClose(); }, toastErrors: false });
  const error = add.error ?? update.error;
  const locked = (key: string) => key !== 'principal' && !data?.moreTitlesIncluded;
  const needsCustom = titleKey === 'custom';

  return (
    <Modal
      open={open}
      size="lg"
      title={editing ? `Change access · ${editing.user.firstName} ${editing.user.lastName}` : 'Give leadership access'}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="leader-form" loading={add.isPending || update.isPending} disabled={locked(titleKey) || (!editing && !proof)}>{editing ? 'Save' : 'Give access & email login'}</Button></>}
    >
      <form
        id="leader-form"
        onSubmit={onSubmit(() => (editing
          ? update.mutate({ userId: editing.userId, titleKey, ...(needsCustom && { customTitle: custom }), hiddenSections: hidden })
          : add.mutate({ titleKey, ...(needsCustom && { customTitle: custom }), ...f, ...(proof && { verification: proof }), hiddenSections: hidden })))}
        className="space-y-5"
      >
        {error && <Alert>{errorMessage(error, 'Could not save.')}</Alert>}
        <div>
          <div className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Role</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {titles.map((t) => {
              const on = titleKey === t.key;
              const taken = !editing && t.key === 'principal' && hasPrincipal;
              return (
                <button key={t.key} type="button" disabled={taken} onClick={() => pick(t.key)} className={`rounded-xl p-3 text-left ring-1 transition disabled:opacity-50 ${on ? 'bg-primary-500/10 ring-primary-400' : 'ring-slate-200 hover:bg-slate-50 dark:ring-white/10 dark:hover:bg-white/5'}`}>
                  <div className="flex items-center justify-between gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">{t.label}{locked(t.key) && <Lock size={13} className="text-amber-600" />}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{taken ? 'Your school already has a principal' : t.blurb}</div>
                </button>
              );
            })}
          </div>
          {needsCustom && <div className="mt-3"><Field label="Title"><Input required maxLength={60} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Section Head" /></Field></div>}
          {locked(titleKey) && (
            <div className="mt-3"><Alert tone="info">
              Director, Vice Principal and other roles are part of a paid plan. <Link to="/billing" className="font-semibold underline">Choose a plan</Link> to add them. The principal is always included.
            </Alert></div>
          )}
        </div>

        {!editing && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name"><Input required maxLength={80} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
              <Field label="Last name"><Input required maxLength={80} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
            </div>
            <EmailProofField email={f.email} onEmailChange={(email) => setF({ ...f, email })} onProof={setProof} label="Their own email" />
            <p className="text-xs text-slate-500">Press “Send code”, they read the 6-digit code to you, then type it. Their User ID and a one-time strong password are emailed to them, and the first thing they must do after signing in is choose a new password.</p>
          </div>
        )}

        <div>
          <div className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">What their dashboard shows</div>
          <p className="mb-2 text-xs text-slate-500">It is the principal’s dashboard; untick what this person should not see on it. You can change this any time.</p>
          <SectionPicker hidden={hidden} onChange={setHidden} />
        </div>
      </form>
    </Modal>
  );
}

/** Principal and other senior seats of the school, with one button to add the next. */
export function LeadershipCard({ onCreated }: { onCreated: (r: AddLeaderResult) => void }) {
  const { data } = useLeadership();
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ editing: LeaderSeat | null } | null>(null);
  const [removing, setRemoving] = useState<LeaderSeat | null>(null);
  const remove = useUsersAction(leadershipService.remove, { success: 'Access removed', onDone: () => { setRemoving(null); void qc.invalidateQueries({ queryKey: LEADERSHIP_KEY }); void qc.invalidateQueries({ queryKey: ['users'] }); } });
  const seats = data?.seats ?? [];
  const hasPrincipal = seats.some((s) => s.titleKey === 'principal' && s.user.status === 'active');
  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-primary-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Principal &amp; leadership</h2>
            <p className="text-xs text-slate-500">Give the principal — and on paid plans a director, vice principal and more — their own login and dashboard.</p>
          </div>
        </div>
        <Button icon={UserPlus} onClick={() => setModal({ editing: null })}>{hasPrincipal ? 'Add leadership access' : 'Give principal access'}</Button>
      </div>
      {seats.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
          {seats.map((s) => (
            <li key={s.userId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{s.user.firstName} {s.user.lastName} <Badge tone="primary">{s.titleLabel}</Badge> {s.user.status === 'disabled' && <Badge tone="rose">Disabled</Badge>}</div>
                <div className="truncate text-xs text-slate-500">{s.user.loginId} · {s.user.email} · {s.user.mustChangePassword ? 'has not signed in yet' : s.user.lastLoginAt ? 'signed in' : ''}</div>
                <div className="mt-0.5 text-xs text-slate-500">Sees {DASHBOARD_SECTIONS.length - s.hiddenSections.length} of {DASHBOARD_SECTIONS.length} dashboard parts</div>
              </div>
              <div className="flex gap-1">
                <IconButton label="Change role and dashboard" icon={Pencil} onClick={() => setModal({ editing: s })} />
                {s.user.status === 'active' && <IconButton label="Remove access" icon={UserMinus} onClick={() => setRemoving(s)} />}
              </div>
            </li>
          ))}
        </ul>
      )}
      <LeaderModal open={!!modal} editing={modal?.editing ?? null} onClose={() => setModal(null)} onCreated={onCreated} />
      <ConfirmDialog
        open={!!removing}
        title="Remove this access?"
        message={removing ? `${removing.user.firstName} ${removing.user.lastName} will be signed out and can no longer sign in. Their records stay.` : ''}
        confirmLabel="Remove access"
        loading={remove.isPending}
        onConfirm={() => removing && remove.mutate(removing.userId)}
        onClose={() => setRemoving(null)}
      />
    </Card>
  );
}
