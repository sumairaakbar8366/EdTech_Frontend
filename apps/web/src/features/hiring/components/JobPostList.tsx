import { Badge } from '@/components/ui';
import { POST_TONE } from '@/features/hiring/constants';
import type { JobPost } from '@/features/hiring/types/hiring.types';
import { formatDate } from '@/lib/format';

/** Selectable list of vacancies with applicant and hired counts. */
export function JobPostList({ posts, selectedId, onSelect }: { posts: JobPost[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <button key={p.id} onClick={() => onSelect(p.id)} className={`surface w-full rounded-xl p-4 text-left transition ${selectedId === p.id ? 'ring-2 ring-primary-500' : 'hover:shadow-depth-3'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">{p.title}</div>
            <Badge tone={POST_TONE[p.status]}>{p.status}</Badge>
          </div>
          <div className="text-base text-slate-500 dark:text-slate-400">{p.campus.name}{p.department ? ` · ${p.department}` : ''}</div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-sm">
            <Badge tone="primary">{p.applicationCount ?? 0} applicants</Badge>
            <Badge tone="emerald">{p.byStatus?.hired ?? 0}/{p.openings} hired</Badge>
            {p.closingDate && <Badge>Closes {formatDate(p.closingDate)}</Badge>}
          </div>
        </button>
      ))}
    </div>
  );
}
