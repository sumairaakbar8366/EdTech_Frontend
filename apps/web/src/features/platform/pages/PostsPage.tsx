import { Eye, EyeOff, ImagePlus, Megaphone, Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Modal, PageHeader, Select, Spinner, TextArea } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useAction } from '@/lib/hooks/useAction';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { api, upload } from '@/services/api/http';

export type PostKind = 'award' | 'scholarship' | 'event' | 'news';
interface PostImage { id: string; caption: string | null; fileName: string }
interface Post { id: string; kind: PostKind; title: string; body: string; eventName: string | null; eventDate: string | null; location: string | null; schoolName: string | null; published: boolean; publishedAt: string; images: PostImage[] }
type PostInput = { kind: PostKind; title: string; body: string; eventName?: string; eventDate?: string; location?: string; schoolName?: string; published: boolean };
export const POST_KIND: Record<PostKind, string> = { award: 'Award', scholarship: 'Scholarship', event: 'Event', news: 'News' };
const KEY = ['owner-posts'] as const;
const svc = {
  list: () => api<Post[]>('/platform/posts'),
  save: (id: string | null, b: PostInput) => (id ? api<Post>(`/platform/posts/${id}`, { method: 'PUT', body: b }) : api<Post>('/platform/posts', { method: 'POST', body: b })),
  remove: (id: string) => api(`/platform/posts/${id}`, { method: 'DELETE' }),
  addImage: (id: string, file: File, caption: string) => { const f = new FormData(); f.set('file', file); if (caption) f.set('caption', caption); return upload<PostImage>(`/platform/posts/${id}/images`, f); },
  removeImage: (id: string) => api(`/platform/posts/images/${id}`, { method: 'DELETE' }),
};
export const postImageUrl = (id: string) => `/api/public/posts/image/${id}`;
const orUndef = (v: string) => v.trim() || undefined;

function PostModal({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const [saved, setSaved] = useState<Post | null>(post);
  const [f, setF] = useState({ kind: (post?.kind ?? 'award') as PostKind, title: post?.title ?? '', body: post?.body ?? '', eventName: post?.eventName ?? '', eventDate: post?.eventDate?.slice(0, 10) ?? '', location: post?.location ?? '', schoolName: post?.schoolName ?? '', published: post?.published ?? true });
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const save = useAction(() => svc.save(saved?.id ?? null, { kind: f.kind, title: f.title.trim(), body: f.body.trim(), eventName: orUndef(f.eventName), eventDate: orUndef(f.eventDate), location: orUndef(f.location), schoolName: orUndef(f.schoolName), published: f.published }), { success: 'Post saved', invalidate: [KEY], onDone: (p) => setSaved({ ...p, images: saved?.images ?? p.images ?? [] }), toastErrors: false });
  const live = useQuery({ queryKey: KEY, queryFn: svc.list });
  const current = live.data?.find((p) => p.id === saved?.id) ?? saved;

  async function addFiles(files: FileList | null) {
    if (!files?.length || !current) return;
    setBusy(true); setError(null);
    try { for (const file of Array.from(files)) await svc.addImage(current.id, file, caption.trim()); setCaption(''); await live.refetch(); } catch (e) { setError(errorMessage(e, 'The photo could not be added.')); } finally { setBusy(false); }
  }
  const removeImg = useAction((id: string) => svc.removeImage(id), { success: 'Photo removed', invalidate: [KEY] });

  return (
    <Modal open size="xl" title={post ? 'Edit post' : 'New post'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>{current ? 'Done' : 'Cancel'}</Button><Button type="submit" form="post-form" loading={save.isPending} disabled={!f.title.trim() || !f.body.trim()}>{current ? 'Save changes' : 'Save & add photos'}</Button></>}>
      <div className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <form id="post-form" className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit(() => { setError(null); save.mutate(undefined, { onError: (e) => setError(errorMessage(e)) }); })}>
          <Field label="Kind"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as PostKind })}>{(Object.keys(POST_KIND) as PostKind[]).map((k) => <option key={k} value={k}>{POST_KIND[k]}</option>)}</Select></Field>
          <Field label="Title" required><Input required maxLength={150} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Scholarship awards in Lahore" /></Field>
          <div className="sm:col-span-2"><Field label="What happened" required><TextArea rows={5} required maxLength={5000} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field></div>
          <Field label="Event name"><Input maxLength={150} value={f.eventName} onChange={(e) => setF({ ...f, eventName: e.target.value })} placeholder="Annual awards ceremony" /></Field>
          <Field label="Event date"><Input type="date" value={f.eventDate} onChange={(e) => setF({ ...f, eventDate: e.target.value })} /></Field>
          <Field label="Place"><Input maxLength={150} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
          <Field label="School (if it is about one)"><Input maxLength={150} value={f.schoolName} onChange={(e) => setF({ ...f, schoolName: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-base font-semibold sm:col-span-2"><input type="checkbox" className="h-4 w-4" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} /> Show on the public website</label>
        </form>
        <div className="border-t border-slate-200 pt-4 dark:border-white/10">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Photos</h3>
          {!current ? <p className="text-sm text-slate-500">Save the post first, then add photos.</p> : (
            <>
              <div className="flex flex-wrap items-end gap-3"><div className="min-w-[14rem] flex-1"><Field label="Caption for the next photos (optional)"><Input value={caption} maxLength={200} onChange={(e) => setCaption(e.target.value)} placeholder="The winners with their certificates" /></Field></div>
                <label className={`focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand px-4 py-2 text-base font-bold uppercase tracking-wide text-white shadow-depth-1 hover:brightness-110 ${busy ? 'pointer-events-none opacity-60' : ''}`}><ImagePlus size={16} /> {busy ? 'Uploading…' : 'Add photos'}<input type="file" accept="image/jpeg,image/png" multiple className="sr-only" onChange={(e) => { void addFiles(e.target.files); e.target.value = ''; }} /></label></div>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{current.images.map((im) => (
                <li key={im.id} className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
                  {current.published ? <img src={postImageUrl(im.id)} alt={im.caption ?? im.fileName} className="aspect-4/3 w-full object-cover" /> : <div className="flex aspect-4/3 items-center justify-center bg-slate-500/10 p-2 text-center text-xs text-slate-500">{im.fileName}<br />(visible once published)</div>}
                  <div className="flex items-center justify-between gap-1 px-2 py-1 text-xs"><span className="truncate text-slate-500">{im.caption ?? ''}</span><IconButton icon={Trash2} label="Remove photo" tone="danger" onClick={() => removeImg.mutate(im.id)} /></div>
                </li>))}</ul>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** Owner console: write posts for the public website (awards, scholarships, events, news) with photos, no code changes needed. */
export function PostsPage() {
  const posts = useQuery({ queryKey: KEY, queryFn: svc.list });
  const [editing, setEditing] = useState<Post | 'new' | null>(null);
  const [removing, setRemoving] = useState<Post | null>(null);
  const remove = useAction((id: string) => svc.remove(id), { success: 'Post deleted', invalidate: [KEY], onDone: () => setRemoving(null) });
  return (
    <div>
      <PageHeader title="Website posts" sub="Share awards, scholarships, events and news on the public site" icon={Megaphone} tone="magenta" actions={<Button icon={Plus} onClick={() => setEditing('new')} data-tour="post-new">New post</Button>} />
      {posts.isLoading && <Spinner />}
      {posts.data?.length === 0 && <Card><EmptyState icon={Newspaper} title="No posts yet" tone="magenta">After an awards ceremony or a scholarship, add the photos and a few lines here. They appear on the public website under “Latest from Skool EdTech”.</EmptyState></Card>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.data?.map((p) => (
          <Card key={p.id} padded={false}>
            {p.images[0] && p.published ? <img src={postImageUrl(p.images[0].id)} alt="" className="aspect-16/9 w-full object-cover" /> : <div className="flex aspect-16/9 items-center justify-center bg-slate-500/10 text-slate-400"><Newspaper size={32} /></div>}
            <div className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2"><Badge tone="primary">{POST_KIND[p.kind]}</Badge>{p.published ? <Badge tone="emerald"><Eye size={12} /> live</Badge> : <Badge tone="slate"><EyeOff size={12} /> hidden</Badge>}{p.images.length > 0 && <span className="text-xs text-slate-500">{p.images.length} photo(s)</span>}</div>
              <h3 className="font-bold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{p.body}</p>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{[p.eventName, p.location, p.eventDate && formatDate(p.eventDate)].filter(Boolean).join(' · ') || formatDate(p.publishedAt)}</span><span className="flex"><IconButton icon={Pencil} label="Edit post" onClick={() => setEditing(p)} /><IconButton icon={Trash2} label="Delete post" tone="danger" onClick={() => setRemoving(p)} /></span></div>
            </div>
          </Card>
        ))}
      </div>
      {editing && <PostModal post={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!removing} title="Delete this post?" message={`“${removing?.title ?? ''}” and its photos will be removed from the website.`} confirmLabel="Delete" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing.id)} onClose={() => setRemoving(null)} />
    </div>
  );
}
