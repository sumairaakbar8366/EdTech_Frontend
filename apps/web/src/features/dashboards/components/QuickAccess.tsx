import { ROLE_NAVIGATION } from '@schoolerp/shared';
import { Layers } from 'lucide-react';
import { AreaLink, useArea } from '@/app/router/area';
import { Card, IconTile, Tilt } from '@/components/ui';
import { navVisual } from '@/config/navigationIcons';
import { AREAS } from '@/config/roleAreas';

/** Shortcut tiles to the first menu entries of the current role area. */
export function QuickAccess({ limit = 8, className = '' }: { limit?: number; className?: string }) {
  const area = useArea();
  const shortcuts = ROLE_NAVIGATION[AREAS[area].role].filter((n) => n.path !== '/').slice(0, limit);
  return (
    <Card title="Quick access" icon={Layers} tone="magenta" className={className}>
      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
        {shortcuts.map((item) => {
          const [Icon, tone] = navVisual(item.label);
          return (
            <Tilt key={item.path} data-tone={tone} className="dashboard-link-tile rounded-xl">
              <AreaLink to={item.path} className="focus-ring group flex flex-col items-center gap-2 rounded-xl p-4 text-center">
                <span className="tilt-pop transition-transform group-hover:scale-110">
                  <IconTile icon={Icon} tone={tone} />
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
              </AreaLink>
            </Tilt>
          );
        })}
      </div>
    </Card>
  );
}
