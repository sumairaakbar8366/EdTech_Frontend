import { BriefcaseBusiness, CircleX, Pencil, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, CompactNumber, Spinner } from '@/components/ui';
import { ApplicantModal } from '@/features/hiring/components/ApplicantModal';
import { CandidateModal } from '@/features/hiring/components/candidate/CandidateModal';
import { STAGES } from '@/features/hiring/constants';
import { usePipeline } from '@/features/hiring/hooks/useHiring';
import type { JobPost } from '@/features/hiring/types/hiring.types';

/** Kanban of a post's candidates by stage, plus closed candidates. */
export function PipelineBoard({ postId, canEdit, onEditPost }: { postId: string; canEdit: boolean; onEditPost: (p: JobPost) => void }) {
  const data = usePipeline(postId);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const post = data.data?.post;
  const apps = data.data?.applications ?? [];
  const closed = apps.filter((a) => a.status === 'rejected' || a.status === 'withdrawn');

  if (data.isLoading || !post) return <Spinner />;
  return (
    <div className="min-w-0">
      <Card
        title={post.title}
        icon={BriefcaseBusiness}
        tone="teal"
        actions={
          canEdit && (
            <div className="flex gap-2">
              <Button variant="secondary" icon={Pencil} className="px-3 py-1.5 text-sm" onClick={() => onEditPost(post)}>Edit post</Button>
              {post.status === 'open' && <Button icon={Plus} className="px-3 py-1.5 text-sm" onClick={() => setAdding(true)}>Add applicant</Button>}
            </div>
          )
        }
      >
        {post.description && <p className="mb-4 whitespace-pre-line text-base text-slate-600 dark:text-slate-300">{post.description}</p>}
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {STAGES.map((stage) => {
            const items = apps.filter((a) => a.status === stage.id);
            return (
              <div key={stage.id} className="w-52 shrink-0 rounded-lg bg-slate-100 p-2 dark:bg-white/[0.03]">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{stage.label}</span>
                  <Badge tone={stage.tone}><CompactNumber value={items.length} /></Badge>
                </div>
                <div className="space-y-2">
                  {items.map((a) => (
                    <button key={a.id} onClick={() => setOpenId(a.id)} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-depth-1 transition hover:border-primary-300 dark:border-white/10 dark:bg-[#111a2c]">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{a.firstName} {a.lastName}</div>
                      <div className="truncate text-sm text-slate-500 dark:text-slate-400">{a.education ?? a.email}</div>
                      {a.interviews[0]?.score && <div className="mt-1 flex items-center gap-1 text-sm text-amber-600"><Star size={12} /> {a.interviews[0].score}/10</div>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {closed.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-base text-slate-500 dark:text-slate-400">
            <CircleX size={16} /> Closed:
            {closed.map((a) => (
              <button key={a.id} onClick={() => setOpenId(a.id)} className="rounded-md px-2 py-0.5 ring-1 ring-slate-300 hover:bg-slate-100 dark:ring-white/10 dark:hover:bg-white/5">{a.firstName} {a.lastName} ({a.status})</button>
            ))}
          </div>
        )}
      </Card>
      {canEdit && <ApplicantModal open={adding} postId={postId} teaching={post.staffType === 'teaching'} onClose={() => setAdding(false)} />}
      {openId && <CandidateModal applicationId={openId} canEdit={canEdit} onClose={() => setOpenId(null)} />}
    </div>
  );
}
