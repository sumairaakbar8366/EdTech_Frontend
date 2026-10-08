import { Building2, Globe, Palette, ScrollText, Settings } from 'lucide-react';
import { useState } from 'react';
import { Card, EmptyState, PageHeader, Spinner, Tabs } from '@/components/ui';
import { AuditLogCard } from '@/features/audit/components/AuditLogCard';
import { BrandingCard } from '@/features/settings/components/BrandingCard';
import { DomainsCard } from '@/features/settings/components/DomainsCard';
import { useCan } from '@/features/auth/usePermissions';
import { ACADEMICS_KEY } from '@/features/academics/hooks/useAcademics';
import { AddCampusForm } from '@/features/campuses/components/AddCampusForm';
import { CampusCard } from '@/features/campuses/components/CampusCard';
import { CAMPUSES_KEY, useCampuses } from '@/features/campuses/hooks/useCampuses';
import { campusService } from '@/features/campuses/services/campusService';
import { useAction } from '@/lib/hooks/useAction';

/** School settings. First section: campuses (multi-campus, limited by the subscription tier). */
export function SettingsPage() {
  const can = useCan();
  const [tab, setTab] = useState<'campuses' | 'branding' | 'domains' | 'audit'>('campuses');
  const campuses = useCampuses();
  const toggle = useAction((c: { id: string; isActive: boolean }) => campusService.update(c.id, { isActive: !c.isActive }), {
    success: (c) => `${c.name} ${c.isActive ? 'activated' : 'deactivated'}`,
    invalidate: [CAMPUSES_KEY, ACADEMICS_KEY],
  });
  return (
    <div>
      <PageHeader title="Settings" sub="School configuration" icon={Settings} tone="slate" />
      <Tabs
        tabs={[
          { id: 'campuses' as const, label: 'Campuses', icon: Building2 },
          { id: 'branding' as const, label: 'Branding', icon: Palette },
          { id: 'domains' as const, label: 'Domains', icon: Globe },
          ...(can('audit.view') ? [{ id: 'audit' as const, label: 'Audit log', icon: ScrollText }] : []),
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'branding' && <BrandingCard />}
      {tab === 'domains' && <DomainsCard />}
      {tab === 'audit' && <AuditLogCard />}
      {tab === 'campuses' && (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Campuses" icon={Building2} tone="primary" className="lg:col-span-2">
          {campuses.isLoading && <Spinner />}
          {campuses.data?.length === 0 && <EmptyState icon={Building2} title="No campuses" />}
          <div className="grid gap-3 sm:grid-cols-2">
            {campuses.data?.map((c) => <CampusCard key={c.id} campus={c} busy={toggle.isPending} onToggle={() => toggle.mutate(c)} />)}
          </div>
        </Card>
        <AddCampusForm />
      </div>
      )}
    </div>
  );
}
