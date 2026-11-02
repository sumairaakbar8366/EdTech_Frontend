import type { CustomForm } from '@/features/forms/forms';

export interface Band { upTo: number | null; days: number; label: string }
export interface Policy { trialBands: Band[]; requirePhoneCode: boolean; allowedCountries: string[]; schoolTypes: string[]; minStudents: number; maxStudents: number }
export interface OwnerRegistrationForm { form: CustomForm; policy: Policy; reservedIds: string[]; provinces: string[]; phoneChannelReady: boolean }
export interface CheckResult { key: string; label: string; passed: boolean; detail: string; reason?: string }
export interface Verification { items: { cnic: boolean; ntn: boolean; school: boolean; contact: boolean }; note: string | null; by: string; at: string }
export interface Application {
  id: string; status: 'pending' | 'approved' | 'rejected'; schoolName: string; ntn: string; registrationNo: string | null; ownerFirstName: string; ownerLastName: string; designation: string; ownerNicLast4: string;
  email: string; phone: string; emailMethod: string; phoneMethod: string | null; country: string; province: string; city: string; address: string; schoolType: string | null;
  studentCount: number; teacherCount: number; staffCount: number; answers: Record<string, unknown> | null; checks: CheckResult[]; verification: Verification | null;
  decidedAt: string | null; decidedBy: string | null; decisionNote: string | null; trialDays: number | null; schoolId: string | null; createdAt: string; suggestedTrialDays: number;
}
