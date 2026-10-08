import { Phone, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, IconButton, Input } from '@/components/ui';
import { useStudentsAction } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import type { StudentDetail } from '@/features/students/types/student.types';
import { onSubmit } from '@/lib/forms';

const MAX_CONTACTS = 5;

export function EmergencyContactsCard({ student, editable }: { student: StudentDetail; editable: boolean }) {
  const blank = { name: '', relationship: '', phone: '' };
  const [f, setF] = useState(blank);
  const add = useStudentsAction(() => studentService.addEmergencyContact(student.id, f), 'Contact added', () => setF(blank));
  const remove = useStudentsAction((cid: string) => studentService.removeEmergencyContact(student.id, cid), 'Contact removed');
  return (
    <Card title="Emergency contacts" icon={Phone} tone="amber">
      {student.emergencyContacts.length === 0 && <p className="text-base text-slate-400">None recorded.</p>}
      <ul className="space-y-2">
        {student.emergencyContacts.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg bg-slate-500/5 px-3 py-2">
            <span><strong>{c.name}</strong> <span className="text-slate-500">({c.relationship})</span> · {c.phone}</span>
            {editable && <IconButton icon={Trash2} label="Remove contact" tone="danger" onClick={() => remove.mutate(c.id)} />}
          </li>
        ))}
      </ul>
      {editable && student.emergencyContacts.length < MAX_CONTACTS && (
        <form onSubmit={onSubmit(() => add.mutate(undefined))} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Input required placeholder="Name" maxLength={120} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input required placeholder="Relationship" maxLength={60} value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value })} />
          <Input required type="tel" placeholder="Phone" maxLength={32} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <Button type="submit" icon={Plus} loading={add.isPending}>Add</Button>
        </form>
      )}
    </Card>
  );
}
