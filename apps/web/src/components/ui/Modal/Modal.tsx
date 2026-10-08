import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '@/components/ui/Button/IconButton';

/**
 * Accessible dialog: focuses its first control, closes on Escape, restores focus on close.
 * Rendered into <body> through a portal, so a transformed/filtered ancestor (page transition,
 * cards) can never trap it: it always covers the whole viewport, and long forms scroll inside.
 */
export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [hasRequired, setHasRequired] = useState(false);

  // Forms with mandatory fields explain the asterisk in the footer.
  useEffect(() => {
    if (!open || !panel.current) return;
    const check = () => setHasRequired(!!panel.current?.querySelector('input[required], select[required], textarea[required]'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(panel.current, { subtree: true, childList: true, attributes: true, attributeFilter: ['required'] });
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('input:not([type=hidden]),select,textarea')?.focus() ?? panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    // Lock the page behind the dialog.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/55" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        className={`relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col outline-none sm:max-h-[calc(100dvh-3rem)] ${{ md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]} animate-[fade-in_0.15s_ease-out] rounded-xl border border-slate-200 bg-white shadow-depth-3 dark:border-white/10 dark:bg-[#111a2c]`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-white/10">
          <h2 id={id} className="text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">{title}</h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 rounded-b-xl dark:border-white/10 dark:bg-white/2">{hasRequired && <span className="mr-auto text-xs text-slate-500 dark:text-slate-400"><span className="text-rose-600">*</span> Required</span>}{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
