import { Rocket } from 'lucide-react';
import { navVisual } from '@/config/navigationIcons';
import { Card, EmptyState, PageHeader } from '@/components/ui';

/** Menu entries from page 4 whose modules are not built yet. */
export function ModulePlaceholderPage({ label }: { label: string }) {
  const [icon, tone] = navVisual(label);
  return (
    <div>
      <PageHeader title={label} sub="Part of the MVP plan" icon={icon} tone={tone} />
      <Card>
        <EmptyState icon={Rocket} title="Coming soon" tone="magenta">
          This module is planned for the MVP and is being built next.
        </EmptyState>
      </Card>
    </div>
  );
}
