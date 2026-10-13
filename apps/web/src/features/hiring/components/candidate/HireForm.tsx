import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button, Field, Input } from '@/components/ui';
import { useHiringAction } from '@/features/hiring/hooks/useHiring';
import { hiringService } from '@/features/hiring/services/hiringService';
import type { JobApplication, JobPost } from '@/features/hiring/types/hiring.types';
import { defaultRoleFor } from '@/features/staff/constants';
import { todayIso } from '@/features/students/utils/student.utils';
import { handover, type LoginHandover } from '@/features/users/users';
import { onSubmit } from '@/lib/forms';

/**
 * Selected → hired: creates the staff record and, optionally, a login. The login gets a User ID
 * (e.g. "TCH-2026-0007") and a temporary password shown once; the applicant's personal
 * email stays on the staff record. Blocked once openings are filled.
 */
export function HireForm({ app, post, hiredCount, onHired }: { app: JobApplication; post: JobPost; hiredCount: number; onHired: (login: LoginHandover | null) => void }) {
  const [hire, setHire] = useState({ joinDate: todayIso(), createLogin: true });
  const role = defaultRoleFor(post.staffType);
  const doHire = useHiringAction(
    () => hiringService.hire(app.id, { joinDate: hire.joinDate, ...(hire.createLogin && { login: { roles: [role] } }) }),
    'Candidate hired and added to staff',
    (r) => onHired(r.credentials ? handover(app.firstName, app.lastName, role === 'teacher' ? 'Teacher' : 'Staff', r.credentials) : null),
  );
  if (hiredCount >= post.openings) {
    return (
      <p className="rounded-lg bg-amber-500/10 p-3 text-base text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-200">
        All {post.openings} opening(s) for this post are filled. Edit the post to add openings before hiring this candidate.
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit(() => doHire.mutate(undefined))} className="rounded-lg bg-emerald-500/10 p-4 ring-1 ring-emerald-500/30">
      <div className="mb-3 text-lg font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Hire {app.firstName}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Joining date"><Input type="date" required value={hire.joinDate} onChange={(e) => setHire({ ...hire, joinDate: e.target.value })} /></Field>
        <label className="flex items-start gap-2 pt-7 text-base text-slate-700 dark:text-slate-200">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-primary-600" checked={hire.createLogin} onChange={(e) => setHire({ ...hire, createLogin: e.target.checked })} />
          <span>
            Create a {role === 'teacher' ? 'teacher' : 'staff'} login
            <span className="block text-sm text-slate-500">A User ID ({role === 'teacher' ? 'TCH' : 'STF'}-year-number) and a temporary password, shown after hiring and emailed to {app.email}.</span>
          </span>
        </label>
      </div>
      <div className="mt-3 flex justify-end"><Button type="submit" icon={UserPlus} loading={doHire.isPending}>Hire and add to staff</Button></div>
    </form>
  );
}
