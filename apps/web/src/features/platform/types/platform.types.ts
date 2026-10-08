import type { PlanFeature } from '@schoolerp/shared';

export interface Tier {
  id: string;
  code: string;
  name: string;
  maxCampuses: number | null;
  maxStudents: number | null;
  maxStaff: number | null;
  pricingModel: string;
  priceMonthly: string | null;
  priceAnnual: string | null;
  currency: string;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeature[];
  /** Schools on this plan now. */
  schools: { paying: number; trial: number };
  /** Only a plan no school has ever used can be deleted. */
  canDelete: boolean;
}

export interface TierPayload {
  code?: string;
  name: string;
  pricingModel: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  currency: string;
  maxCampuses: number | null;
  maxStudents: number | null;
  maxStaff: number | null;
  features: PlanFeature[];
  isActive: boolean;
  sortOrder?: number;
}

export interface TierFilter {
  q?: string;
  status?: 'all' | 'active' | 'inactive';
}

export interface SchoolSummary {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  createdAt: string;
  subscriptions: { status: string; trialEndsAt: string | null; tier: { code: string; name: string } }[];
}

export interface SchoolApplication {
  id: string;
  schoolName: string;
  contactFirstName: string;
  contactLastName: string;
  designation: string;
  contactEmail: string;
  contactPhone: string | null;
  schoolCity: string | null;
  schoolWebsite: string | null;
  requestedTierCode: string | null;
  preferredBrandColor: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'onboarded';
  schoolId: string | null;
  reviewedAt: string | null;
  createdAt: string;
}
