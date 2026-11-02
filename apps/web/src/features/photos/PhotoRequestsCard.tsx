import { ArrowRight, Check, ImageUp, X } from 'lucide-react';
import { Avatar, Button, Card } from '@/components/ui';
import { photoService, usePhotoAction, usePhotoRequests } from '@/features/photos/photos';

/** Students and staff asking for a new profile picture: approve or decline. Hidden when none are waiting. */
export function PhotoRequestsCard() {
  const list = usePhotoRequests();
  const decide = usePhotoAction(photoService.decide, { success: 'Done' });
  if (!list.data?.length) return null;
  return (
    <Card title={`Picture change requests (${list.data.length})`} icon={ImageUp} tone="amber" className="mb-4" padded={false}>
      <ul className="divide-y divide-(--surface-border)">
        {list.data.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
            <div className="flex items-center gap-2">
              <Avatar photoKey={r.currentPhotoKey} name={r.name} size="md" />
              <ArrowRight size={16} className="text-slate-400" />
              <Avatar photoKey={r.newPhotoKey} name={r.name} size="md" ring />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-800 dark:text-slate-100">{r.name}</div>
              <div className="text-sm text-slate-500">{r.detail} · {new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={X} loading={decide.isPending && decide.variables?.id === r.id && !decide.variables.approve} onClick={() => decide.mutate({ id: r.id, approve: false })}>Decline</Button>
              <Button icon={Check} loading={decide.isPending && decide.variables?.id === r.id && decide.variables.approve} onClick={() => decide.mutate({ id: r.id, approve: true })}>Approve</Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
