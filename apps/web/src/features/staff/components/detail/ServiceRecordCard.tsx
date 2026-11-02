import { useQuery } from '@tanstack/react-query';
import { ScrollText } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { api } from '@/services/api/http';
import { formatDate } from '@/lib/format';

interface ServiceRecord {
  tenures: { id: string; role: string; name: string; loginId: string; email: string | null; startedAt: string; endedAt: string | null; endAction: string | null; endReason: string | null; replacedByName: string | null; endedByName: string | null }[];
  years: { label: string; signins: number; failedSignins: number; changes: number; risky: number; lastActive: string | null; areas: { area: string; count: number }[] }[];
}

const ROLE: Record<string, string> = { school_admin: 'School Admin', principal: 'Principal' };
const END: Record<string, string> = { suspended: 'Access suspended', resigned: 'Resigned', terminated: 'Terminated', role_removed: 'Role removed' };

/**
 * For a School Admin or Principal (current or former): each period in the role and, year by year,
 * what they did. Everything they did stays in the logs after they leave, so this can be checked later.
 */
export function ServiceRecordCard({ employeeId }: { employeeId: string }) {
  const record = useQuery({ queryKey: ['staff', 'service-record', employeeId], queryFn: () => api<ServiceRecord>(`/staff/${employeeId}/service-record`) });
  const d = record.data;
  if (!d?.tenures.length) return null;
  return (
    <Card title="Service record" icon={ScrollText} padded={false} className="mb-6">
      <ul className="divide-y divide-(--surface-border)">
        {d.tenures.map((t) => (
          <li key={t.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
            <Badge tone={t.role === 'principal' ? 'amber' : 'primary'}>{ROLE[t.role] ?? t.role}</Badge>
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-semibold text-slate-800 dark:text-slate-100">
                {formatDate(t.startedAt)} – {t.endedAt ? formatDate(t.endedAt) : <span className="text-emerald-600">present</span>}
                <span className="ml-2 font-mono text-xs font-normal text-slate-500">{t.loginId}{t.email ? ` · ${t.email}` : ''}</span>
              </div>
              {t.endedAt && (
                <div className="text-slate-500">
                  {END[t.endAction ?? ''] ?? t.endAction}{t.endReason ? `: ${t.endReason}` : ''}{t.replacedByName ? ` · replaced by ${t.replacedByName}` : ''}{t.endedByName ? ` · recorded by ${t.endedByName}` : ''}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      {d.years.length > 0 && (
        <div className="overflow-x-auto border-t border-(--surface-border)">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-white/[0.02]">
              <tr><th className="px-5 py-2.5">Year</th><th className="px-3 py-2.5 text-right">Sign-ins</th><th className="px-3 py-2.5 text-right">Changes</th><th className="px-3 py-2.5 text-right">Risky</th><th className="px-3 py-2.5">Main areas</th><th className="px-5 py-2.5">Last active</th></tr>
            </thead>
            <tbody className="divide-y divide-(--surface-border)">
              {d.years.map((y) => (
                <tr key={y.label}>
                  <td className="px-5 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{y.label}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{y.signins}{y.failedSignins > 0 && <span className="ml-1 text-xs text-rose-600">({y.failedSignins} failed)</span>}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{y.changes}</td>
                  <td className={`px-3 py-2.5 text-right tabular-nums ${y.risky ? 'font-bold text-rose-600' : ''}`}>{y.risky}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300">{y.areas.map((a) => `${a.area.replace(/-/g, ' ')} ${a.count}`).join(' · ') || '—'}</td>
                  <td className="whitespace-nowrap px-5 py-2.5 text-xs text-slate-500">{y.lastActive ? formatDate(y.lastActive) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="border-t border-(--surface-border) px-5 py-2.5 text-xs text-slate-500">Kept for good: nothing they did is deleted when they leave. Details of each change are in Activity.</p>
    </Card>
  );
}
