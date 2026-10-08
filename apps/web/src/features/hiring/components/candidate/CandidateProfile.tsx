import { Mail, Phone } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import { Badge } from '@/components/ui';
import { STAGES } from '@/features/hiring/constants';
import type { JobApplication } from '@/features/hiring/types/hiring.types';
import { formatDate } from '@/lib/format';

/** Contact line and the application's free-text sections. */
export function CandidateProfile({ app }: { app: JobApplication }) {
  const stage = STAGES.find((s) => s.id === app.status);
  const sections = [
    ['Education', app.education],
    ['Experience', app.experienceYears !== null ? `${app.experienceYears} years${app.experience ? ` — ${app.experience}` : ''}` : app.experience],
    ['Previous schools', app.previousSchools],
    ['References', app.references],
    ['Cover note', app.coverNote],
  ] as const;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-base text-slate-600 dark:text-slate-300">
        <Badge tone={stage?.tone ?? 'rose'}>{app.status}</Badge>
        <span className="inline-flex items-center gap-1"><Mail size={14} /> {app.email}</span>
        {app.phone && <span className="inline-flex items-center gap-1"><Phone size={14} /> {app.phone}</span>}
        <span>Applied {formatDate(app.createdAt)}</span>
        {app.employeeId && <AreaLink to={`/staff/${app.employeeId}`} className="font-semibold text-primary-600 hover:underline">Open staff record →</AreaLink>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.03]">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-500">{k}</div>
            <p className="whitespace-pre-line text-base text-slate-700 dark:text-slate-200">{v}</p>
          </div>
        ))}
      </div>
    </>
  );
}
