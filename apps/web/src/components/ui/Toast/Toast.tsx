import { Bell, CircleCheck, CircleX, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastTone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
  title?: string;
}

const ToastContext = createContext<((tone: ToastTone, message: string, title?: string) => void) | null>(null);

/** Small stacked notifications, bottom-right. Errors and info (new notifications) stay 6s, successes 3.5s. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (tone: ToastTone, message: string, title?: string) => {
      const id = Date.now() + Math.random();
      setItems((all) => [...all.slice(-3), { id, tone, message, title }]);
      setTimeout(() => dismiss(id), tone === 'success' ? 3500 : 6000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[110] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-depth-3 animate-[fade-in_0.15s_ease-out] dark:border-white/10 dark:bg-[#111a2c]">
            {t.tone === 'success' ? (
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            ) : t.tone === 'info' ? (
              <Bell size={18} className="mt-0.5 shrink-0 text-orange-500" />
            ) : (
              <CircleX size={18} className="mt-0.5 shrink-0 text-rose-500" />
            )}
            <div className="min-w-0 flex-1">
              {t.title && <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>}
              <p className="text-sm text-slate-700 dark:text-slate-200">{t.message}</p>
            </div>
            <button aria-label="Dismiss" onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error('useToast must be used inside ToastProvider');
  return useMemo(
    () => ({ success: (m: string) => push('success', m), error: (m: string) => push('error', m), info: (title: string, m: string) => push('info', m, title) }),
    [push],
  );
}
