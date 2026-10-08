import { History } from 'lucide-react';
import { Card, StatusBadge } from '@/components/ui';
import { STATUS_LABEL, STATUS_TONE } from '@/features/staff/constants';
import type { EmployeeDetail } from '@/features/staff/types/staff.types';

const DOT: Record<string, string> = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };

/** Timeline of employment status changes. */
export function EmploymentHistoryCard({ employee: e }: { employee: EmployeeDetail }) {
  return (
    <Card title="Employment history" icon={History} tone="slate">
      <ol className="relative space-y-5 border-l-2 border-slate-200 pl-6 dark:border-white/10">
        {e.statusHistory.map((h) => (
          <li key={h.id} className="relative">
            <span className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full ring-4 ring-white dark:ring-[#111a2c] ${DOT[STATUS_TONE[h.toStatus]] ?? 'bg-slate-400'}`} />
            <div className="flex flex-wrap items-center gap-2">
              {h.fromStatus && <><StatusBadge status={h.fromStatus} tones={STATUS_TONE} labels={STATUS_LABEL} /><span className="text-slate-400">→</span></>}
              <StatusBadge status={h.toStatus} tones={STATUS_TONE} labels={STATUS_LABEL} />
              <span className="text-sm text-slate-500 dark:text-slate-400">{new Date(h.changedAt).toLocaleString()}</span>
            </div>
            {h.reason && <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{h.reason}</p>}
          </li>
        ))}
      </ol>
    </Card>
  );
}
