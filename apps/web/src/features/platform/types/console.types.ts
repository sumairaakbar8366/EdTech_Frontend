
export type Phase = 'trial' | 'active' | 'grace' | 'expired';

export interface ConsoleSchool {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  createdAt: string;
  /** How it joined: self-service sign-up, a reviewed application, or onboarded from the console. */
  source: 'self_signup' | 'application' | 'console';
  contact: { name: string; designation: string; email: string; phone: string | null; city: string | null } | null;
  subscription: { phase: Phase; tier: { code: string; name: string } | null; billingCycle: string | null; endsAt: string | null; daysLeft: number | null };
  counts: { teachers: number; staff: number; students: number; parents: number; logins: number; activeLast7: number; lastLoginAt: string | null };
  revenue: { total: string | number; lastPaidAt: string | null };
}

export interface SchoolsPage {
  items: ConsoleSchool[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<'all' | Phase, number>;
}

export interface SchoolDetail {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  createdAt: string;
  source: ConsoleSchool['source'];
  application: { contactFirstName: string; contactLastName: string; designation: string; contactEmail: string; contactPhone: string | null; schoolCity: string | null; schoolWebsite: string | null } | null;
  domains: { hostname: string; isPrimary: boolean; verifiedAt: string | null }[];
  subscription: { phase: Phase; locked: boolean; status: string | null; tier: { code: string; name: string } | null; billingCycle: string | null; endsAt: string | null; graceEndsAt: string | null; daysLeft: number | null; features: string[] };
  counts: ConsoleSchool['counts'] & { campuses: number; classes: number };
  settings: { timezone: string; currency: string } | null;
  fees: { outstanding: number; openInvoices: number };
  admins: { id: string; firstName: string; lastName: string; email: string | null; loginId: string; phone: string | null; status: string; lastLoginAt: string | null }[];
  payments: { id: string; amount: string; currency: string; method: string; cardBrand: string | null; cardLast4: string | null; status: string; billingCycle: string; paidAt: string | null; createdAt: string; periodEnd: string | null; failureReason: string | null; /** "plan", or "domain" (the own-domain add-on, which has no tier). */ purpose: string; tier: { name: string } | null }[];
  logins: { id: string; name: string | null; identifier: string; roles: string | null; success: boolean; reason: string | null; method: string; createdAt: string }[];
}

export interface Growth {
  totals: { schools: number; selfSignups: number; onTrial: number; paying: number; everPaid: number; conversion: number };
  byMonth: { month: string; signups: number; selfSignups: number; upgrades: number }[];
}

export type PersonKind = 'teacher' | 'staff' | 'student' | 'parent';

export interface ConsolePerson {
  id: string;
  name: string;
  number: string | null;
  detail: string;
  email: string | null;
  phone: string | null;
  status: string;
  since: string;
  loginId: string | null;
  login: { id: string; loginId: string; email: string | null; lastLoginAt: string | null; status: string } | null;
  school: { id: string; name: string; slug: string };
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Finance {
  currency: 'PKR';
  mrr: number;
  revenue12m: number;
  thisMonth: number;
  paying: number;
  trialing: number;
  byMonth: { month: string; amount: number }[];
  byMethod: { method: string; amount: number }[];
  endingSoon: { school: { id: string; name: string; slug: string }; plan: string; status: string; endsAt: string }[];
}

/** One login (User ID) of a school, as the owner console lists it. */
export interface ConsoleLogin {
  id: string;
  loginId: string;
  name: string;
  roles: string[];
  /** The record the login belongs to; null for logins with no staff, student or parent record (e.g. the admin). */
  linkedTo: { kind: 'Teacher' | 'Staff' | 'Student' | 'Parent'; reference: string | null; detail: string } | null;
  email: string | null;
  emailVerified: boolean;
  status: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  /** password, google, ticket (sign-up link) or support. */
  lastLoginMethod: string | null;
  createdAt: string;
}
