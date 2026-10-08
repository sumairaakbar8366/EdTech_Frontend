import { api } from '@/services/api/http';

export interface SchoolApplicationRequest {
  schoolName: string;
  contactFirstName: string;
  contactLastName: string;
  designation: string;
  contactEmail: string;
  contactPhone: string;
  schoolCity: string;
  schoolWebsite: string;
  requestedTierCode: string;
  preferredBrandColor: string;
  notes: string;
}

/** Public (signed-out) marketing API. */
export const marketingService = {
  /** A school asks to join; the platform owner reviews it under Applications. */
  applyForSchool: (a: SchoolApplicationRequest) =>
    api('/public/school-applications', { method: 'POST', body: { ...a, requestedTierCode: a.requestedTierCode || undefined, preferredBrandColor: a.preferredBrandColor || undefined } }),
};
