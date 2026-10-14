import { useQuery } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import type { ReactElement } from 'react';
import { marketingService, type SocialProvider } from '@/features/marketing/services/marketingService';
import { PROVIDER_LABEL } from '@/features/auth/sso';

/** Sign-up and sign-in options: Google's client ID and whether emails need a code. */
export const useAuthConfig = () => useQuery({ queryKey: ['auth-config'], queryFn: marketingService.authConfig, staleTime: Infinity, retry: 1 });

/** Google's "G" mark (brand colours, as Google's sign-in guidelines require). */
const GoogleMark = () => (
  <svg viewBox="0 0 48 48" aria-hidden className="h-5 w-5 shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const MARK: Record<SocialProvider, () => ReactElement> = { google: GoogleMark };
const BUTTON = 'flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-[15px] font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-55 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10';

/**
 * "Continue with Google" (and optionally "Continue with email") in the familiar layout of Google,
 * ChatGPT or Claude sign-in pages. Until Google is set up the button is shown, but disabled.
 */
export function SocialButtons({ onProvider, onEmail, emailLabel = 'Continue with email' }: { onProvider: (p: SocialProvider) => void; onEmail?: () => void; emailLabel?: string }) {
  const config = useAuthConfig().data;
  return (
    <div className="space-y-3">
      {(['google'] as const).map((p) => {
        const Mark = MARK[p];
        const ready = !!config?.googleClientId;
        return (
          <button key={p} type="button" className={BUTTON} disabled={!ready} title={ready ? undefined : `${PROVIDER_LABEL[p]} sign-in is not set up on this server yet`} onClick={() => onProvider(p)}>
            <Mark />
            <span>Continue with {PROVIDER_LABEL[p]}</span>
            {!ready && <span className="text-xs font-medium text-slate-400">(not set up yet)</span>}
          </button>
        );
      })}
      {onEmail && (
        <>
          <OrDivider />
          <button type="button" className={BUTTON} onClick={onEmail}>
            <Mail size={20} className="shrink-0 text-slate-500" />
            <span>{emailLabel}</span>
          </button>
        </>
      )}
    </div>
  );
}

/** "OR" between Google and the email option. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
      <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" /> or <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
    </div>
  );
}
