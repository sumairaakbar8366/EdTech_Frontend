import { Pencil, Plus, Tags } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, EmptyState, IconButton, Spinner } from '@/components/ui';
import { SheetActions } from '@/components/shared/SheetActions';
import { CATEGORY_EXPORT, CATEGORY_IMPORT } from '@/features/fees/utils/feeSheet';
import { CategoryModal } from '@/features/fees/components/categories/CategoryModal';
import { useFeeCategories } from '@/features/fees/hooks/useFees';
import type { FeeCategory } from '@/features/fees/types/fee.types';

/** Fee categories: tuition, transport, lab, exam… (page 14: fee_categories). */
export function CategoriesTab({ canEdit }: { canEdit: boolean }) {
  const [editing, setEditing] = useState<FeeCategory | 'new' | null>(null);
  const categories = useFeeCategories();
  return (
    <Card title="Fee categories" icon={Tags} tone="orange" padded={false} actions={<div className="flex flex-wrap items-center gap-2"><SheetActions compact fileName="Fee categories" columns={CATEGORY_EXPORT} rows={async () => categories.data ?? []} importSpec={canEdit ? CATEGORY_IMPORT : undefined} />{canEdit && <Button icon={Plus} onClick={() => setEditing('new')}>New category</Button>}</div>}>
      {categories.isLoading && <div className="px-5"><Spinner /></div>}
      {categories.data?.length === 0 && <EmptyState icon={Tags} title="No fee categories" tone="orange">Start with Tuition, Admission, Transport, Examination…</EmptyState>}
      <ul className="grid divide-y divide-slate-200/70 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3 dark:divide-white/5">
        {categories.data?.map((c) => (
          <li key={c.id} className={`flex items-center gap-3 px-5 py-3 ${c.isActive ? '' : 'opacity-60'}`}>
            <span className="rounded-md bg-primary-500/10 px-2 py-0.5 font-mono text-sm font-bold text-primary-700 dark:text-primary-300">{c.code}</span>
            <span className="flex-1 font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
            {!c.isActive && <Badge tone="slate">inactive</Badge>}
            {canEdit && <IconButton icon={Pencil} label="Edit category" onClick={() => setEditing(c)} />}
          </li>
        ))}
      </ul>
      {canEdit && <CategoryModal category={editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}
