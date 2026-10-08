import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, ConfirmDialog, EmptyState, Field, IconButton, IconTile, Select } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';
import { useStaffAction } from '@/features/staff/hooks/useStaff';
import { staffService } from '@/features/staff/services/staffService';
import type { EmployeeDetail } from '@/features/staff/types/staff.types';
import { onSubmit } from '@/lib/forms';

/** Subjects a teacher teaches this year, and assigning new ones. */
export function TeachingTab({ employee, editable }: { employee: EmployeeDetail; editable: boolean }) {
  const classes = useClasses(editable);
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const sectionClass = classes.data?.find((c) => c.sections.some((s) => s.id === sectionId));
  const assign = useStaffAction(() => staffService.assignTeacher({ sectionId, subjectId, employeeId: employee.id }), 'Teacher assigned', () => setSubjectId(''));
  const remove = useStaffAction((aid: string) => staffService.removeAssignment(aid), 'Assignment removed', () => setRemoving(null));
  const current = employee.teacherAssignments.filter((a) => a.academicYear.isCurrent);
  const past = employee.teacherAssignments.filter((a) => !a.academicYear.isCurrent);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title={`Teaching this year${current[0] ? ` · ${current[0].academicYear.name}` : ''}`} icon={BookOpen} tone="magenta" className="lg:col-span-2">
        {current.length === 0 && <EmptyState icon={BookOpen} title="No subjects assigned this year" tone="magenta" />}
        <div className="grid gap-3 sm:grid-cols-2">
          {current.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg bg-slate-500/5 p-3 ring-1 ring-inset ring-slate-500/10">
              <IconTile icon={BookOpen} tone="magenta" size="sm" />
              <div className="flex-1">
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{a.subject.name}</div>
                <div className="text-base text-slate-500 dark:text-slate-400">{a.section.schoolClass.name} – {a.section.name} · {a.section.campus.code}</div>
              </div>
              {editable && <IconButton icon={Trash2} label="Remove assignment" tone="danger" onClick={() => setRemoving(a.id)} />}
            </div>
          ))}
        </div>
        {past.length > 0 && <p className="mt-4 text-base text-slate-500 dark:text-slate-400">Also taught {past.length} subject-section(s) in previous years.</p>}
      </Card>
      {editable && employee.status === 'active' && (
        <Card title="Assign subject" icon={Plus} tone="teal">
          <form onSubmit={onSubmit(() => assign.mutate(undefined))} className="space-y-3">
            <Field label="Class & section">
              <Select required value={sectionId} onChange={(ev) => { setSectionId(ev.target.value); setSubjectId(''); }}>
                <option value="" disabled>Select…</option>
                {classes.data?.map((c) => (
                  <optgroup key={c.id} label={c.name}>
                    {c.sections.map((s) => <option key={s.id} value={s.id}>{c.name} – {s.name} ({s.campus.code})</option>)}
                  </optgroup>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Select required value={subjectId} disabled={!sectionClass} onChange={(ev) => setSubjectId(ev.target.value)}>
                <option value="" disabled>{sectionClass ? 'Select…' : 'Choose a section first'}</option>
                {sectionClass?.classSubjects.map(({ subject }) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </Select>
            </Field>
            <p className="text-sm text-slate-500 dark:text-slate-400">Assigns for the current academic year. If another teacher has this subject in the section, they are replaced.</p>
            <Button type="submit" icon={Plus} className="w-full" loading={assign.isPending}>Assign</Button>
          </form>
        </Card>
      )}
      <ConfirmDialog open={!!removing} title="Remove assignment?" message="The teacher will no longer be assigned to this subject in this section." confirmLabel="Remove" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing)} onClose={() => setRemoving(null)} />
    </div>
  );
}
