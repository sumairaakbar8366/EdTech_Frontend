import { GraduationCap, Users } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import { Badge, Card, EmptyState, IconTile, Spinner, Tilt } from '@/components/ui';
import { useMyChildren } from '@/features/students/hooks/useStudents';

/** A parent's children with their class; each opens the child's profile. Former pupils come last, marked. */
export function ChildrenWidget({ className = '' }: { className?: string }) {
  const children = useMyChildren();
  return (
    <Card title="My children" icon={Users} tone="primary" className={className}>
      {children.isLoading && <Spinner />}
      {children.data?.length === 0 && <EmptyState icon={Users} title="No children linked" tone="primary">Please contact the school office.</EmptyState>}
      <div className="stagger grid gap-3 sm:grid-cols-2">
        {[...(children.data ?? [])].sort((x, y) => Number(x.status !== 'active') - Number(y.status !== 'active')).map((c) => {
          const section = c.enrollments[0]?.section;
          const current = c.status === 'active';
          return (
            <Tilt key={c.id} max={5} className="rounded-xl">
              <AreaLink to={`/my-children/${c.id}`} data-tone="primary" className="surface tone-card focus-ring flex items-center gap-3 rounded-xl p-4">
                <IconTile icon={GraduationCap} tone="primary" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">{c.firstName} {c.lastName}</div>
                  <div className="text-sm text-slate-500">{current ? (section ? `${section.schoolClass.name} ${section.name}` : 'Not enrolled') : 'Former pupil'} · {c.admissionNo}</div>
                </div>
                {!current && <Badge tone="slate">{c.status === 'graduated' ? 'Graduated' : 'Left school'}</Badge>}
              </AreaLink>
            </Tilt>
          );
        })}
      </div>
    </Card>
  );
}
