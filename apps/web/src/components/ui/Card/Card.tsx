import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { IconTile } from '@/components/ui/IconTile/IconTile';
import type { Tone } from '@/components/ui/tones';

/** Raised card with an optional titled header bar and actions; fades in once when scrolled into view. */
export function Card({
  title,
  icon,
  tone = 'primary',
  actions,
  children,
  className = '',
  padded = true,
}: {
  title?: string;
  icon?: LucideIcon;
  tone?: Tone;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <motion.section
      data-tone={tone}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-4% 0px' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`surface card-3d tone-card overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--surface-border) px-6 py-4">
          <div className="flex items-center gap-3">
            {icon && <IconTile icon={icon} tone={tone} size="sm" />}
            {title && <h2 className="text-sm font-bold uppercase tracking-wider text-(--ink)">{title}</h2>}
          </div>
          {actions}
        </div>
      )}
      <div className={padded ? 'p-6' : ''}>{children}</div>
    </motion.section>
  );
}
