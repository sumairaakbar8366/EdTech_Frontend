import { BellRing, Mail } from 'lucide-react';
import { Card } from '@/components/ui';

/**
 * How the school reaches people. For now every notification goes by email (and in-app); SMS,
 * WhatsApp and push are paused and will be offered here again later (user decision 2026-10-13).
 */
export function NotificationsCard() {
  return (
    <Card title="Notifications" icon={BellRing}>
      <div className="flex items-start gap-3 rounded-lg bg-emerald-500/5 p-4">
        <Mail size={20} className="mt-0.5 shrink-0 text-emerald-600" />
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">Email: always on</div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Every notification (fees, results, attendance, messages, approvals, sign-in codes…) appears in the app and is emailed to the person’s own email.
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">SMS and WhatsApp messages are coming soon.</p>
    </Card>
  );
}
