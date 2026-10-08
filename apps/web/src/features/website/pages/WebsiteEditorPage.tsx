import { ExternalLink, Globe, ImagePlus, Images, Palette, Save, Star, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AreaLink } from '@/app/router/area';
import { Alert, Badge, Button, Card, ConfirmDialog, Field, Input, PageHeader, Select, Spinner, TextArea } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { CATEGORY_LABEL, mediaUrl, useWebsiteAction, useWebsiteAdmin, websiteService, type MediaCategory, type WebsiteMedia, type WebsiteSettings } from '@/features/website/website';

const EMPTY: WebsiteSettings = { published: true, tagline: '', about: '', principalName: '', principalMessage: '', phone: '', email: '', address: '', mapUrl: '', facebookUrl: '', admissionsOpen: true, careersOpen: true, heroMediaId: null };

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-(--surface-border) p-3">
      <input type="checkbox" className="mt-1 h-4 w-4 accent-orange-500" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span><span className="block font-semibold">{label}</span><span className="block text-sm text-slate-500">{hint}</span></span>
    </label>
  );
}

/** Admin: the school's public website (texts, switches, photo gallery). Empty texts are generated. */
export function WebsiteEditorPage() {
  const data = useWebsiteAdmin();
  const [f, setF] = useState<WebsiteSettings>(EMPTY);
  const [category, setCategory] = useState<MediaCategory>('campus');
  const [caption, setCaption] = useState('');
  const [removing, setRemoving] = useState<WebsiteMedia | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const save = useWebsiteAction(websiteService.save, 'Website saved');
  const uploadPhoto = useWebsiteAction(websiteService.uploadPhoto, 'Photo added', () => { setCaption(''); if (file.current) file.current.value = ''; });
  const remove = useWebsiteAction(websiteService.removePhoto, 'Photo removed', () => setRemoving(null));
  const setHero = useWebsiteAction((id: string) => websiteService.save({ heroMediaId: id }), 'Cover photo set');

  useEffect(() => {
    if (data.data) setF({ ...EMPTY, ...Object.fromEntries(Object.entries(data.data.website).map(([k, v]) => [k, v ?? (typeof EMPTY[k as keyof WebsiteSettings] === 'string' ? '' : v)])) } as WebsiteSettings);
  }, [data.data]);

  const text = (k: keyof WebsiteSettings) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = () => {
    const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || null : v])) as Partial<WebsiteSettings>;
    delete body.heroMediaId;
    save.mutate(body);
  };
  const media = data.data?.media ?? [];

  return (
    <div>
      <PageHeader
        title="School website"
        sub="Your public site at this address: built from your school data, finished with your texts and photos"
        icon={Globe}
        actions={<a href="/" target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"><ExternalLink size={16} /> View website</a>}
      />
      {data.isLoading && <Spinner />}
      {data.data && (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <form onSubmit={onSubmit(submit)} className="space-y-6">
            <Card title="Texts" icon={Globe} actions={<Button type="submit" icon={Save} loading={save.isPending}>Save</Button>}>
              <div className="grid gap-4">
                {save.error && <Alert>{errorMessage(save.error)}</Alert>}
                <Field label="Tagline" hint="One line under the school name, e.g. “Learning today, leading tomorrow”"><Input maxLength={160} value={f.tagline ?? ''} onChange={text('tagline')} /></Field>
                <Field label="About the school" hint="Leave empty to use the text generated from your classes, campuses and staff"><TextArea rows={5} maxLength={4000} value={f.about ?? ''} onChange={text('about')} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Principal's name"><Input maxLength={120} value={f.principalName ?? ''} onChange={text('principalName')} /></Field>
                  <div />
                </div>
                <Field label="Principal's message (optional)"><TextArea rows={4} maxLength={3000} value={f.principalMessage ?? ''} onChange={text('principalMessage')} /></Field>
              </div>
            </Card>
            <Card title="Contact" icon={Globe}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone"><Input maxLength={40} value={f.phone ?? ''} onChange={text('phone')} /></Field>
                <Field label="Email"><Input type="email" maxLength={254} value={f.email ?? ''} onChange={text('email')} /></Field>
                <div className="sm:col-span-2"><Field label="Address"><Input maxLength={300} value={f.address ?? ''} onChange={text('address')} /></Field></div>
                <Field label="Google Maps embed link" hint="Maps → Share → Embed a map → copy the https link"><Input type="url" maxLength={600} value={f.mapUrl ?? ''} onChange={text('mapUrl')} /></Field>
                <Field label="Facebook page"><Input type="url" maxLength={300} value={f.facebookUrl ?? ''} onChange={text('facebookUrl')} /></Field>
              </div>
            </Card>
            <Card title="Switches" icon={Globe}>
              <div className="grid gap-3">
                <Toggle label="Website is online" hint="Turn off to show a short “being updated” page" checked={f.published} onChange={(v) => setF({ ...f, published: v })} />
                <Toggle label="Accept admission applications online" hint="They arrive in Admissions as “Submitted”, marked as from the website" checked={f.admissionsOpen} onChange={(v) => setF({ ...f, admissionsOpen: v })} />
                <Toggle label="Show open jobs and accept applications" hint="Open posts from Staff → Hiring are listed; applications go to the pipeline" checked={f.careersOpen} onChange={(v) => setF({ ...f, careersOpen: v })} />
                <div className="flex flex-wrap justify-between gap-2 pt-1">
                  <AreaLink to="/settings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:underline dark:text-orange-300"><Palette size={15} /> Theme colour and logo (Settings)</AreaLink>
                  <Button type="submit" icon={Save} loading={save.isPending}>Save</Button>
                </div>
              </div>
            </Card>
          </form>

          <Card title="Photo gallery" icon={Images} actions={<Badge tone="slate">{media.length}/200</Badge>}>
            <form onSubmit={onSubmit(() => { const fl = file.current?.files?.[0]; if (fl) uploadPhoto.mutate({ file: fl, category, caption }); })} className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 dark:bg-white/3">
              {uploadPhoto.error && <Alert>{errorMessage(uploadPhoto.error)}</Alert>}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Category"><Select value={category} onChange={(e) => setCategory(e.target.value as MediaCategory)}>{(Object.keys(CATEGORY_LABEL) as MediaCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}</Select></Field>
                <Field label="Caption (optional)"><Input maxLength={160} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Annual sports day 2026" /></Field>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input ref={file} type="file" required accept="image/jpeg,image/png" className="text-sm" />
                <Button type="submit" icon={ImagePlus} loading={uploadPhoto.isPending}>Upload</Button>
              </div>
              <p className="text-xs text-slate-500">JPG or PNG, up to 8 MB. Only upload photos the school has permission to publish.</p>
            </form>
            {media.length === 0 && <p className="text-center text-sm text-slate-500">No photos yet. The website shows a clean layout without them.</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
              {media.map((m) => (
                <div key={m.id} className="group relative overflow-hidden rounded-lg border border-(--surface-border)">
                  <img src={mediaUrl(m.id)} alt={m.caption ?? ''} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <div className="flex items-center justify-between gap-1 px-2 py-1.5 text-xs">
                    <span className="truncate text-slate-600 dark:text-slate-300">{m.caption ?? CATEGORY_LABEL[m.category]}</span>
                    <span className="flex shrink-0 gap-1">
                      <button title="Use as cover photo" onClick={() => setHero.mutate(m.id)} className={`rounded p-1 ${f.heroMediaId === m.id ? 'text-orange-500' : 'text-slate-400 hover:text-slate-700'}`}><Star size={14} fill={f.heroMediaId === m.id ? 'currentColor' : 'none'} /></button>
                      <button title="Remove" onClick={() => setRemoving(m)} className="rounded p-1 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      <ConfirmDialog open={!!removing} title="Remove photo?" message="It disappears from the website straight away." confirmLabel="Remove" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing.id)} onClose={() => setRemoving(null)} />
    </div>
  );
}
