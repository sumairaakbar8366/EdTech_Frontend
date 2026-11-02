import { Award, CalendarCheck, Users, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { AreaLink } from '@/app/router/area';
import { Avatar, Badge, Card, EmptyState, Spinner } from '@/components/ui';
import { money } from '@/features/fees/utils/fee.utils';
import { useChildrenOverview, useMyChildren } from '@/features/students/hooks/useStudents';
import type { ChildOverview } from '@/features/students/types/student.types';

function Stat({ icon: Icon, tile, label, value }: { icon: typeof Users; tile: string; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tile}`}><Icon size={15} /></span>
      <span className="flex-1 text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <span className="text-right font-display text-lg font-bold">{value}</span>
    </div>
  );
}

function fees(o: ChildOverview | undefined) {
  if (!o) return <span className="text-slate-400">–</span>;
  if (o.feesDue <= 0) return <span className="text-emerald-600 dark:text-emerald-400">Paid</span>;
  const due = o.nextDueDate ? new Date(o.nextDueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : null;
  return (
    <span className={o.overdueInvoices ? 'text-rose-600 dark:text-rose-400' : 'text-orange-600 dark:text-orange-400'}>
      {o.overdueInvoices ? 'Overdue' : 'Due'} {money(o.feesDue)}
      {due && <span className="block text-xs font-semibold text-slate-500">by {due}</span>}
    </span>
  );
}

/**
 * A parent's children as cards: picture, class, attendance this year, fees still to pay and the
 * latest published result. Each card opens the child's profile; former pupils come last.
 */
export function ChildrenWidget({ className = '' }: { className?: string }) {
  const children = useMyChildren();
  const overview = useChildrenOverview();
  const list = [...(children.data ?? [])].sort((x, y) => Number(x.status !== 'active') - Number(y.status !== 'active'));
  return (
    <Card title="My children" icon={Users} tone="primary" className={className}>
      {children.isLoading && <Spinner />}
      {children.data?.length === 0 && <EmptyState icon={Users} title="No children linked" tone="primary">Please contact the school office.</EmptyState>}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((c) => {
          const section = c.enrollments[0]?.section;
          const current = c.status === 'active';
          const o = overview.data?.find((x) => x.studentId === c.id);
          const name = `${c.firstName} ${c.lastName}`;
          return (
            <AreaLink key={c.id} to={`/my-children/${c.id}`} className="surface card-3d focus-ring flex flex-col items-center p-5 text-center">
              <Avatar photoKey={c.photoKey} name={name} size="xl" ring />
              <div className="mt-3 font-display text-xl font-bold text-slate-900 dark:text-white">{name}</div>
              <div className="text-sm text-slate-500">{current ? (section ? `${section.schoolClass.name} ${section.name}` : 'Not enrolled') : 'Former pupil'} · {c.admissionNo}</div>
              {!current && <div className="mt-1"><Badge tone="slate">{c.status === 'graduated' ? 'Graduated' : 'Left school'}</Badge></div>}
              <div className="mt-4 w-full divide-y divide-(--surface-border) border-t border-(--surface-border) text-left">
                <Stat icon={CalendarCheck} tile="bg-primary-500/15 text-primary-700 dark:text-primary-300" label="Attendance" value={<span className="text-primary-700 dark:text-primary-300">{o?.attendancePercent != null ? `${o.attendancePercent}%` : '–'}</span>} />
                <Stat icon={Wallet} tile="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" label="Fees" value={fees(o)} />
                <Stat
                  icon={Award}
                  tile="bg-violet-500/15 text-violet-700 dark:text-violet-300"
                  label={o?.latestResult ? `Result · ${o.latestResult.exam}` : 'Result'}
                  value={<span className={o?.latestResult && !o.latestResult.passed ? 'text-rose-600' : 'text-violet-700 dark:text-violet-300'}>{o?.latestResult ? o.latestResult.grade : '–'}</span>}
                />
              </div>
            </AreaLink>
          );
        })}
      </div>
    </Card>
  );
}
