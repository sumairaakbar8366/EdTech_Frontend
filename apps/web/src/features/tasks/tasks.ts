import { useQuery } from '@tanstack/react-query';
import type { Tone } from '@/components/ui';
import { NOTIFICATIONS_KEY } from '@/features/communication/hooks/useCommunication';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';

// Small feature: types, service and hooks in one module (as features/leave).

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

export interface StaffTask {
  id: string;
  employeeId: string;
  title: string;
  details: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  status: TaskStatus;
  note: string | null;
  completedAt: string | null;
  createdAt: string;
  employee?: { id: string; firstName: string; lastName: string; designation: string; staffType: 'teaching' | 'non_teaching' };
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
export const TASK_STATUS_TONE: Record<TaskStatus, Tone> = { todo: 'amber', in_progress: 'sky', done: 'emerald' };
export const TASK_PRIORITY_TONE: Record<TaskPriority, Tone> = { low: 'slate', normal: 'primary', high: 'rose' };

export const taskService = {
  list: (status?: TaskStatus) => api<StaffTask[]>(`/tasks${status ? `?status=${status}` : ''}`),
  mine: () => api<StaffTask[]>('/tasks/mine'),
  create: (body: { employeeId: string; title: string; details?: string; priority: TaskPriority; dueDate?: string }) => api<StaffTask>('/tasks', { method: 'POST', body }),
  setStatus: ({ id, status, note }: { id: string; status: TaskStatus; note?: string }) => api<StaffTask>(`/tasks/${id}/status`, { method: 'PATCH', body: { status, note } }),
  remove: (id: string) => api(`/tasks/${id}`, { method: 'DELETE' }),
};

const TASKS_KEY = ['tasks'] as const;
export const useTasks = (status?: TaskStatus) => useQuery({ queryKey: [...TASKS_KEY, 'all', status], queryFn: () => taskService.list(status) });
export const useMyTasks = () => useQuery({ queryKey: [...TASKS_KEY, 'mine'], queryFn: taskService.mine });
export function useTaskAction<TVars, TResult = unknown>(fn: (v: TVars) => Promise<TResult>, success?: string, onDone?: () => void) {
  return useAction(fn, { success, onDone, invalidate: [TASKS_KEY, NOTIFICATIONS_KEY] });
}

/** Overdue when a due date has passed and the task is not done. */
export const isOverdue = (t: StaffTask) => t.status !== 'done' && !!t.dueDate && t.dueDate.slice(0, 10) < new Date().toISOString().slice(0, 10);
