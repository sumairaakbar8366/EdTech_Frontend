import { Layers, Pencil, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, EmptyState, IconButton, Select, Spinner } from '@/components/ui';
import { useAcademicYears } from '@/features/academics/hooks/useAcademics';
import { AssignStructureModal } from '@/features/fees/components/structures/AssignStructureModal';
import { StructureModal } from '@/features/fees/components/structures/StructureModal';
import { FREQUENCY_LABEL } from '@/features/fees/constants';
import { useFeeStructures } from '@/features/fees/hooks/useFees';
import type { FeeStructure } from '@/features/fees/types/fee.types';
import { money } from '@/features/fees/utils/fee.utils';

/** Fee structures per class and academic year, and assignment to students (page 8). */
export function StructuresTab({ canEdit }: { canEdit: boolean }) {
  const [yearId, setYearId] = useState('');
  const [editing, setEditing] = useState<FeeStructure | 'new' | null>(null);
  const [assigning, setAssigning] = useState<FeeStructure | null>(null);
  const years = useAcademicYears();
  const structures = useFeeStructures(yearId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-56">
          <Select aria-label="Academic year" value={yearId} onChange={(e) => setYearId(e.target.value)}>
            <option value="">Current academic year</option>
            {years.data?.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </Select>
        </div>
        {canEdit && <Button icon={Plus} onClick={() => setEditing('new')}>New structure</Button>}
      </div>
      {structures.isLoading && <Spinner />}
      {structures.data?.length === 0 && (
        <Card><EmptyState icon={Layers} title="No fee structures for this year" tone="amber">Define what each class pays: tuition, transport, lab fees and so on.</EmptyState></Card>
      )}
      <div className="stagger grid gap-4 lg:grid-cols-2">
        {structures.data?.map((s) => {
          const monthly = s.items.filter((i) => i.frequency === 'monthly').reduce((t, i) => t + Number(i.amount), 0);
          return (
            <Card
              key={s.id}
              title={s.name}
              icon={Layers}
              tone={s.isActive ? 'amber' : 'slate'}
              actions={
                canEdit && (
                  <div className="flex gap-1">
                    {s.isActive && <IconButton icon={UserPlus} label="Assign to students" onClick={() => setAssigning(s)} />}
                    <IconButton icon={Pencil} label="Edit structure" onClick={() => setEditing(s)} />
                  </div>
                )
              }
            >
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge tone="magenta">{s.schoolClass.name}</Badge>
                <Badge tone="slate">{s.academicYear.name}</Badge>
                <Badge tone="teal">{s._count.assignments} student(s)</Badge>
                {!s.isActive && <Badge tone="rose">inactive</Badge>}
              </div>
              <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
                {s.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between py-1.5">
                    <span className="text-slate-700 dark:text-slate-200">{i.category.name} <span className="text-sm text-slate-500">· {FREQUENCY_LABEL[i.frequency]}</span></span>
                    <span className="font-semibold tabular-nums">{money(i.amount)}</span>
                  </li>
                ))}
              </ul>
              {monthly > 0 && <div className="mt-2 text-right text-sm text-slate-500">Monthly total <strong className="tabular-nums text-slate-800 dark:text-slate-100">{money(monthly)}</strong></div>}
            </Card>
          );
        })}
      </div>
      {canEdit && <StructureModal structure={editing} onClose={() => setEditing(null)} />}
      {canEdit && <AssignStructureModal structure={assigning} onClose={() => setAssigning(null)} />}
    </div>
  );
}
