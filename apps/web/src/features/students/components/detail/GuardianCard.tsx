import { KeyRound, Star } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { RELATION_LABEL } from '@/features/students/constants';
import type { StudentDetail } from '@/features/students/types/student.types';

type Link = StudentDetail['guardians'][number];

interface Props {
  link: Link;
  editable: boolean;
  canRemove: boolean;
  onMakePrimary: () => void;
  onCreateLogin: () => void;
  onRemove: () => void;
}

/** One parent/guardian of the student, with the admin's actions. */
export function GuardianCard({ link: { relationship, isPrimary, guardian: g }, editable, canRemove, onMakePrimary, onCreateLogin, onRemove }: Props) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-white">{g.firstName[0]}{g.lastName[0]}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">{g.firstName} {g.lastName}</span>
            <Badge tone="amber">{RELATION_LABEL[relationship]}</Badge>
            {isPrimary && <Badge tone="primary"><Star size={11} /> Primary</Badge>}
            {g.user && <Badge tone="teal"><KeyRound size={11} /> Login</Badge>}
          </div>
          <div className="mt-1 text-base text-slate-600 dark:text-slate-300">{g.phone}{g.email ? ` · ${g.email}` : ''}</div>
          {g.occupation && <div className="text-base text-slate-500">{g.occupation}</div>}
          {g._count.children > 1 && <div className="text-sm text-slate-500">Parent of {g._count.children} students</div>}
        </div>
      </div>
      {editable && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3 dark:border-white/5">
          {!isPrimary && <Button variant="ghost" className="px-3 py-1 text-sm" onClick={onMakePrimary}>Make primary</Button>}
          {!g.user && (
            <Button variant="secondary" className="px-3 py-1 text-sm" icon={KeyRound} disabled={!g.email} title={g.email ? undefined : 'Add an email first'} onClick={onCreateLogin}>Parent login</Button>
          )}
          {canRemove && <Button variant="ghost" className="px-3 py-1 text-sm text-rose-600" onClick={onRemove}>Remove</Button>}
        </div>
      )}
    </Card>
  );
}
