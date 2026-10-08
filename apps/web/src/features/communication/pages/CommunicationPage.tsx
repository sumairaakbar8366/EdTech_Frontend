import { AreaLink } from '@/app/router/area';
import { SCHOOL_ROLES } from '@schoolerp/shared';
import { Megaphone, MessagesSquare, Send, Mail } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Card, Field, Input, PageHeader, TextArea } from '@/components/ui';
import { AnnouncementList } from '@/features/communication/components/AnnouncementList';
import { useCommunicationAction } from '@/features/communication/hooks/useCommunication';
import { communicationService } from '@/features/communication/services/communicationService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Admin communication: publish announcements to everyone or to chosen roles (page 11). */
export function CommunicationPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const send = useCommunicationAction(() => communicationService.announce({ title, body, targetRoles: roles }), {
    success: (r) => `Announcement sent to ${r.recipients} ${r.recipients === 1 ? 'person' : 'people'}`,
    onDone: () => {
      setTitle('');
      setBody('');
      setRoles([]);
    },
    toastErrors: false,
  });
  const toggle = (key: string) => setRoles((r) => (r.includes(key) ? r.filter((x) => x !== key) : [...r, key]));

  return (
    <div>
      <PageHeader
        title="Communication"
        sub="Announcements reach every chosen user's notifications instantly"
        icon={MessagesSquare}
        tone="rose"
        actions={<AreaLink to="/messages" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"><Mail size={16} /> Direct messages</AreaLink>}
      />
      <div className="grid gap-6 xl:grid-cols-[26rem_1fr]">
        <Card title="New announcement" icon={Megaphone} tone="primary" className="self-start">
          <form onSubmit={onSubmit(() => send.mutate(undefined))} className="space-y-4">
            {send.error && <Alert>{errorMessage(send.error, 'Could not send the announcement.')}</Alert>}
            <Field label="Title"><Input required maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Parent-teacher meeting on Friday" /></Field>
            <Field label="Message"><TextArea required maxLength={5000} rows={6} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
            <fieldset>
              <legend className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Send to</legend>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setRoles([])} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 transition ${roles.length === 0 ? 'bg-primary-500/15 text-primary-700 ring-primary-400 dark:text-primary-200' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/10'}`}>
                  Everyone
                </button>
                {SCHOOL_ROLES.filter((r) => r.key !== 'school_admin').map((r) => (
                  <button key={r.key} type="button" onClick={() => toggle(r.key)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 transition ${roles.includes(r.key) ? 'bg-primary-500/15 text-primary-700 ring-primary-400 dark:text-primary-200' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/10'}`}>
                    {r.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <Button type="submit" icon={Send} loading={send.isPending} className="w-full">Publish announcement</Button>
            <p className="text-xs text-slate-500">Delivered in-app now. Email, SMS and WhatsApp delivery switch on once those providers are connected.</p>
          </form>
        </Card>
        <div>
          <h2 className="mb-3 text-base font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Published</h2>
          <AnnouncementList canDelete />
        </div>
      </div>
    </div>
  );
}
