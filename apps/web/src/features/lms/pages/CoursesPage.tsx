import { BookOpen, FileText, NotebookPen, User } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import { Card, EmptyState, IconTile, PageHeader, Spinner, Tilt, type Tone } from '@/components/ui';
import { useChildSwitch } from '@/features/lms/hooks/useChildSwitch';
import { useCourses } from '@/features/lms/hooks/useLms';

const TONES: Tone[] = ['magenta', 'sky', 'teal', 'amber', 'primary', 'emerald', 'orange', 'fuchsia', 'rose'];

/** Course grid (page 10): admins see every course, teachers theirs, students and parents their class's. */
export function CoursesPage({ title = 'Learning', sub = 'Courses, learning material and assignments' }: { title?: string; sub?: string }) {
  const { childId, ready, switcher } = useChildSwitch();
  const courses = useCourses(childId, ready);
  return (
    <div>
      <PageHeader title={title} sub={sub} icon={BookOpen} tone="magenta" />
      {switcher}
      {courses.isLoading && <Spinner />}
      {courses.data?.length === 0 && (
        <Card><EmptyState icon={BookOpen} title="No courses yet" tone="magenta">Courses appear once teachers are assigned to subjects for the current academic year.</EmptyState></Card>
      )}
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {courses.data?.map((c, i) => {
          const tone = TONES[i % TONES.length]!;
          return (
            <Tilt key={c.id} max={6} className="rounded-xl">
              <AreaLink
                to={`/lms/courses/${c.id}${childId ? `?studentId=${childId}` : ''}`}
                data-tone={tone}
                className="dashboard-link-tile focus-ring flex h-full flex-col rounded-xl p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="tilt-pop"><IconTile icon={BookOpen} tone={tone} /></span>
                  <div className="min-w-0">
                    <div className="truncate font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{c.subject.name}</div>
                    <div className="text-sm text-slate-500">{c.section.schoolClass.name} · Section {c.section.name}</div>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-sm text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1"><User size={14} /> {c.teacher ?? 'No teacher'}</span>
                  <span className="inline-flex items-center gap-1"><FileText size={14} /> {c._count.materials}</span>
                  <span className="inline-flex items-center gap-1"><NotebookPen size={14} /> {c._count.assignments}</span>
                </div>
              </AreaLink>
            </Tilt>
          );
        })}
      </div>
    </div>
  );
}
