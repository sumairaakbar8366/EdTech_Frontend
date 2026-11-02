import { api } from '@/services/api/http';
import type { CustomForm } from '@/features/forms/forms';

export interface Overview {
  programs: { live: number; recruiting: number; draft: number; closed: number };
  offers: { sent: number; viewed: number; submitted: number; declined: number };
  requests: { waiting: number; approved: number; rejected: number };
  children: { total: number; pledged: number; disbursed: number };
  money: { committed: number; pledged: number; disbursed: number };
  activeSchools: number; newOpportunities: number;
}
export interface Opportunity { id: string; schoolId: string; title: string; kind: string; startsOn: string | null; details: string | null; status: 'new' | 'offered' | 'dismissed'; createdAt: string; school: { id: string; name: string }; offers: number }
export interface Sponsor { id: string; name: string; kind: string; contactName: string | null; email: string | null; phone: string | null; notes: string | null; isActive: boolean; _count: { programs: number } }
export type ProgramStatus = 'draft' | 'recruiting' | 'live' | 'closed';
export interface Program {
  id: string; title: string; sponsorId: string | null; sponsor: { id: string; name: string } | null; description: string | null; criteria: string | null; awardAmount: number | null; budget: number | null; currency: string; slots: number; deadline: string | null; status: ProgramStatus;
  offersSent: number; offersAnswered: number; students: number; committed: number; disbursed: number; slotsLeft: number;
  targetLevels: number[]; period: 'yearly' | 'semester'; currentPeriod: string | null; continuesToUndergrad: boolean; minAverage: number; minAttendance: number; needRequired: boolean;
}
export interface Offer { id: string; status: string; sentAt: string; viewedAt: string | null; respondedAt: string | null; expiresAt: string; message: string | null; school: { id: string; name: string }; program: { id: string; title: string }; opportunity: { title: string } | null }
export interface ReqGrant { id: string; studentName: string; className: string | null; amount: number; status: string }
export interface ScholarshipRequest { id: string; status: 'submitted' | 'approved' | 'rejected'; studentsRequested: number; contactName: string | null; contactEmail: string | null; answers: Record<string, unknown>; reviewNote: string | null; createdAt: string; school: { id: string; name: string }; program: { id: string; title: string; awardAmount: number | null }; grants: ReqGrant[] }
export interface Grant { id: string; studentName: string; className: string | null; amount: number; status: 'pledged' | 'disbursed' | 'cancelled'; awardedOn: string; disbursedOn: string | null; school: { id: string; name: string }; program: { id: string; title: string; currency: string } }
export interface SchoolRow { id: string; name: string; slug: string; city: string | null; province: string | null; plan: string; students: number; newStudents: number; teachers: number; staff: number; attendancePercent: number | null; collected: number; billed: number; outstanding: number; salaries: number; surplus: number; admissions: number; scholarshipChildren: number; scholarshipAmount: number; offers: number }
export type SponsorInput = { name: string; kind?: string; contactName?: string; email?: string; phone?: string; notes?: string; isActive?: boolean };
export type ProgramInput = { targetLevels?: number[]; period?: 'yearly' | 'semester'; currentPeriod?: string | null; continuesToUndergrad?: boolean; minAverage?: number; minAttendance?: number; needRequired?: boolean; title: string; sponsorId?: string | null; description?: string; criteria?: string; awardAmount?: number | null; budget?: number | null; slots?: number; deadline?: string | null; status?: ProgramStatus };

export interface CandidateRow { id: string; periodLabel: string; studentName: string; className: string; level: number; average: number; attendance: number; meritScore: number; needScore: number; rankScore: number; reasons: string[]; needNote: string; status: 'confirmed' | 'selected' | 'rejected' | 'awarded'; school: { id: string; name: string } }
export interface CandidateList { period: string; periods: string[]; program: { id: string; title: string; slots: number; targetLevels: number[]; continuesToUndergrad: boolean }; items: CandidateRow[] }

// --- The school's side: shortlist from its own data, then confirm ---
export interface SchoolProgram { requestId: string; programId: string; title: string; sponsor: string | null; description: string | null; criteria: string | null; awardAmount: number | null; currency: string; targetLevels: number[]; continuesToUndergrad: boolean; period: string; currentPeriod: string; minAverage: number; minAttendance: number; needRequired: boolean; slots: number; confirmed: number; selected: number }
export interface ShortlistRow { studentId: string; name: string; className: string; level: number; average: number | null; attendance: number | null; status: string | null; meritScore: number; needScore: number; rankScore: number; eligible: boolean; excellent: boolean; reasons: string[]; blockers: string[] }
export const schoolScholarshipService = {
  programs: () => api<SchoolProgram[]>('/scholarship-candidates/programs'),
  shortlist: (requestId: string) => api<{ period: string; rows: ShortlistRow[]; eligible: number }>(`/scholarship-candidates/${requestId}/shortlist`),
  nominations: (requestId: string) => api<{ id: string; periodLabel: string; studentName: string; className: string; status: string; rankScore: number }[]>(`/scholarship-candidates/${requestId}/nominations`),
  confirm: (requestId: string, students: { studentId: string; needNote: string }[]) => api<{ confirmed: number; skipped: number; period: string }>(`/scholarship-candidates/${requestId}/confirm`, { method: 'POST', body: { students } }),
};

const B = '/platform/scholarships';
export const sponsorshipService = {
  overview: () => api<Overview>(`${B}/overview`),
  schools: () => api<SchoolRow[]>(`${B}/schools`),
  opportunities: (status?: string) => api<Opportunity[]>(`${B}/opportunities${status ? `?status=${status}` : ''}`),
  offerFromOpportunity: (id: string, b: { programId?: string; message?: string }) => api<{ school: string; program: string; emailedTo: number }>(`${B}/opportunities/${id}/offer`, { method: 'POST', body: b }),
  dismiss: (id: string) => api(`${B}/opportunities/${id}/dismiss`, { method: 'POST' }),
  sendOffer: (b: { schoolId: string; programId?: string; message?: string }) => api<{ school: string; program: string; emailedTo: number }>(`${B}/offers`, { method: 'POST', body: b }),
  offers: () => api<Offer[]>(`${B}/offers`),
  withdraw: (id: string) => api(`${B}/offers/${id}/withdraw`, { method: 'POST' }),
  sponsors: () => api<Sponsor[]>(`${B}/sponsors`),
  saveSponsor: (id: string | null, b: SponsorInput) => (id ? api<Sponsor>(`${B}/sponsors/${id}`, { method: 'PUT', body: b }) : api<Sponsor>(`${B}/sponsors`, { method: 'POST', body: b })),
  removeSponsor: (id: string) => api(`${B}/sponsors/${id}`, { method: 'DELETE' }),
  programs: () => api<Program[]>(`${B}/programs`),
  saveProgram: (id: string | null, b: ProgramInput) => (id ? api<Program>(`${B}/programs/${id}`, { method: 'PUT', body: b }) : api<Program>(`${B}/programs`, { method: 'POST', body: b })),
  requests: () => api<ScholarshipRequest[]>(`${B}/requests`),
  decide: (id: string, status: 'approved' | 'rejected', note?: string) => api(`${B}/requests/${id}/decision`, { method: 'POST', body: { status, note } }),
  addGrants: (id: string, grants: { studentName: string; className?: string; amount: number }[]) => api<{ added: number }>(`${B}/requests/${id}/grants`, { method: 'POST', body: { grants } }),
  grants: () => api<Grant[]>(`${B}/grants`),
  candidates: (programId: string, period?: string) => api<CandidateList>(`${B}/candidates?programId=${programId}${period ? `&period=${encodeURIComponent(period)}` : ''}`),
  decideCandidates: (ids: string[], status: 'selected' | 'rejected' | 'confirmed') => api<{ updated: number }>(`${B}/candidates/decide`, { method: 'POST', body: { ids, status } }),
  awardCandidates: (programId: string, period: string) => api<{ awarded: number; schools: number }>(`${B}/candidates/award`, { method: 'POST', body: { programId, period } }),
  grantStatus: (id: string, status: 'pledged' | 'disbursed' | 'cancelled') => api(`${B}/grants/${id}/status`, { method: 'POST', body: { status } }),
  form: () => api<CustomForm>(`${B}/form`),
  saveForm: (form: CustomForm) => api<CustomForm>(`${B}/form`, { method: 'PUT', body: { form } }),
  eventKinds: () => api<{ key: string; label: string }[]>(`${B}/event-kinds`),
};

// --- The school's private page (public, by link) ---
export interface OfferPage {
  school: string; status: string; open: boolean; message: string | null; expiresAt: string;
  program: { title: string; description: string | null; criteria: string | null; sponsor: string | null; awardAmount: number | null; currency: string; deadline: string | null };
  form: CustomForm | null;
}
export const offerPageService = {
  get: (token: string) => api<OfferPage>(`/public/scholarship-offers/${encodeURIComponent(token)}`),
  submit: (token: string, b: { contactName: string; contactEmail: string; studentsRequested: number; answers: Record<string, unknown> }) => api<{ message: string }>(`/public/scholarship-offers/${encodeURIComponent(token)}`, { method: 'POST', body: b }),
  decline: (token: string) => api<{ message: string }>(`/public/scholarship-offers/${encodeURIComponent(token)}/decline`, { method: 'POST' }),
};

export const pkr = (v: number, cur = 'PKR') => `${cur} ${Math.round(v).toLocaleString('en-PK')}`;
