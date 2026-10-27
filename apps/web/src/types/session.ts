import { type SchoolRoleKey } from '@schoolerp/shared';

export type Tenant =
  | { kind: 'platform' }
  | {
      kind: 'school';
      school: {
        name: string;
        slug: string;
        branding: { logoUrl: string | null; primaryColor: string | null; secondaryColor: string | null } | null;
      };
    };

export type Me =
  /** `isPrimary`: the main owner (manages the owner team, edits / deletes logs); others are labelled "Owner 2"… */
  | { scope: 'platform'; admin: { id: string; email: string; name: string; isPrimary?: boolean; label?: string | null } }
  | {
      scope: 'school';
      /**
       * `loginId`: the User ID they sign in with (never changes). `email`: their own address;
       * `emailVerified` once confirmed with a code (needed for "forgot password").
       * `mustChangePassword`: an administrator set the password; the user must replace it first.
       */
      user: { id: string; loginId: string; email: string | null; emailVerified: boolean; firstName: string; lastName: string; phone: string | null; mustChangePassword?: boolean; photoKey?: string | null; photoNeedsApproval?: boolean };
      school: { id: string; name: string; slug: string } | null;
      roles: { key: SchoolRoleKey; name: string; level: number }[];
      permissions: string[];
      /** Set while the platform owner works inside the school ("Open as admin"). */
      support?: { name: string } | null;
    };
