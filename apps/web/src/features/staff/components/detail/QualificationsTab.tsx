import { Award, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, ConfirmDialog, EmptyState, Field, IconButton, IconTile, Input } from '@/components/ui';
import { useStaffAction } from '@/features/staff/hooks/useStaff';
import { staffService } from '@/features/staff/services/staffService';
import type { EmployeeDetail } from '@/features/staff/types/staff.types';
import { onSubmit } from '@/lib/forms';

export function QualificationsTab({ employee, editable }: { employee: EmployeeDetail; editable: boolean }) {
  const blank = { degree: '', institution: '', yearCompleted: '', grade: '' };
  const [form, setForm] = useState(blank);
  const [removing, setRemoving] = useState<string | null>(null);
  const add = useStaffAction(
    () => staffService.addQualification(employee.id, { degree: form.degree, institution: form.institution, yearCompleted: form.yearCompleted ? Number(form.yearCompleted) : null, grade: form.grade || null }),
    'Qualification added',
    () => setForm(blank),
  );
  const remove = useStaffAction((qid: string) => staffService.removeQualification(employee.id, qid), 'Qualification removed', () => setRemoving(null));
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Qualifications" icon={Award} tone="fuchsia" className="lg:col-span-2">
        {employee.qualifications.length === 0 && <EmptyState icon={Award} title="No qualifications recorded" tone="fuchsia" />}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
          {employee.qualifications.map((q) => (
            <li key={q.id} className="flex items-center gap-3 py-3">
              <IconTile icon={Award} tone="fuchsia" size="sm" />
              <div className="flex-1">
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{q.degree}</div>
                <div className="text-base text-slate-500 dark:text-slate-400">{q.institution}{q.yearCompleted ? ` · ${q.yearCompleted}` : ''}{q.grade ? ` · Grade ${q.grade}` : ''}</div>
              </div>
              {editable && <IconButton icon={Trash2} label="Remove qualification" tone="danger" onClick={() => setRemoving(q.id)} />}
            </li>
          ))}
        </ul>
      </Card>
      {editable && (
        <Card title="Add qualification" icon={Plus} tone="teal">
          <form onSubmit={onSubmit(() => add.mutate(undefined))} className="space-y-3">
            <Field label="Degree / certificate"><Input required maxLength={150} value={form.degree} onChange={(ev) => setForm({ ...form, degree: ev.target.value })} /></Field>
            <Field label="Institution"><Input required maxLength={150} value={form.institution} onChange={(ev) => setForm({ ...form, institution: ev.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Year"><Input type="number" min={1950} max={2100} value={form.yearCompleted} onChange={(ev) => setForm({ ...form, yearCompleted: ev.target.value })} /></Field>
              <Field label="Grade"><Input maxLength={30} value={form.grade} onChange={(ev) => setForm({ ...form, grade: ev.target.value })} /></Field>
            </div>
            <Button type="submit" icon={Plus} className="w-full" loading={add.isPending}>Add</Button>
          </form>
        </Card>
      )}
      <ConfirmDialog open={!!removing} title="Remove qualification?" message="This qualification will be removed from the staff record." confirmLabel="Remove" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing)} onClose={() => setRemoving(null)} />
    </div>
  );
}
