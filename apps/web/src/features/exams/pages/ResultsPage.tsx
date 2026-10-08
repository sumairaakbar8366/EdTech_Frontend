import { Award, BadgeCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Card, EmptyState, PageHeader, Spinner, Tilt } from '@/components/ui';
import { ReportCardModal } from '@/features/exams/components/ReportCardModal';
import { useMyReportCards, useResultChildren } from '@/features/exams/hooks/useExams';
import { formatDate } from '@/lib/format';

/** Published results and report cards for a student, or a parent's children. */
export function ResultsPage() {
  const children = useResultChildren();
  const [childId, setChildId] = useState<string | undefined>();
  const [viewing, setViewing] = useState<string | null>(null);
  useEffect(() => {
    if (!childId && children.data?.[0]) setChildId(children.data[0].id);
  }, [children.data, childId]);
  const cards = useMyReportCards(childId, children.isSuccess);
  return (
    <div>
      <PageHeader title="Results" sub="Published exam results and report cards" icon={BadgeCheck} tone="emerald" />
      {children.data && children.data.length > 1 && (
        <div role="tablist" className="mb-4 flex flex-wrap gap-2">
          {children.data.map((c) => (
            <button key={c.id} role="tab" aria-selected={c.id === childId} onClick={() => setChildId(c.id)} className={`focus-ring rounded-full px-4 py-1.5 text-base font-semibold transition ${c.id === childId ? 'bg-brand text-white' : 'surface text-slate-700 dark:text-slate-200'}`}>
              {c.firstName} {c.lastName}
            </button>
          ))}
        </div>
      )}
      {cards.isLoading && <Spinner />}
      {cards.data?.length === 0 && <Card><EmptyState icon={Award} title="No results published yet" tone="emerald">Report cards appear here once the school publishes exam results.</EmptyState></Card>}
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.data?.map((c) => (
          <Tilt key={c.id} max={6} className="rounded-xl">
            <button onClick={() => setViewing(c.id)} data-tone={c.passed ? 'emerald' : 'rose'} className="surface tone-card focus-ring block w-full rounded-xl p-5 text-left">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{c.exam.name}</div>
                  <div className="text-sm text-slate-500">{c.section.schoolClass.name} · {c.section.name} · {formatDate(c.exam.startDate)}</div>
                </div>
                <span className="tilt-pop font-display text-5xl font-bold text-brand">{c.grade}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone="primary">{Number(c.percentage)}%</Badge>
                {c.rank && <Badge tone="amber">Position {c.rank}</Badge>}
                <Badge tone={c.passed ? 'emerald' : 'rose'}>{c.passed ? 'Passed' : 'Not passed'}</Badge>
              </div>
            </button>
          </Tilt>
        ))}
      </div>
      <ReportCardModal cardId={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
