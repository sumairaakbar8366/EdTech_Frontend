import { useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Hover/focus tooltip. Rendered in a portal on <body> so cards with `overflow-hidden` cannot clip it.
 * The trigger is focusable and points at the tooltip with aria-describedby.
 */
export function Tooltip({ content, children, className = '' }: { content: ReactNode; children: ReactNode; className?: string }) {
  const id = useId();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top });
  };
  return (
    <span
      tabIndex={0}
      aria-describedby={pos ? id : undefined}
      className={`cursor-help rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${className}`}
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={() => setPos(null)}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={() => setPos(null)}
    >
      {children}
      {pos &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ left: pos.x, top: pos.y - 8 }}
            className="pointer-events-none fixed z-[1000] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 font-sans text-sm font-semibold text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
