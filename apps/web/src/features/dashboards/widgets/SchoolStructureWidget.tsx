import { BookOpen, Building2, DoorOpen, Layers, Users } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { useAcademicsSummary } from '@/features/academics/hooks/useAcademics';

/** Campuses, classes, sections, subjects and rooms. */
export function SchoolStructureWidget() {
  const c = useAcademicsSummary().data?.counts;
  return (
    <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      <StatCard label="Campuses" value={c?.campuses ?? '–'} icon={Building2} tone="primary" hint="Active" />
      <StatCard label="Classes" value={c?.classes ?? '–'} icon={Layers} tone="magenta" />
      <StatCard label="Sections" value={c?.sections ?? '–'} icon={Users} tone="teal" />
      <StatCard label="Subjects" value={c?.subjects ?? '–'} icon={BookOpen} tone="amber" />
      <StatCard label="Rooms" value={c?.rooms ?? '–'} icon={DoorOpen} tone="sky" />
    </div>
  );
}
