import { ArrowLeft, CalendarClock, Columns3, Megaphone, Plus, Table2, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AreaLink } from '@/app/router/area';
import { Button, Card, EmptyState, PageHeader, Spinner, StatCard, Tabs } from '@/components/ui';
import { ApplicationsTable } from '@/features/hiring/components/ApplicationsTable';
import { JobPostList } from '@/features/hiring/components/JobPostList';
import { JobPostModal } from '@/features/hiring/components/JobPostModal';
import { PipelineBoard } from '@/features/hiring/components/PipelineBoard';
import { useHiringSummary, useJobPosts } from '@/features/hiring/hooks/useHiring';
import type { JobPost } from '@/features/hiring/types/hiring.types';

/** Hiring (page 6): job posts and the applicant pipeline. */
export function HiringPage({ canEdit }: { canEdit: boolean }) {
  const [postId, setPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<JobPost | 'new' | null>(null);
  const [view, setView] = useState<'table' | 'board'>('table');
  const posts = useJobPosts();
  const summary = useHiringSummary();
  useEffect(() => {
    if (!postId && posts.data?.[0]) setPostId(posts.data[0].id);
  }, [posts.data, postId]);

  return (
    <div>
      <AreaLink to="/staff" className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold uppercase tracking-wide text-primary-600 hover:underline dark:text-primary-300">
        <ArrowLeft size={16} /> Staff directory
      </AreaLink>
      <PageHeader title="Hiring" sub="Vacancies, applicants, interviews and selection" icon={UserPlus} tone="teal" actions={canEdit && <Button icon={Plus} onClick={() => setPostForm('new')}>New job post</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Open posts" value={summary.data?.openPosts ?? '–'} icon={Megaphone} tone="teal" />
        <StatCard label="Candidates in pipeline" value={summary.data?.inPipeline ?? '–'} icon={Users} tone="primary" />
        <StatCard label="Upcoming interviews" value={summary.data?.interviewsUpcoming ?? '–'} icon={CalendarClock} tone="magenta" />
      </div>
      {posts.isLoading && <Spinner />}
      {posts.data?.length === 0 && <Card><EmptyState icon={Megaphone} title="No job posts yet" tone="teal">Create a vacancy to start collecting applications.</EmptyState></Card>}
      {!!posts.data?.length && <Tabs tabs={[{ id: 'table', label: 'Applicants table', icon: Table2 }, { id: 'board', label: 'Board by post', icon: Columns3 }]} value={view} onChange={setView} />}
      {!!posts.data?.length && view === 'table' && <ApplicationsTable posts={posts.data} canEdit={canEdit} />}
      {!!posts.data?.length && view === 'board' && (
        <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
          <JobPostList posts={posts.data} selectedId={postId} onSelect={setPostId} />
          {postId && <PipelineBoard postId={postId} canEdit={canEdit} onEditPost={setPostForm} />}
        </div>
      )}
      {canEdit && <JobPostModal post={postForm} onClose={() => setPostForm(null)} onCreated={setPostId} />}
    </div>
  );
}
