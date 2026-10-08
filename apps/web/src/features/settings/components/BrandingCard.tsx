import { ImagePlus, Palette, Save, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Field, Input, Spinner } from '@/components/ui';
import { useSubscription } from '@/features/billing/billing';
import { useSchoolSettings, useSettingsAction } from '@/features/settings/hooks/useSettings';
import { settingsService } from '@/features/settings/services/settingsService';
import { DAY_NAMES } from '@/lib/format';
import { onSubmit } from '@/lib/forms';

// The standard theme's colours, used for the preview and as the starting point for custom colours.
const DEFAULT_PRIMARY = '#2f3e52';
const DEFAULT_SECONDARY = '#c2410c';

/**
 * School branding (logo, optional colours) and regional settings, with a live preview. A custom colour
 * is optional: by default the school uses the standard theme, and it can switch back at any time.
 */
export function BrandingCard() {
  const view = useSchoolSettings();
  const s = view.data?.settings;
  const fileInput = useRef<HTMLInputElement>(null);
  const canTheme = useSubscription().data?.features.includes('theme') ?? true;
  const [form, setForm] = useState({ custom: false, primaryColor: DEFAULT_PRIMARY, secondaryColor: DEFAULT_SECONDARY, timezone: 'UTC', currency: 'USD', weeklyOffDays: [7] as number[] });
  useEffect(() => {
    if (s) setForm({ custom: !!s.primaryColor, primaryColor: s.primaryColor ?? DEFAULT_PRIMARY, secondaryColor: s.secondaryColor ?? DEFAULT_SECONDARY, timezone: s.timezone, currency: s.currency, weeklyOffDays: s.weeklyOffDays });
  }, [s]);
  const save = useSettingsAction(() => {
    const { custom, primaryColor, secondaryColor, ...rest } = form;
    // Colours are sent only when they change, so saving the region never needs the theme feature.
    const colours = custom ? { primaryColor, secondaryColor } : { primaryColor: null, secondaryColor: null };
    const changed = colours.primaryColor !== (s?.primaryColor ?? null) || colours.secondaryColor !== (s?.secondaryColor ?? null);
    return settingsService.update({ ...rest, ...(changed && colours) });
  }, { success: 'Settings saved' });
  const shown = form.custom ? form : { primaryColor: DEFAULT_PRIMARY, secondaryColor: DEFAULT_SECONDARY };
  const logo = useSettingsAction(settingsService.uploadLogo, { success: 'Logo updated', onDone: () => fileInput.current && (fileInput.current.value = '') });
  const removeLogo = useSettingsAction(() => settingsService.removeLogo(), { success: 'Logo removed' });
  const toggleDay = (d: number) => setForm((f) => ({ ...f, weeklyOffDays: f.weeklyOffDays.includes(d) ? f.weeklyOffDays.filter((x) => x !== d) : [...f.weeklyOffDays, d] }));

  if (view.isLoading) return <Spinner />;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <Card title="Branding & region" icon={Palette} tone="magenta">
        <form onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-500/10 ring-1 ring-slate-500/10">
              {s?.logoUrl ? <img src={s.logoUrl} alt="School logo" className="h-full w-full object-contain" /> : <ImagePlus className="text-slate-400" />}
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={fileInput} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={(e) => e.target.files?.[0] && logo.mutate(e.target.files[0])} />
              <Button type="button" variant="secondary" icon={ImagePlus} loading={logo.isPending} onClick={() => fileInput.current?.click()}>{s?.logoUrl ? 'Replace logo' : 'Upload logo'}</Button>
              {s?.logoUrl && <Button type="button" variant="ghost" icon={Trash2} loading={removeLogo.isPending} onClick={() => removeLogo.mutate(undefined)}>Remove</Button>}
              <p className="w-full text-xs text-slate-500">PNG or JPG, square, up to 2 MB. Shown on your sign-in page.</p>
            </div>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Colours <span className="font-normal normal-case tracking-normal text-slate-500">(optional)</span></legend>
            <div role="radiogroup" aria-label="Colours" className="grid gap-2 sm:grid-cols-2">
              {[
                { custom: false, title: 'Standard theme', text: 'The official navy and orange. Nothing to set up.' },
                { custom: true, title: 'Our school colours', text: canTheme || form.custom ? 'Use your own primary and accent colour.' : 'Available on plans with “Your theme colour”.' },
              ].map((o) => {
                const on = form.custom === o.custom;
                const disabled = o.custom && !canTheme && !form.custom;
                return (
                  <button key={o.title} type="button" role="radio" aria-checked={on} disabled={disabled} onClick={() => setForm({ ...form, custom: o.custom })} className={`rounded-lg p-3 text-left ring-1 ring-inset transition ${on ? 'bg-primary-500/10 ring-primary-500/50' : 'ring-slate-200 hover:bg-slate-50 dark:ring-white/10 dark:hover:bg-white/5'} disabled:cursor-not-allowed disabled:opacity-60`}>
                    <span className="block font-semibold text-slate-800 dark:text-slate-100">{o.title}</span>
                    <span className="block text-sm text-slate-500">{o.text}</span>
                  </button>
                );
              })}
            </div>
            {form.custom && (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Primary colour"><Input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="h-11 cursor-pointer px-1.5 py-1" /></Field>
                <Field label="Accent colour"><Input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="h-11 cursor-pointer px-1.5 py-1" /></Field>
              </div>
            )}
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Time zone" hint="IANA name, e.g. Asia/Karachi"><Input required value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></Field>
            <Field label="Currency"><Input required pattern="[A-Za-z]{3}" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></Field>
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Weekly off days</legend>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button key={d} type="button" onClick={() => toggleDay(d)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 transition ${form.weeklyOffDays.includes(d) ? 'bg-primary-500/15 text-primary-700 ring-primary-400 dark:text-primary-200' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/10'}`}>
                  {DAY_NAMES[d]!.slice(0, 3)}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">Used to count leave days and payroll working days.</p>
          </fieldset>
          <Button type="submit" icon={Save} loading={save.isPending}>Save settings</Button>
        </form>
      </Card>
      <div>
        <div className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Preview</div>
        <motion.div key={`${shown.primaryColor}${shown.secondaryColor}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-xl shadow-depth-3">
          <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${shown.primaryColor}, ${shown.secondaryColor})` }}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/20">{s?.logoUrl && <img src={s.logoUrl} alt="" className="h-full w-full object-contain" />}</span>
              <div>
                <div className="font-display text-xl font-bold uppercase">{view.data?.school.name}</div>
                <div className="text-sm text-white/80">{view.data?.school.address}</div>
              </div>
            </div>
          </div>
          <div className="surface space-y-2 rounded-none p-4">
            <div className="h-2 w-2/3 rounded-full" style={{ background: shown.primaryColor, opacity: 0.6 }} />
            <div className="h-2 w-1/2 rounded-full bg-slate-500/20" />
            <span className="inline-block rounded-lg px-3 py-1.5 text-sm font-bold uppercase text-white" style={{ background: shown.secondaryColor }}>Button</span>
          </div>
        </motion.div>
        <p className="mt-2 text-sm text-slate-500">{form.custom ? 'Your school colours' : 'Standard theme'}</p>
      </div>
    </div>
  );
}
