import { ClipboardCheck, Plus } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, Spinner, TextArea } from '@/components/ui';
import { useStaffList } from '@/features/staff/hooks/useStaff';
import { TaskBoard } from '@/features/tasks/components/TaskBoard';
import { taskService, useMyTasks, useTaskAction, useTasks, type TaskPriority } from '@/features/tasks/tasks';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Staff "Assigned Tasks": the employee's own board. */
export function MyTasksPage() {
  const tasks = useMyTasks();
  const move = useTaskAction(taskService.setStatus, 'Task updated');
  return (
    <div>
      <PageHeader title="Assigned Tasks" sub="Work assigned to you by the school office" icon={ClipboardCheck} tone="teal" />
      {tasks.isLoading && <Spinner />}
      {tasks.data?.length === 0 && <Card><EmptyState icon={ClipboardCheck} title="No tasks assigned" tone="teal">New tasks appear here and in your notifications.</EmptyState></Card>}
      {!!tasks.data?.length && <TaskBoard tasks={tasks.data} onMove={(t, status) => move.mutate({ id: t.id, status })} />}
    </div>
  );
}

/** Admin: assign tasks to staff and follow them on one board. */
export function StaffTasksPage() {
  const tasks = useTasks();
  const [assigning, setAssigning] = useState(false);
  const move = useTaskAction(taskService.setStatus, 'Task updated');
  const remove = useTaskAction(taskService.remove, 'Task deleted');
  return (
    <div>
      <PageHeader title="Staff tasks" sub="Assign work to staff and track it to completion" icon={ClipboardCheck} tone="teal" actions={<Button icon={Plus} onClick={() => setAssigning(true)}>Assign task</Button>} />
      {tasks.isLoading && <Spinner />}
      {tasks.data && <TaskBoard tasks={tasks.data} showAssignee onMove={(t, status) => move.mutate({ id: t.id, status })} onDelete={(t) => remove.mutate(t.id)} />}
      <AssignTaskModal open={assigning} onClose={() => setAssigning(false)} />
    </div>
  );
}

function AssignTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const staff = useStaffList({ page: 1, pageSize: 100, status: 'active' });
  const [form, setForm] = useState({ employeeId: '', title: '', details: '', priority: 'normal' as TaskPriority, dueDate: '' });
  const create = useTaskAction(() => taskService.create({ ...form, details: form.details || undefined, dueDate: form.dueDate || undefined }), 'Task assigned', () => {
    setForm({ employeeId: '', title: '', details: '', priority: 'normal', dueDate: '' });
    onClose();
  });
  return (
    <Modal open={open} title="Assign a task" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="assign-task" loading={create.isPending}>Assign</Button></>}>
      <form id="assign-task" onSubmit={onSubmit(() => create.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
        {create.error && <div className="sm:col-span-2"><Alert>{errorMessage(create.error)}</Alert></div>}
        <div className="sm:col-span-2">
          <Field label="Assign to">
            <Select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
              <option value="">Choose a staff member</option>
              {staff.data?.items.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} · {s.designation}</option>)}
            </Select>
          </Field>
        </div>
        <div className="sm:col-span-2"><Field label="Task"><Input required maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Prepare the science lab for Monday" /></Field></div>
        <div className="sm:col-span-2"><Field label="Details (optional)"><TextArea maxLength={2000} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></Field></div>
        <Field label="Priority">
          <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
            <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
          </Select>
        </Field>
        <Field label="Due date (optional)"><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
      </form>
    </Modal>
  );
}
