import type { HTMLAttributes } from 'react';

/**
 * Formerly a pointer-tilt card; the serious theme (2026-10-06) has no tilt, so this is now a plain
 * wrapper kept for its existing call sites. The `max` prop is accepted and ignored.
 */
export function Tilt({ className = '', children, max: _max, ...props }: HTMLAttributes<HTMLDivElement> & { max?: number }) {
  return (
    <div className={`tilt ${className}`} {...props}>
      {children}
    </div>
  );
}
