import { CalendarRange, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, ConfirmDialog, EmptyState, Spinner } from '@/components/ui';
import { TermFormModal } from '@/features/academics/components/years/TermFormModal';
import { YearCard } from '@/features/academics/components/years/YearCard';
import { YearFormModal } from '@/features/academics/components/years/YearFormModal';
import { useAcademicsAction, useAcademicYears } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { AcademicYear, Term } from '@/features/academics/types/academics.types';

type Deleting = { kind: 'year' | 'term'; id: string; name: string };

export function YearsTab({ readOnly }: { readOnly: boolean }) {
  const years = useAcademicYears();
  const [editingYear, setEditingYear] = useState<AcademicYear | 'new' | null>(null);
  const [termTarget, setTermTarget] = useState<{ year: AcademicYear; term?: Term } | null>(null);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  const setCurrent = useAcademicsAction((id: string) => academicsService.setCurrentYear(id), 'Current year updated');
  const remove = useAcademicsAction((d: Deleting) => (d.kind === 'year' ? academicsService.deleteYear(d.id) : academicsService.deleteTerm(d.id)), 'Deleted', () => setDeleting(null));

  return (
    <>
      {!readOnly && (
        <div className="mb-4 flex justify-end">
          <Button icon={Plus} onClick={() => setEditingYear('new')}>New academic year</Button>
        </div>
      )}
      {years.isLoading && <Spinner />}
      {years.data?.length === 0 && (
        <Card>
          <EmptyState icon={CalendarRange} title="No academic years yet" tone="magenta">Create your first academic year. It becomes the current year automatically.</EmptyState>
        </Card>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        {years.data?.map((y) => (
          <YearCard
            key={y.id}
            year={y}
            readOnly={readOnly}
            settingCurrent={setCurrent.isPending}
            onMakeCurrent={() => setCurrent.mutate(y.id)}
            onEdit={() => setEditingYear(y)}
            onDelete={() => setDeleting({ kind: 'year', id: y.id, name: y.name })}
            onAddTerm={() => setTermTarget({ year: y })}
            onEditTerm={(term) => setTermTarget({ year: y, term })}
            onDeleteTerm={(t) => setDeleting({ kind: 'term', id: t.id, name: t.name })}
          />
        ))}
      </div>
      {!readOnly && <YearFormModal year={editingYear} onClose={() => setEditingYear(null)} />}
      {!readOnly && <TermFormModal target={termTarget} onClose={() => setTermTarget(null)} />}
      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${deleting?.kind === 'year' ? 'academic year' : 'term'}?`}
        message={deleting?.kind === 'year' ? `“${deleting.name}” and all of its terms will be permanently deleted.` : `“${deleting?.name}” will be permanently deleted.`}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
