import type { ReactElement } from 'react';
import type { CanFn, Capability } from '@/config/permissions';

/** One page inside a role area. `path` is relative to the area ("" = its dashboard). */
export interface AreaRoute {
  path: string;
  element: ReactElement;
  /** Hidden (redirects to the area dashboard) unless the user has this capability. */
  capability?: Capability;
}

/** Each area's routes file exports one of these; `can` lets pages receive permission-derived props. */
export type AreaRoutes = (can: CanFn) => AreaRoute[];
