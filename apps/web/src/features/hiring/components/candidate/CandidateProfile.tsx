import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { AreaLink } from '@/app/router/area';
import { Avatar, Badge } from '@/components/ui';
import { STAGES } from '@/features/hiring/constants';
import type { ApplicationDetail, StatusLog } from '@/features/hiring/types/hiring.types';
import { formatDate } from '@/lib/format';

const STAGE_LABEL: Record<string, string> = { applied: 'Applied', shortlisted: 'Shortlisted', interview: 'Interview', selected: 'Selected', hired: 'Hired', rejected: 'Rejected', withdrawn: 'Withdrawn' };
const age = (dob: string | null) => (dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86_400_000)) : null);

function Section({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  const shown = rows.filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (!shown.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
      <div className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">{title}</div>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {shown.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs text-slate-500">{k}</dt>
            <dd className="whitespace-pre-line text-base text-slate-800 dark:text-slate-100">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Every stage change with who made it and why. */
export function StatusLogList({ history }: { history: StatusLog[] }) {
  return (
    <ol className="relative space-y-3 border-l border-slate-200 pl-5 dark:border-white/10">
      {history.map((h) => {
        const tone = STAGES.find((s) => s.id === h.toStatus)?.tone ?? (h.toStatus === 'rejected' ? 'rose' : 'slate');
        return (
          <li key={h.id} className="relative">
            <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-400 ring-4 ring-white dark:ring-slate-900" />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {h.fromStatus && <><span className="text-slate-500">{STAGE_LABEL[h.fromStatus]}</span><span className="text-slate-400">→</span></>}
              <Badge tone={tone}>{STAGE_LABEL[h.toStatus]}</Badge>
              <span className="text-slate-500">{new Date(h.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              <span className="text-slate-500">· {h.changedByName ?? 'System'}</span>
            </div>
            {h.note && <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{h.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}

/** The full application, grouped like the form, plus the post it is for. */
export function CandidateProfile({ app }: { app: ApplicationDetail }) {
  const stage = STAGES.find((s) => s.id === app.status);
  const years = age(app.dateOfBirth);
  return (
    <div className="space-y-4">
      <Avatar photoKey={app.photoKey} name={`${app.firstName} ${app.lastName}`} size="lg" ring />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-slate-600 dark:text-slate-300">
        <Badge tone={stage?.tone ?? 'rose'}>{STAGE_LABEL[app.status]}</Badge>
        <span>For <strong>{app.jobPost.title}</strong> · {app.jobPost.campus.name}</span>
        <span className="inline-flex items-center gap-1"><Mail size={14} /> {app.email}</span>
        {app.phone && <span className="inline-flex items-center gap-1"><Phone size={14} /> {app.phone}</span>}
        {app.city && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {app.city}</span>}
        <span>Applied {formatDate(app.createdAt)}{app.source === 'website' ? ' on the website' : ''}</span>
        {app.employeeId && <AreaLink to={`/staff/${app.employeeId}`} className="font-semibold text-primary-600 hover:underline">Open staff record →</AreaLink>}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Section title="Personal" rows={[
          ['Father’s name', app.fatherName],
          ['Gender', app.gender ? app.gender[0]!.toUpperCase() + app.gender.slice(1) : null],
          ['Date of birth', app.dateOfBirth ? `${formatDate(app.dateOfBirth)}${years !== null ? ` (${years} years)` : ''}` : null],
          ['CNIC', app.cnic],
          ['Address', app.address],
        ]} />
        <Section title="Qualification" rows={[
          ['Highest qualification', app.highestQualification],
          ['Institution', app.institution],
          ['Passing year', app.graduationYear],
          ['Major subjects', app.majorSubjects],
          ['Other education', app.education],
        ]} />
        <Section title="Experience" rows={[
          ['Years', app.experienceYears],
          ['Current employer', app.currentEmployer],
          ['Current designation', app.currentDesignation],
          ['Details', app.experience],
          ['Previous schools', app.previousSchools],
        ]} />
        <Section title="Preferences" rows={[
          ['Can teach', app.subjects],
          ['Expected salary', app.expectedSalary ? `PKR ${Number(app.expectedSalary).toLocaleString('en-PK')} / month` : null],
          ['Notice period', app.noticePeriod],
          ['Available from', app.availableFrom ? formatDate(app.availableFrom) : null],
        ]} />
        <Section title="More" rows={[
          ['Languages', app.languages],
          ['Skills', app.skills],
          ['LinkedIn', app.linkedinUrl ? <a href={app.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:underline">{app.linkedinUrl.replace(/^https?:\/\//, '')} <ExternalLink size={12} /></a> : null],
          ['References', app.references],
          ['Cover note', app.coverNote],
        ]} />
      </div>
    </div>
  );
}
