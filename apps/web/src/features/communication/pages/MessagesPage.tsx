import { ArrowLeft, MessagesSquare, Plus, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button, Card, EmptyState, PageHeader, Spinner, TextArea } from '@/components/ui';
import { NewThreadModal } from '@/features/communication/components/NewThreadModal';
import { useCommunicationAction, useThread, useThreads } from '@/features/communication/hooks/useCommunication';
import { communicationService } from '@/features/communication/services/communicationService';
import { timeAgo } from '@/features/communication/utils/notificationLinks';
import { onSubmit } from '@/lib/forms';

/** Parent ↔ teacher conversations (parent "Teacher Communication", teacher "Messages"). */
export function MessagesPage({ title = 'Messages', sub = 'Private conversations about a student' }: { title?: string; sub?: string }) {
  const [params, setParams] = useSearchParams();
  const active = params.get('thread');
  const [composing, setComposing] = useState(false);
  const threads = useThreads();
  const select = (id: string | null) => setParams(id ? { thread: id } : {}, { replace: true });

  return (
    <div>
      <PageHeader title={title} sub={sub} icon={MessagesSquare} tone="rose" actions={<Button icon={Plus} onClick={() => setComposing(true)}>New message</Button>} />
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <Card padded={false} className={active ? 'hidden lg:block' : ''}>
          {threads.isLoading && <div className="p-5"><Spinner /></div>}
          {threads.data?.length === 0 && <EmptyState icon={MessagesSquare} title="No conversations yet" tone="rose">Start one with “New message”.</EmptyState>}
          <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
            {threads.data?.map((t) => (
              <li key={t.id}>
                <button onClick={() => select(t.id)} className={`relative flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-primary-500/5 ${t.id === active ? 'bg-primary-500/10' : ''}`}>
                  {t.id === active && <motion.span layoutId="thread-active" className="absolute inset-y-0 left-0 w-1 bg-brand" />}
                  <span className="flex items-center justify-between gap-2">
                    <span className={`truncate ${t.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>{t.subject}</span>
                    <span className="shrink-0 text-xs text-slate-400">{timeAgo(t.lastMessageAt)}</span>
                  </span>
                  <span className="truncate text-sm text-slate-500">{t.others.map((o) => o.name).join(', ')} · {t.student.firstName} {t.student.lastName}</span>
                  {t.lastMessage && <span className="truncate text-sm text-slate-400">{t.lastMessage.body}</span>}
                  {t.unread && <span className="absolute right-3 top-1/2 h-2 w-2 rounded-full bg-magenta-500" aria-label="Unread" />}
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <div className={active ? '' : 'hidden lg:block'}>
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div key={active} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <Conversation id={active} onBack={() => select(null)} />
              </motion.div>
            ) : (
              <Card><EmptyState icon={MessagesSquare} title="Choose a conversation" tone="rose" /></Card>
            )}
          </AnimatePresence>
        </div>
      </div>
      <NewThreadModal open={composing} onClose={() => setComposing(false)} onStarted={(id) => { setComposing(false); select(id); }} />
    </div>
  );
}

function Conversation({ id, onBack }: { id: string; onBack: () => void }) {
  const thread = useThread(id);
  const [body, setBody] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const reply = useCommunicationAction(() => communicationService.reply(id, body), { onDone: () => setBody('') });
  const count = thread.data?.messages.length ?? 0;
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [count]);
  const t = thread.data;
  return (
    <Card padded={false}>
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3 dark:border-white/5">
        <button onClick={onBack} className="rounded p-1 text-slate-500 hover:bg-slate-500/10 lg:hidden" aria-label="Back to conversations"><ArrowLeft size={18} /></button>
        <div className="min-w-0">
          <div className="truncate font-bold uppercase tracking-wide text-slate-900 dark:text-white">{t?.subject ?? '…'}</div>
          {t && <div className="truncate text-sm text-slate-500">About {t.student.firstName} {t.student.lastName} · {t.participants.map((p) => p.name).join(', ')}</div>}
        </div>
      </div>
      <div className="max-h-[55vh] min-h-[16rem] space-y-3 overflow-y-auto px-5 py-4">
        {thread.isLoading && <Spinner />}
        {t?.messages.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.mine ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md bg-slate-500/10 text-slate-800 dark:text-slate-100'}`}>
              {!m.mine && <div className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-300">{m.senderName}</div>}
              <p className="whitespace-pre-wrap">{m.body}</p>
              <div className={`mt-0.5 text-right text-xs ${m.mine ? 'text-white/70' : 'text-slate-400'}`}>{timeAgo(m.createdAt)}</div>
            </div>
          </motion.div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={onSubmit(() => body.trim() && reply.mutate(undefined))} className="flex items-end gap-2 border-t border-slate-200 p-3 dark:border-white/5">
        <div className="flex-1"><TextArea aria-label="Reply" rows={2} maxLength={5000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply…" /></div>
        <Button type="submit" icon={Send} loading={reply.isPending} disabled={!body.trim()}>Send</Button>
      </form>
    </Card>
  );
}
