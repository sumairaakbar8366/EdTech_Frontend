import { api } from '@/services/api/http';
import type { Application, OwnerRegistrationForm, Policy } from '@/features/platform/types/registration.types';
import type { CustomForm } from '@/features/forms/forms';

export interface ChecklistInput { cnic: boolean; ntn: boolean; school: boolean; contact: boolean; note?: string }

export const registrationAdminService = {
  form: () => api<OwnerRegistrationForm>('/platform/registration/form'),
  saveForm: (form: CustomForm, policy: Policy) => api<OwnerRegistrationForm>('/platform/registration/form', { method: 'PUT', body: { form, policy } }),
  applications: (p: { status?: string; q?: string; page: number }) => {
    const qs = new URLSearchParams({ page: String(p.page), pageSize: '15' });
    if (p.status) qs.set('status', p.status);
    if (p.q) qs.set('q', p.q);
    return api<{ items: Application[]; total: number; pending: number; approved: number; rejected: number; page: number; pageSize: number }>(`/platform/registration/applications?${qs}`);
  },
  nic: (id: string) => api<{ nic: string }>(`/platform/registration/applications/${id}/nic`),
  saveChecklist: (id: string, b: ChecklistInput) => api(`/platform/registration/applications/${id}/checklist`, { method: 'PUT', body: b }),
  approve: (id: string, trialDays?: number) => api<{ school: { id: string; name: string; slug: string }; trialDays: number; loginId: string }>(`/platform/registration/applications/${id}/approve`, { method: 'POST', body: { trialDays } }),
  reject: (id: string, reason: string) => api(`/platform/registration/applications/${id}/reject`, { method: 'POST', body: { reason } }),
};
