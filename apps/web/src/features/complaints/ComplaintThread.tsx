import { ArrowLeft, Check, EyeOff, Lock, MessageSquare, Send, ShieldCheck, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Field, Modal, Spinner, TextArea } from '@/components/ui';
import { AGAINST_LABEL, COMPLAINTS_KEY, complaintsService, SEVERITY_TONE, STATUS_LABEL, STATUS_TONE, useComplaintMeta, type ComplaintDetail } from '@/features/complaints/complaints';
import { timeAgo } from '@/features/communication/utils/notificationLinks';
import { useAction } from '@/lib/hooks/useAction';
import { onSubmit } from '@/lib/forms';

/**
 * One complaint as a conversation. `handler` is the principal / admin view (private notes, status
 * buttons, and who raised it unless anonymous); otherwise it is the complainant following their own.
 */
export function ComplaintThread({ id, handler, onBack, received = false }: { id: string; handler: boolean; onBack: () => void; /** The parent reading something the school sent them. */ received?: boolean }) {
  const kind = handler ? 'one' : received ? 'receivedOne' : 'mineOne';
  const q = useQuery({ queryKey: [...COMPLAINTS_KEY, kind, id], queryFn: () => (handler ? complaintsService.one(id) : received ? complaintsService.receivedOne(id) : complaintsService.mineOne(id)), refetchInterval: 30_000 });
  const categories = useComplaintMeta().data?.categories ?? [];
  const [text, setText] = useState('');
  const [internal, setInternal] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const c = q.data;
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [c?.messages.length]);

  const send = useAction(() => (handler ? complaintsService.handle(id, text.trim(), internal) : received ? complaintsService.replyReceived(id, text.trim()) : complaintsService.reply(id, text.trim())), { invalidate: [COMPLAINTS_KEY], onDone: () => setText(''), success: internal ? 'Private note saved' : 'Sent' });
  const move = useAction((v: { status: 'open' | 'in_review' | 'resolved' | 'closed'; note?: string }) => complaintsService.setStatus(id, v.status, v.note), { invalidate: [COMPLAINTS_KEY], success: (_r) => 'Status updated', onDone: () => { setResolving(false); setResolution(''); } });

  if (q.isLoading) return <Spinner />;
  if (!c) return <Card><Alert>This complaint could not be loaded.</Alert></Card>;
  const category = categories.find((x) => x.key === c.category)?.label ?? c.category;
  const canReply = c.status !== 'closed';
  /** Which side of the conversation is the reader: the handler, the sender, or the receiving parent. */
  const mine = (side: string) => (handler ? side === 'handler' : received ? side === 'recipient' : side === 'complainant');

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-base font-semibold uppercase tracking-wide text-primary-600 hover:underline lg:hidden dark:text-primary-300"><ArrowLeft size={16} /> All complaints</button>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-bold text-slate-500">{c.ticketNo}</span><Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge><Badge tone={SEVERITY_TONE[c.severity]}>{c.severity}</Badge>{c.anonymous && <Badge tone="slate"><EyeOff size={12} /> anonymous</Badge>}</div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{c.subject}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{category} · {c.sentTo ? `to ${c.sentTo.toLowerCase()} · ` : ''}about {AGAINST_LABEL[c.againstKind].toLowerCase()}{c.againstName ? `: ${c.againstName}` : ''} · {timeAgo(c.createdAt)}{handler && c.complainant ? ` · from ${c.complainant}` : ''}</p>
          </div>
          {handler && (
            <div className="flex flex-wrap gap-2" data-tour="complaint-actions">
              {c.status !== 'in_review' && c.status !== 'resolved' && c.status !== 'closed' && <Button variant="secondary" icon={ShieldCheck} loading={move.isPending} onClick={() => move.mutate({ status: 'in_review' })}>Start review</Button>}
              {(c.status === 'open' || c.status === 'in_review') && <Button icon={Check} onClick={() => setResolving(true)}>Mark resolved</Button>}
              {c.status === 'resolved' && <Button variant="secondary" icon={Lock} loading={move.isPending} onClick={() => move.mutate({ status: 'closed' })}>Close</Button>}
              {(c.status === 'resolved' || c.status === 'closed') && <Button variant="secondary" icon={Undo2} loading={move.isPending} onClick={() => move.mutate({ status: 'open' })}>Reopen</Button>}
            </div>
          )}
        </div>
        <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-500/5 p-4 text-base text-slate-800 dark:text-slate-100">{c.body}</p>
        {c.status === 'resolved' && <div className="mt-3"><Alert tone="success">Resolved{c.resolvedBy ? ` by ${c.resolvedBy}` : ''}{c.resolutionNote ? `: ${c.resolutionNote}` : '.'}</Alert></div>}
      </Card>

      <Card title="Conversation" icon={MessageSquare} tone="rose" padded={false}>
        <ul className="max-h-[28rem] space-y-3 overflow-y-auto p-4">
          {c.messages.map((m) => m.kind === 'event' ? (
            <li key={m.id} className="text-center text-xs text-slate-400">{m.body} · {timeAgo(m.createdAt)}</li>
          ) : (
            <li key={m.id} className={`flex ${mine(m.side) ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-base ${m.kind === 'note' ? 'border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100' : mine(m.side) ? 'bg-brand text-white' : 'bg-slate-500/10 text-slate-800 dark:text-slate-100'}`}>
                <div className="mb-0.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-80">{m.kind === 'note' && <Lock size={11} />}{m.kind === 'note' ? 'Private note' : m.from}<span className="font-normal normal-case opacity-70">{timeAgo(m.createdAt)}</span></div>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            </li>
          ))}
          <div ref={end} />
        </ul>
        {canReply ? (
          <form className="space-y-2 border-t border-slate-200 p-4 dark:border-white/10" onSubmit={onSubmit(() => text.trim() && send.mutate(undefined))}>
            <TextArea rows={3} maxLength={3000} value={text} onChange={(e) => setText(e.target.value)} placeholder={handler ? (internal ? 'Private note: only the principal and admin can read it…' : 'Reply to the complainant…') : 'Add more details or reply…'} aria-label="Your message" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              {handler ? <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300"><input type="checkbox" className="h-4 w-4" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Private note (the complainant will not see it)</label> : <span className="text-xs text-slate-400">{c.anonymous ? 'Your name stays hidden from the school.' : ''}</span>}
              <Button type="submit" icon={Send} loading={send.isPending} disabled={!text.trim()}>{internal ? 'Save note' : 'Send'}</Button>
            </div>
          </form>
        ) : <p className="border-t border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10">This complaint is closed.</p>}
      </Card>

      <Modal open={resolving} title="Mark as resolved" onClose={() => setResolving(false)} footer={<><Button variant="secondary" onClick={() => setResolving(false)}>Cancel</Button><Button icon={Check} loading={move.isPending} onClick={() => move.mutate({ status: 'resolved', note: resolution.trim() || undefined })}>Resolve</Button></>}>
        <Field label="How was it resolved? (optional)" hint="If you write something it is sent to the complainant. You can also resolve without a message."><TextArea rows={4} maxLength={3000} value={resolution} onChange={(e) => setResolution(e.target.value)} /></Field>
      </Modal>
    </div>
  );
}
export type { ComplaintDetail };
