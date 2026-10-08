import type { FormEvent } from 'react';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { APPLICATIONS_KEY, SCHOOLS_KEY } from '@/features/platform/hooks/usePlatform';
import { platformService } from '@/features/platform/services/platformService';
import type { Tier } from '@/features/platform/types/platform.types';
import { useAction } from '@/lib/hooks/useAction';

export const EMPTY_SCHOOL_FORM = {
  name: '',
  slug: '',
  tierCode: '',
  /** Empty = the standard theme; a school colour is optional. */
  primaryColor: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  currency: 'USD',
  campusName: 'Main Campus',
  campusCode: 'MAIN',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPassword: '',
};
export type SchoolForm = typeof EMPTY_SCHOOL_FORM & { applicationId?: string };

/** Provision a school tenant (1-month trial), optionally prefilled from an approved application. */
export function OnboardSchoolModal({ form, setForm, tiers, onClose }: { form: SchoolForm | null; setForm: (f: SchoolForm) => void; tiers: Tier[]; onClose: () => void }) {
  const create = useAction(
    (f: SchoolForm) =>
      platformService.onboardSchool({
        name: f.name,
        slug: f.slug,
        tierCode: f.tierCode,
        primaryColor: f.primaryColor || undefined,
        timezone: f.timezone,
        currency: f.currency,
        campus: { name: f.campusName, code: f.campusCode },
        admin: { firstName: f.adminFirstName, lastName: f.adminLastName, email: f.adminEmail, password: f.adminPassword },
        applicationId: f.applicationId,
      }),
    { success: (r) => `${r.school.name} created with a 1-month free trial`, invalidate: [SCHOOLS_KEY, APPLICATIONS_KEY], onDone: onClose },
  );
  const set = (key: keyof typeof EMPTY_SCHOOL_FORM) => (e: { target: { value: string } }) => form && setForm({ ...form, [key]: e.target.value });
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form) create.mutate(form);
  }
  return (
    <Modal
      open={!!form}
      title="Onboard a school"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="school-form" loading={create.isPending}>Create school</Button>
        </>
      }
    >
      {form && (
        <form id="school-form" onSubmit={onSubmit} className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          {form.applicationId && <div className="rounded-lg bg-primary-500/10 px-3 py-2 text-sm font-semibold text-primary-800 dark:text-primary-200">Approved application details prefilled. Complete school address and admin password to provision access.</div>}
          <Field label="School name">
            <Input required maxLength={150} value={form.name} onChange={set('name')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subdomain" hint="3–63 lowercase letters, digits, hyphens">
              <Input
                required
                pattern="[a-z0-9][a-z0-9-]{1,61}[a-z0-9]"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
              />
            </Field>
            <Field label="Plan">
              <Select required value={form.tierCode} onChange={set('tierCode')}>
                <option value="">Select…</option>
                {tiers.filter((t) => t.isActive).map((t) => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Timezone">
              <Input required value={form.timezone} onChange={set('timezone')} />
            </Field>
            <Field label="Currency">
              <Input required pattern="[A-Za-z]{3}" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="School colour (optional)" hint={form.primaryColor ? 'Used if their plan includes the theme colour' : 'Standard theme'}>
              <div className="flex h-10 items-center gap-3">
                <label className="flex items-center gap-2 text-base text-slate-700 dark:text-slate-200">
                  <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={!!form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.checked ? '#1e3a8a' : '' })} />
                  Own colour
                </label>
                {form.primaryColor && <Input type="color" aria-label="School colour" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="h-10 w-20 cursor-pointer px-1.5 py-1" />}
              </div>
            </Field>
            <Field label="Main campus">
              <Input required value={form.campusName} onChange={set('campusName')} />
            </Field>
            <Field label="Campus code">
              <Input required pattern="[A-Za-z0-9-]{1,20}" value={form.campusCode} onChange={(e) => setForm({ ...form, campusCode: e.target.value.toUpperCase() })} />
            </Field>
          </div>
          <div className="border-t border-slate-200/70 pt-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:text-slate-400">
            First school admin
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <Input required value={form.adminFirstName} onChange={set('adminFirstName')} />
            </Field>
            <Field label="Last name">
              <Input required value={form.adminLastName} onChange={set('adminLastName')} />
            </Field>
          </div>
          <Field label="Email">
            <Input type="email" required value={form.adminEmail} onChange={set('adminEmail')} />
          </Field>
          <Field label="Temporary password" hint="At least 12 characters">
            <Input type="password" autoComplete="new-password" required minLength={12} value={form.adminPassword} onChange={set('adminPassword')} />
          </Field>
        </form>
      )}
    </Modal>
  );
}
