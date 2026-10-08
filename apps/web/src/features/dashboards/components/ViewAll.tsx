import { ArrowRight } from 'lucide-react';
import { AreaLink } from '@/app/router/area';

/** "View all →" link for a widget's card header, relative to the current role area. */
export function ViewAll({ to, label = 'View all' }: { to: string; label?: string }) {
  return (
    <AreaLink to={to} className="focus-ring inline-flex items-center gap-1 rounded-md text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">
      {label} <ArrowRight size={14} />
    </AreaLink>
  );
}
