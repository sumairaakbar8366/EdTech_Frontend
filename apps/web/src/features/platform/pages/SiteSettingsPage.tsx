import { useQuery } from '@tanstack/react-query';
import { Globe, Save, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Field, Input, PageHeader, Spinner } from '@/components/ui';
import { PLATFORM_KEY } from '@/features/platform/hooks/usePlatform';
import { SocialFields } from '@/features/website/components/SocialFields';
import { EMPTY_SOCIAL } from '@/features/website/social';
import { siteService, type SiteSettings } from '@/features/website/siteService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { useAction } from '@/lib/hooks/useAction';
import { PRODUCT_NAME } from '@/config/brand';

const KEY = [...PLATFORM_KEY, 'site-settings'] as const;
const EMPTY: SiteSettings = { contactEmail: null, phone: null, address: null, ...EMPTY_SOCIAL };

/** Owner console: the contact details and social accounts shown on the public site and given to Google. */
export function SiteSettingsPage() {
  const settings = useQuery({ queryKey: KEY, queryFn: siteService.adminSettings });
  const [f, setF] = useState<SiteSettings>(EMPTY);
  useEffect(() => {
    if (settings.data) setF(settings.data);
  }, [settings.data]);
  const save = useAction((body: SiteSettings) => siteService.saveSettings(body), { success: 'Public site details saved', invalidate: [KEY, ['public', 'site-settings']], toastErrors: false });
  const text = (k: 'contactEmail' | 'phone' | 'address') => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value || null });

  return (
    <div>
      <PageHeader title="Public site" sub={`Contact details and social accounts on the ${PRODUCT_NAME} home page. Search engines use them to recognise your business.`} icon={Globe} tone="teal" />
      {settings.isLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={onSubmit(() => save.mutate(f))} className="grid max-w-3xl gap-5">
          {save.error && <Alert>{errorMessage(save.error)}</Alert>}
          <Card title="Contact" icon={Globe}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email" hint="“Book a demo” buttons open an email to this address"><Input type="email" maxLength={254} value={f.contactEmail ?? ''} onChange={text('contactEmail')} placeholder="sales@yourcompany.com" /></Field>
              <Field label="Phone"><Input type="tel" maxLength={40} value={f.phone ?? ''} onChange={text('phone')} placeholder="+92 300 1234567" /></Field>
              <div className="sm:col-span-2"><Field label="Office address"><Input maxLength={300} value={f.address ?? ''} onChange={text('address')} /></Field></div>
            </div>
          </Card>
          <Card title="Social media" icon={Share2}>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Your company's own accounts. Empty fields are not shown.</p>
            <SocialFields value={f} onChange={(v) => setF({ ...f, ...v })} />
          </Card>
          <div className="flex justify-end"><Button type="submit" icon={Save} loading={save.isPending}>Save</Button></div>
        </form>
      )}
    </div>
  );
}
