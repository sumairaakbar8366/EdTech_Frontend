import { Plus, School, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, IconButton, Input } from '@/components/ui';
import { useStudentsAction } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import type { StudentDetail } from '@/features/students/types/student.types';
import { formatDate } from '@/lib/format';
import { onSubmit } from '@/lib/forms';

export function PreviousSchoolsCard({ student, editable }: { student: StudentDetail; editable: boolean }) {
  const [f, setF] = useState({ schoolName: '', lastClass: '' });
  const add = useStudentsAction(
    () => studentService.addPreviousSchool(student.id, { schoolName: f.schoolName, lastClass: f.lastClass || null }),
    'Previous school added',
    () => setF({ schoolName: '', lastClass: '' }),
  );
  const remove = useStudentsAction((pid: string) => studentService.removePreviousSchool(student.id, pid), 'Removed');
  return (
    <Card title="Previous schools" icon={School} tone="sky">
      {student.previousSchools.length === 0 && <p className="text-base text-slate-400">None recorded.</p>}
      <ul className="space-y-2">
        {student.previousSchools.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-lg bg-slate-500/5 px-3 py-2">
            <span><strong>{p.schoolName}</strong>{p.lastClass ? ` · ${p.lastClass}` : ''}{p.leftOn ? ` · left ${formatDate(p.leftOn)}` : ''}</span>
            {editable && <IconButton icon={Trash2} label="Remove previous school" tone="danger" onClick={() => remove.mutate(p.id)} />}
          </li>
        ))}
      </ul>
      {editable && (
        <form onSubmit={onSubmit(() => add.mutate(undefined))} className="mt-3 grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
          <Input required placeholder="School name" maxLength={150} value={f.schoolName} onChange={(e) => setF({ ...f, schoolName: e.target.value })} />
          <Input placeholder="Last class" maxLength={60} value={f.lastClass} onChange={(e) => setF({ ...f, lastClass: e.target.value })} />
          <Button type="submit" icon={Plus} loading={add.isPending}>Add</Button>
        </form>
      )}
    </Card>
  );
}
