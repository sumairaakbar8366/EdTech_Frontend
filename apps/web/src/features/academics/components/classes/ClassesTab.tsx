import { Layers, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, ConfirmDialog, EmptyState, Spinner } from '@/components/ui';
import { SheetActions } from '@/components/shared/SheetActions';
import { CLASS_EXPORT, CLASS_IMPORT, classRows } from '@/features/academics/utils/academicsSheet';
import { ClassCard } from '@/features/academics/components/classes/ClassCard';
import { ClassFormModal } from '@/features/academics/components/classes/ClassFormModal';
import { ClassSubjectsModal } from '@/features/academics/components/classes/ClassSubjectsModal';
import { SectionFormModal } from '@/features/academics/components/classes/SectionFormModal';
import { useAcademicsAction, useClasses } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { SchoolClass, Section } from '@/features/academics/types/academics.types';

type Deleting = { kind: 'class' | 'section'; id: string; name: string };

export function ClassesTab({ readOnly }: { readOnly: boolean }) {
  const classes = useClasses();
  const [editingClass, setEditingClass] = useState<SchoolClass | 'new' | null>(null);
  const [sectionTarget, setSectionTarget] = useState<{ schoolClass: SchoolClass; section?: Section } | null>(null);
  const [subjectsFor, setSubjectsFor] = useState<SchoolClass | null>(null);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  const remove = useAcademicsAction((d: Deleting) => (d.kind === 'class' ? academicsService.deleteClass(d.id) : academicsService.deleteSection(d.id)), 'Deleted', () => setDeleting(null));

  return (
    <>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <SheetActions fileName="Classes and sections" columns={CLASS_EXPORT} rows={async () => classRows(classes.data ?? [])} importSpec={readOnly ? undefined : CLASS_IMPORT} />
        {!readOnly && <Button icon={Plus} onClick={() => setEditingClass('new')}>New class</Button>}
      </div>
      {classes.isLoading && <Spinner />}
      {classes.data?.length === 0 && (
        <Card>
          <EmptyState icon={Layers} title="No classes yet" tone="magenta">Classes are school-wide grade levels (e.g. Grade 1). Sections of a class run at a specific campus.</EmptyState>
        </Card>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        {classes.data?.map((c) => (
          <ClassCard
            key={c.id}
            schoolClass={c}
            readOnly={readOnly}
            onEdit={() => setEditingClass(c)}
            onDelete={() => setDeleting({ kind: 'class', id: c.id, name: c.name })}
            onAddSection={() => setSectionTarget({ schoolClass: c })}
            onEditSection={(section) => setSectionTarget({ schoolClass: c, section })}
            onDeleteSection={(s) => setDeleting({ kind: 'section', id: s.id, name: `${c.name} ${s.name}` })}
            onManageSubjects={() => setSubjectsFor(c)}
          />
        ))}
      </div>
      {!readOnly && (
        <>
          <ClassFormModal target={editingClass} nextLevel={(classes.data?.at(-1)?.level ?? 0) + 1} onClose={() => setEditingClass(null)} />
          <SectionFormModal target={sectionTarget} onClose={() => setSectionTarget(null)} />
          <ClassSubjectsModal schoolClass={subjectsFor} onClose={() => setSubjectsFor(null)} />
        </>
      )}
      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${deleting?.kind}?`}
        message={`“${deleting?.name}” will be permanently deleted.`}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
