import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Backdrop } from '@/components/effects/Backdrop';
import { IconTile } from '@/components/ui';

/** A centred card for the sign-in helpers (forgot password, forgot User ID, reset, verify email). */
export function AuthCard({ icon, title, sub, children, back = true }: { icon: LucideIcon; title: string; sub?: ReactNode; children: ReactNode; back?: boolean }) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4 sm:p-6">
      <Backdrop variant="hero" />
      <div className="surface w-full max-w-md rounded-xl p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <IconTile icon={icon} size="lg" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
            {sub && <p className="text-sm text-slate-500 dark:text-slate-400">{sub}</p>}
          </div>
        </div>
        {children}
        {back && <Link to="/login" className="mt-5 inline-block text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white">← Back to sign in</Link>}
      </div>
    </div>
  );
}
