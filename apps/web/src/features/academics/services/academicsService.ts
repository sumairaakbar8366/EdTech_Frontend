import type { AcademicsSummary, AcademicYear, Room, SchoolClass, Subject } from '@/features/academics/types/academics.types';
import { api } from '@/services/api/http';

type Dates = { name: string; startDate: string; endDate: string };

/** Academic structure API (page 10): years, terms, classes, sections, subjects, rooms. */
export const academicsService = {
  summary: () => api<AcademicsSummary>('/academics/summary'),

  years: () => api<AcademicYear[]>('/academics/years'),
  createYear: (body: Dates & { makeCurrent: boolean }) => api('/academics/years', { method: 'POST', body }),
  updateYear: (id: string, body: Dates) => api(`/academics/years/${id}`, { method: 'PATCH', body }),
  setCurrentYear: (id: string) => api(`/academics/years/${id}/set-current`, { method: 'POST' }),
  deleteYear: (id: string) => api(`/academics/years/${id}`, { method: 'DELETE' }),

  createTerm: (yearId: string, body: Dates) => api(`/academics/years/${yearId}/terms`, { method: 'POST', body }),
  updateTerm: (id: string, body: Dates) => api(`/academics/terms/${id}`, { method: 'PATCH', body }),
  deleteTerm: (id: string) => api(`/academics/terms/${id}`, { method: 'DELETE' }),

  classes: () => api<SchoolClass[]>('/academics/classes'),
  saveClass: (id: string | undefined, body: { name: string; level: number }) =>
    id ? api(`/academics/classes/${id}`, { method: 'PATCH', body }) : api('/academics/classes', { method: 'POST', body }),
  deleteClass: (id: string) => api(`/academics/classes/${id}`, { method: 'DELETE' }),
  setClassSubjects: (classId: string, subjectIds: string[]) => api(`/academics/classes/${classId}/subjects`, { method: 'PUT', body: { subjectIds } }),

  createSection: (body: { classId: string; campusId: string; name: string; capacity?: number }) => api('/academics/sections', { method: 'POST', body }),
  updateSection: (id: string, body: { campusId: string; name: string; capacity: number | null }) => api(`/academics/sections/${id}`, { method: 'PATCH', body }),
  deleteSection: (id: string) => api(`/academics/sections/${id}`, { method: 'DELETE' }),

  subjects: () => api<Subject[]>('/academics/subjects'),
  saveSubject: (id: string | undefined, body: { name: string; code: string }) =>
    id ? api(`/academics/subjects/${id}`, { method: 'PATCH', body }) : api('/academics/subjects', { method: 'POST', body }),
  deleteSubject: (id: string) => api(`/academics/subjects/${id}`, { method: 'DELETE' }),

  rooms: () => api<Room[]>('/academics/rooms'),
  createRoom: (body: { campusId: string; name: string; capacity?: number }) => api('/academics/rooms', { method: 'POST', body }),
  updateRoom: (id: string, body: { name: string; capacity: number | null }) => api(`/academics/rooms/${id}`, { method: 'PATCH', body }),
  deleteRoom: (id: string) => api(`/academics/rooms/${id}`, { method: 'DELETE' }),
};
