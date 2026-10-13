import { LogOut, UserCog } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { AccountModal } from '@/features/auth/components/AccountModal';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/** Signed-in user card at the bottom of the sidebar, with "My account" and sign-out. */
export function SidebarUser({ name, detail, compact }: { name: string; detail: string; compact: boolean }) {
  const { logout, me } = useAuth();
  const [account, setAccount] = useState(false);
  return (
    <div className={`relative rounded-xl border border-white/10 bg-white/5 text-white ${compact ? 'mx-2 my-3 p-2' : 'm-3 p-3'}`}>
      <div className={`flex items-center ${compact ? 'flex-col gap-2' : 'gap-3'}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-xs font-bold text-white">
          {initials(name)}
        </span>
        {!compact && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{name}</div>
            <div className="truncate font-mono text-xs text-slate-300">{detail}</div>
          </div>
        )}
        {me?.scope === 'school' && (
          <button onClick={() => setAccount(true)} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="My account" title="My account: User ID, email, password">
            <UserCog size={16} />
          </button>
        )}
        <button onClick={() => void logout()} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
      {!compact && <div className="mt-2 border-t border-white/10 pt-2 text-center text-[10px] font-semibold uppercase text-slate-400">Anet Cyber Solutions</div>}
      <AccountModal open={account} onClose={() => setAccount(false)} />
    </div>
  );
}
