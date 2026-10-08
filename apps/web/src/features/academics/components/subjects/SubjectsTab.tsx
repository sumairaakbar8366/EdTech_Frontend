import { BookOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, ConfirmDialog, EmptyState, Spinner } from '@/components/ui';
import { SheetActions } from '@/components/shared/SheetActions';
import { SUBJECT_EXPORT, SUBJECT_IMPORT } from '@/features/academics/utils/academicsSheet';
import { SubjectFormModal } from '@/features/academics/components/subjects/SubjectFormModal';
import { SubjectTable } from '@/features/academics/components/subjects/SubjectTable';
import { useAcademicsAction, useSubjects } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { Subject } from '@/features/academics/types/academics.types';

export function SubjectsTab({ readOnly }: { readOnly: boolean }) {
  const subjects = useSubjects();
  const [editing, setEditing] = useState<Subject | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);
  const remove = useAcademicsAction((id: string) => academicsService.deleteSubject(id), 'Subject deleted', () => setDeleting(null));

  return (
    <>
      <Card
        title="Subjects"
        icon={BookOpen}
        tone="amber"
        padded={false}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SheetActions compact fileName="Subjects" columns={SUBJECT_EXPORT} rows={async () => subjects.data ?? []} importSpec={readOnly ? undefined : SUBJECT_IMPORT} />
            {!readOnly && <Button icon={Plus} className="px-3 py-1.5 text-xs" onClick={() => setEditing('new')}>New subject</Button>}
          </div>
        }
      >
        {subjects.isLoading && <div className="px-5"><Spinner /></div>}
        {subjects.data?.length === 0 && <EmptyState icon={BookOpen} title="No subjects yet" tone="amber">Add subjects such as Mathematics (MATH) or English (ENG).</EmptyState>}
        {!!subjects.data?.length && <SubjectTable subjects={subjects.data} readOnly={readOnly} onEdit={setEditing} onDelete={setDeleting} />}
      </Card>
      {!readOnly && <SubjectFormModal subject={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        title="Delete subject?"
        message={`“${deleting?.name}” will be permanently deleted. Subjects still taught in a class cannot be deleted.`}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
