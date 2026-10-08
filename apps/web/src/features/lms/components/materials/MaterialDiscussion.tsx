import { MessageSquareReply, Pin, PinOff, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, IconButton, Spinner, TextArea } from '@/components/ui';
import { LMS_KEY, useMaterialComments } from '@/features/lms/hooks/useLms';
import { lmsService } from '@/features/lms/services/lmsService';
import type { Comment } from '@/features/lms/types/lms.types';
import { formatDateTime } from '@/features/lms/utils/lms.utils';
import { useAction } from '@/lib/hooks/useAction';
import { onSubmit } from '@/lib/forms';

/** Threaded questions on a material; teachers pin, authors and teachers delete (page 10). */
export function MaterialDiscussion({ materialId, canManage, canComment }: { materialId: string; canManage: boolean; canComment: boolean }) {
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const comments = useMaterialComments(materialId);
  const invalidate = [[...LMS_KEY, 'comments', materialId]];
  const post = useAction(() => lmsService.postComment(materialId, body, replyTo?.id), { invalidate, onDone: () => { setBody(''); setReplyTo(null); } });
  const pin = useAction(lmsService.togglePin, { invalidate });
  const remove = useAction((c: Comment) => lmsService.deleteComment(c.id), { invalidate });

  const all = comments.data ?? [];
  const roots = all.filter((c) => !c.parentCommentId).sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  const repliesOf = (id: string) => all.filter((c) => c.parentCommentId === id);

  const renderComment = (c: Comment, reply = false) => (
    <div key={c.id} className={`rounded-xl px-3.5 py-2.5 ${c.isPinned ? 'bg-amber-500/10 ring-1 ring-amber-400/40' : 'bg-slate-500/5'} ${reply ? 'ml-8' : ''}`}>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-slate-800 dark:text-slate-100">{c.author.name}</span>
        {c.author.isStaff && <Badge tone="primary">teacher</Badge>}
        {c.isPinned && <Badge tone="amber"><Pin size={11} /> pinned</Badge>}
        <span className="text-slate-400">{formatDateTime(c.createdAt)}</span>
        <span className="ml-auto flex">
          {!reply && canComment && !c.deleted && <IconButton icon={MessageSquareReply} label="Reply" onClick={() => setReplyTo(c)} />}
          {canManage && !reply && !c.deleted && <IconButton icon={c.isPinned ? PinOff : Pin} label={c.isPinned ? 'Unpin' : 'Pin'} onClick={() => pin.mutate(c)} />}
          {c.canDelete && <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove.mutate(c)} />}
        </span>
      </div>
      <p className={`mt-0.5 whitespace-pre-wrap text-base ${c.deleted ? 'italic text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{c.deleted ? 'This comment was removed.' : c.body}</p>
    </div>
  );

  return (
    <section className="border-t border-slate-200 pt-4 dark:border-white/10">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Discussion ({all.filter((c) => !c.deleted).length})</h3>
      {comments.isLoading && <Spinner />}
      <div className="space-y-2">
        {roots.length === 0 && comments.isSuccess && <p className="text-sm text-slate-500">No questions yet.</p>}
        {roots.map((c) => (
          <div key={c.id} className="space-y-1.5">
            {renderComment(c)}
            {repliesOf(c.id).map((r) => renderComment(r, true))}
          </div>
        ))}
      </div>
      {canComment && (
        <form onSubmit={onSubmit(() => body.trim() && post.mutate(undefined))} className="mt-3 space-y-2">
          {replyTo && (
            <div className="flex items-center justify-between rounded-lg bg-primary-500/10 px-3 py-1.5 text-sm">
              <span>Replying to <strong>{replyTo.author.name}</strong></span>
              <button type="button" className="font-semibold text-primary-600" onClick={() => setReplyTo(null)}>Cancel</button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1"><TextArea aria-label="Comment" value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} placeholder="Ask a question or share a thought…" /></div>
            <Button type="submit" icon={Send} loading={post.isPending} disabled={!body.trim()}>Post</Button>
          </div>
        </form>
      )}
    </section>
  );
}
