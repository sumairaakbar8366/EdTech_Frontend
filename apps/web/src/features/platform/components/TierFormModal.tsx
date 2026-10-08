import { FEATURE_INFO, PLAN_FEATURES_LIST, type PlanFeature } from '@schoolerp/shared';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, Modal, Select } from '@/components/ui';
import { TIERS_KEY } from '@/features/platform/hooks/usePlatform';
import { platformService } from '@/features/platform/services/platformService';
import type { Tier, TierPayload } from '@/features/platform/types/platform.types';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { useAction } from '@/lib/hooks/useAction';

const PRICING = [
  { value: 'flat', label: 'Flat price' },
  { value: 'per_campus', label: 'Per campus' },
  { value: 'campus_plus_students', label: 'Campus + students' },
  { value: 'custom', label: 'Custom (on request)' },
];
const CURRENCIES = ['PKR', 'USD', 'AED', 'SAR', 'GBP', 'EUR'];

type Form = { code: string; name: string; pricingModel: string; priceMonthly: string; priceAnnual: string; currency: string; maxCampuses: string; maxStudents: string; maxStaff: string; features: PlanFeature[]; isActive: boolean; sortOrder: string };

const toForm = (t?: Tier): Form => ({
  code: t?.code ?? '',
  name: t?.name ?? '',
  pricingModel: t?.pricingModel ?? 'flat',
  priceMonthly: t?.priceMonthly ?? '',
  priceAnnual: t?.priceAnnual ?? '',
  currency: t?.currency ?? 'PKR',
  maxCampuses: t?.maxCampuses?.toString() ?? '',
  maxStudents: t?.maxStudents?.toString() ?? '',
  maxStaff: t?.maxStaff?.toString() ?? '',
  features: t?.features ?? ['core'],
  isActive: t?.isActive ?? true,
  sortOrder: t?.sortOrder?.toString() ?? '',
});
const num = (s: string) => (s.trim() === '' ? null : Number(s));

/** Add a plan or change one: name, prices, currency, limits, features and whether schools can buy it. */
export function TierFormModal({ open, tier, onClose }: { open: boolean; tier?: Tier; onClose: () => void }) {
  const editing = !!tier;
  const [f, setF] = useState<Form>(() => toForm(tier));
  useEffect(() => {
    if (open) setF(toForm(tier));
  }, [open, tier]);
  const save = useAction(
    () => {
      const body: TierPayload = {
        name: f.name.trim(),
        pricingModel: f.pricingModel,
        priceMonthly: num(f.priceMonthly),
        priceAnnual: num(f.priceAnnual),
        currency: f.currency,
        maxCampuses: num(f.maxCampuses),
        maxStudents: num(f.maxStudents),
        maxStaff: num(f.maxStaff),
        features: f.features,
        isActive: f.isActive,
        ...(f.sortOrder.trim() && { sortOrder: Number(f.sortOrder) }),
      };
      return editing ? platformService.updateTier({ id: tier!.id, ...body }) : platformService.createTier({ ...body, code: f.code.trim().toLowerCase() });
    },
    { success: editing ? 'Plan updated' : 'Plan added', invalidate: [TIERS_KEY, ['public', 'plans']], onDone: onClose, toastErrors: false },
  );
  const text = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const toggle = (feature: PlanFeature) => setF({ ...f, features: f.features.includes(feature) ? f.features.filter((x) => x !== feature) : [...f.features, feature] });
  const onPlan = (tier?.schools.paying ?? 0) + (tier?.schools.trial ?? 0);

  return (
    <Modal
      open={open}
      size="xl"
      title={editing ? `Edit plan · ${tier!.name}` : 'Add plan'}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="tier-form" loading={save.isPending} disabled={f.features.length === 0}>{editing ? 'Save changes' : 'Add plan'}</Button></>}
    >
      <form id="tier-form" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-5">
        {save.error && <Alert>{errorMessage(save.error, 'Could not save the plan.')}</Alert>}
        {editing && onPlan > 0 && <Alert tone="info">{onPlan} school{onPlan === 1 ? ' is' : 's are'} on this plan. Feature and limit changes apply to them right away; new prices apply from their next payment.</Alert>}

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Plan name"><Input required maxLength={60} value={f.name} onChange={text('name')} placeholder="e.g. Premium" /></Field>
          <Field label="Code" hint={editing ? 'Fixed once created' : 'Lowercase, used in links and reports'}>
            <Input required={!editing} disabled={editing} pattern="[a-z][a-z0-9\-]{1,29}" maxLength={30} value={f.code} onChange={text('code')} placeholder="premium" />
          </Field>
          <Field label="Pricing type"><Select value={f.pricingModel} onChange={text('pricingModel')}>{PRICING.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</Select></Field>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Price</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Currency"><Select value={f.currency} onChange={text('currency')}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Monthly price" hint="Leave empty for “on request”"><Input type="number" min={0} step="0.01" value={f.priceMonthly} onChange={text('priceMonthly')} placeholder="On request" /></Field>
            <Field label="Yearly price" hint="Leave empty for “on request”"><Input type="number" min={0} step="0.01" value={f.priceAnnual} onChange={text('priceAnnual')} placeholder="On request" /></Field>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Limits <span className="font-normal normal-case tracking-normal text-slate-500">(empty = unlimited)</span></legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Campuses"><Input type="number" min={1} value={f.maxCampuses} onChange={text('maxCampuses')} placeholder="Unlimited" /></Field>
            <Field label="Students"><Input type="number" min={1} value={f.maxStudents} onChange={text('maxStudents')} placeholder="Unlimited" /></Field>
            <Field label="Staff"><Input type="number" min={1} value={f.maxStaff} onChange={text('maxStaff')} placeholder="Unlimited" /></Field>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 flex w-full items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <span>Features included</span>
            <span className="flex gap-2 normal-case tracking-normal">
              <button type="button" className="font-semibold text-primary-700 hover:underline dark:text-primary-300" onClick={() => setF({ ...f, features: [...PLAN_FEATURES_LIST] })}>Select all</button>
              <button type="button" className="font-semibold text-slate-500 hover:underline" onClick={() => setF({ ...f, features: ['core'] })}>Core only</button>
            </span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PLAN_FEATURES_LIST.map((key) => {
              const on = f.features.includes(key);
              return (
                <label key={key} className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 ring-1 ring-inset ${on ? 'bg-primary-500/5 ring-primary-500/40' : 'ring-slate-200 dark:ring-white/10'}`}>
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-primary-600" checked={on} onChange={() => toggle(key)} />
                  <span>
                    <span className="block font-semibold text-slate-800 dark:text-slate-100">{FEATURE_INFO[key].label}</span>
                    <span className="block text-sm text-slate-500">{FEATURE_INFO[key].description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {f.features.length === 0 && <p className="mt-2 text-sm text-rose-600">Choose at least one feature.</p>}
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-base text-slate-700 sm:col-span-2 dark:text-slate-200">
            <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} />
            Available to buy (shown to schools and on the website)
          </label>
          <Field label="Display order" hint="Lower comes first"><Input type="number" min={0} max={1000} value={f.sortOrder} onChange={text('sortOrder')} placeholder="Last" /></Field>
        </div>
      </form>
    </Modal>
  );
}
