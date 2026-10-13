import { LifeBuoy, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';

/** Shown on every page while the platform owner works inside this school ("Open as admin"). */
export function SupportBanner({ name }: { name: string }) {
  const { logout } = useAuth();
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sky-900 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-200" role="status">
      <LifeBuoy size={18} className="shrink-0" />
      <p className="min-w-0 flex-1 text-sm font-medium">
        Platform support session: <strong>{name}</strong> is working in this school with full admin rights. Every change is recorded in the audit log as “Platform support”. It stays open until you end it.
      </p>
      <button onClick={() => void logout()} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3 py-1.5 text-sm font-bold text-white hover:bg-sky-800"><LogOut size={14} /> End session</button>
    </div>
  );
}
