import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, Field, Input } from '@/components/ui';
import { ACADEMICS_KEY } from '@/features/academics/hooks/useAcademics';
import { CAMPUSES_KEY } from '@/features/campuses/hooks/useCampuses';
import { campusService } from '@/features/campuses/services/campusService';
import { onSubmit } from '@/lib/forms';
import { useAction } from '@/lib/hooks/useAction';

const EMPTY = { name: '', code: '', address: '', phone: '' };

/** Add a campus; it counts towards the plan's campus limit while active. */
export function AddCampusForm() {
  const [form, setForm] = useState(EMPTY);
  const create = useAction(
    () => campusService.create({ name: form.name, code: form.code, ...(form.address && { address: form.address }), ...(form.phone && { phone: form.phone }) }),
    { success: (c) => `${c.name} added`, invalidate: [CAMPUSES_KEY, ACADEMICS_KEY], onDone: () => setForm(EMPTY) },
  );
  return (
    <Card title="Add campus" icon={Plus} tone="teal">
      <form onSubmit={onSubmit(() => create.mutate(undefined))} className="space-y-4">
        <Field label="Name">
          <Input required maxLength={150} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Code" hint="Short unique code, e.g. NORTH">
          <Input
            required
            pattern="[A-Za-z0-9-]{1,20}"
            title="1–20 letters, digits or hyphens"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />
        </Field>
        <Field label="Address (optional)">
          <Input maxLength={500} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Field>
        <Field label="Phone (optional)">
          <Input maxLength={32} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Button type="submit" icon={Plus} className="w-full" loading={create.isPending}>
          Add campus
        </Button>
        <p className="text-xs text-slate-500 dark:text-slate-400">Active campuses count towards your subscription plan’s campus limit.</p>
      </form>
    </Card>
  );
}
