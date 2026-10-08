import { Users } from 'lucide-react';
import { Card, EmptyState, PageHeader, Spinner } from '@/components/ui';
import { ChildCard } from '@/features/students/components/ChildCard';
import { useMyChildren } from '@/features/students/hooks/useStudents';

/** Parent area: one card per child (page 4 "My Children"). */
export function MyChildrenPage() {
  const children = useMyChildren();
  return (
    <div>
      <PageHeader title="My Children" sub="Your children at this school" icon={Users} tone="emerald" />
      {children.isLoading && <Spinner />}
      {children.data?.length === 0 && <Card><EmptyState icon={Users} title="No children linked to your account" tone="emerald">Please contact the school office.</EmptyState></Card>}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {children.data?.map((c) => <ChildCard key={c.id} child={c} />)}
      </div>
    </div>
  );
}
