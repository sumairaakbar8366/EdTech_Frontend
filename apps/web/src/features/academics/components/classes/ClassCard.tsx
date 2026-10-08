import { BookOpen, Layers, MapPin, Pencil, Plus, Trash2, Users, X } from 'lucide-react';
import { Badge, Button, Card, IconButton } from '@/components/ui';
import type { SchoolClass, Section } from '@/features/academics/types/academics.types';

interface ClassCardProps {
  schoolClass: SchoolClass;
  readOnly: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddSection: () => void;
  onEditSection: (s: Section) => void;
  onDeleteSection: (s: Section) => void;
  onManageSubjects: () => void;
}

/** A class with its sections (per campus) and the subjects taught in it. */
export function ClassCard({ schoolClass: c, readOnly, onEdit, onDelete, onAddSection, onEditSection, onDeleteSection, onManageSubjects }: ClassCardProps) {
  return (
    <Card
      title={c.name}
      icon={Layers}
      tone="magenta"
      actions={
        <div className="flex items-center gap-1">
          <Badge tone="magenta">Level {c.level}</Badge>
          {!readOnly && (
            <>
              <IconButton icon={Pencil} label="Edit class" onClick={onEdit} />
              <IconButton icon={Trash2} label="Delete class" tone="danger" onClick={onDelete} />
            </>
          )}
        </div>
      }
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <Users size={14} /> Sections
      </div>
      <div className="flex flex-wrap gap-2">
        {c.sections.map((s) => (
          <span key={s.id} className="group inline-flex items-center gap-2 rounded-xl bg-primary-500/10 py-1.5 pl-3 pr-1.5 text-sm ring-1 ring-inset ring-primary-500/20">
            <span className="font-bold text-primary-700 dark:text-primary-300">{s.name}</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <MapPin size={11} /> {s.campus.code}
              {s.capacity ? ` · ${s.capacity} seats` : ''}
            </span>
            {!readOnly && (
              <span className="flex">
                <IconButton icon={Pencil} label={`Edit section ${s.name}`} onClick={() => onEditSection(s)} />
                <IconButton icon={X} label={`Delete section ${s.name}`} tone="danger" onClick={() => onDeleteSection(s)} />
              </span>
            )}
          </span>
        ))}
        {c.sections.length === 0 && <span className="text-sm text-slate-400">No sections yet.</span>}
        {!readOnly && <Button variant="ghost" icon={Plus} className="px-2.5 py-1.5 text-xs" onClick={onAddSection}>Section</Button>}
      </div>

      <div className="mb-2 mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <BookOpen size={14} /> Subjects
      </div>
      <div className="flex flex-wrap gap-1.5">
        {c.classSubjects.map(({ subject }) => <Badge key={subject.id} tone="amber">{subject.name}</Badge>)}
        {c.classSubjects.length === 0 && <span className="text-sm text-slate-400">No subjects assigned.</span>}
        {!readOnly && <Button variant="ghost" icon={Pencil} className="px-2.5 py-1 text-xs" onClick={onManageSubjects}>Manage</Button>}
      </div>
    </Card>
  );
}
