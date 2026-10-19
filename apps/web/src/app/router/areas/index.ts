import { accountsRoutes } from '@/app/router/areas/accounts.routes';
import { adminRoutes } from '@/app/router/areas/admin.routes';
import { parentRoutes } from '@/app/router/areas/parent.routes';
import { principalRoutes } from '@/app/router/areas/principal.routes';
import { staffRoutes } from '@/app/router/areas/staff.routes';
import { studentRoutes } from '@/app/router/areas/student.routes';
import { teacherRoutes } from '@/app/router/areas/teacher.routes';
import type { AreaRoutes } from '@/app/router/types';
import type { AreaSlug } from '@/config/roleAreas';

/** Route table of every role area. */
export const AREA_ROUTES: Record<AreaSlug, AreaRoutes> = {
  principal: principalRoutes,
  admin: adminRoutes,
  accounts: accountsRoutes,
  teacher: teacherRoutes,
  staff: staffRoutes,
  student: studentRoutes,
  parent: parentRoutes,
};
