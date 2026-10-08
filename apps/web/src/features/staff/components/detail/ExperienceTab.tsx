import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, ConfirmDialog, EmptyState, Field, IconButton, IconTile, Input } from '@/components/ui';
import { useStaffAction } from '@/features/staff/hooks/useStaff';
import { staffService } from '@/features/staff/services/staffService';
import type { EmployeeDetail } from '@/features/staff/types/staff.types';
import { formatDate } from '@/lib/format';
import { onSubmit } from '@/lib/forms';

export function ExperienceTab({ employee, editable }: { employee: EmployeeDetail; editable: boolean }) {
  const blank = { organization: '', role: '', startDate: '', endDate: '' };
  const [form, setForm] = useState(blank);
  const [removing, setRemoving] = useState<string | null>(null);
  const add = useStaffAction(() => staffService.addExperience(employee.id, { ...form, endDate: form.endDate || null }), 'Experience added', () => setForm(blank));
  const remove = useStaffAction((xid: string) => staffService.removeExperience(employee.id, xid), 'Experience removed', () => setRemoving(null));
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Previous experience" icon={Briefcase} tone="sky" className="lg:col-span-2">
        {employee.experiences.length === 0 && <EmptyState icon={Briefcase} title="No previous experience recorded" tone="sky" />}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
          {employee.experiences.map((x) => (
            <li key={x.id} className="flex items-center gap-3 py-3">
              <IconTile icon={Briefcase} tone="sky" size="sm" />
              <div className="flex-1">
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{x.role}</div>
                <div className="text-base text-slate-500 dark:text-slate-400">{x.organization} · {formatDate(x.startDate)} – {x.endDate ? formatDate(x.endDate) : 'Present'}</div>
              </div>
              {editable && <IconButton icon={Trash2} label="Remove experience" tone="danger" onClick={() => setRemoving(x.id)} />}
            </li>
          ))}
        </ul>
      </Card>
      {editable && (
        <Card title="Add experience" icon={Plus} tone="teal">
          <form onSubmit={onSubmit(() => add.mutate(undefined))} className="space-y-3">
            <Field label="School / organization"><Input required maxLength={150} value={form.organization} onChange={(ev) => setForm({ ...form, organization: ev.target.value })} /></Field>
            <Field label="Role"><Input required maxLength={100} value={form.role} onChange={(ev) => setForm({ ...form, role: ev.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From"><Input type="date" required value={form.startDate} onChange={(ev) => setForm({ ...form, startDate: ev.target.value })} /></Field>
              <Field label="To" hint="Empty = present"><Input type="date" min={form.startDate} value={form.endDate} onChange={(ev) => setForm({ ...form, endDate: ev.target.value })} /></Field>
            </div>
            <Button type="submit" icon={Plus} className="w-full" loading={add.isPending}>Add</Button>
          </form>
        </Card>
      )}
      <ConfirmDialog open={!!removing} title="Remove experience?" message="This entry will be removed from the staff record." confirmLabel="Remove" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing)} onClose={() => setRemoving(null)} />
    </div>
  );
}
