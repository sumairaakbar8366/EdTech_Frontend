import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { admissionService } from '@/features/admissions/services/admissionService';
import type { AdmissionStatus } from '@/features/admissions/types/admission.types';
import { useStudentsAction } from '@/features/students/hooks/useStudents';

export const ADMISSIONS_KEY = ['admissions'] as const;

export const useAdmissionList = (q: { page: number; pageSize: number; q?: string; status?: AdmissionStatus | '' }) =>
  useQuery({ queryKey: [...ADMISSIONS_KEY, 'list', q], queryFn: () => admissionService.list(q), placeholderData: keepPreviousData });
export const useAdmissionSummary = () => useQuery({ queryKey: [...ADMISSIONS_KEY, 'summary'], queryFn: admissionService.summary });
export const useAdmission = (id: string | undefined) => useQuery({ queryKey: [...ADMISSIONS_KEY, 'detail', id], queryFn: () => admissionService.get(id!), enabled: !!id });

/** Admission writes refresh admissions, students and academics (enrollment changes all three). */
export const useAdmissionsAction = useStudentsAction;
