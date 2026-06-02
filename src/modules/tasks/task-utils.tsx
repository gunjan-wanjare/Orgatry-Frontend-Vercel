import { parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TaskEmployee, TaskListItem, TaskPriority, TaskStatus } from './useTasks';

export function employeeDisplayName(employee?: TaskEmployee | null): string {
  if (!employee) {
    return 'Deleted User';
  }

  return `${employee.firstName} ${employee.lastName}`.trim();
}

export function formatTaskDueDate(value?: string | null): string {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parseISO(value));
}

export function isTaskOverdue(task: TaskListItem): boolean {
  if (!task.dueDate || task.status === 'COMPLETED' || task.status === 'CANCELLED') {
    return false;
  }

  const due = parseISO(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  BACKLOG: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  TODO: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  IN_PROGRESS: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  REVIEW: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  COMPLETED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  CANCELLED: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  MEDIUM: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  HIGH: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  CRITICAL: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant="outline" className={cn('font-medium capitalize', PRIORITY_STYLES[priority])}>
      {priority.toLowerCase()}
    </Badge>
  );
}

export function TaskAssigneeAvatar({ employee }: { employee?: TaskEmployee | null }) {
  const name = employeeDisplayName(employee);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (employee?.profilePhoto) {
    return (
      <img
        src={employee.profilePhoto}
        alt={name}
        className="size-7 rounded-full border border-white/10 object-cover"
      />
    );
  }

  return (
    <div className="grid size-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.08]">
      <span className="text-[10px] font-medium text-white/60">{initials || '?'}</span>
    </div>
  );
}

export function scopeLabel(scope: string | undefined): string {
  switch (scope) {
    case 'all':
      return 'Organization-wide visibility';
    case 'department':
      return 'Department visibility';
    case 'team':
      return 'Team visibility';
    case 'self':
      return 'Personal visibility';
    default:
      return 'Scoped visibility';
  }
}

export function exportTasksCsv(tasks: TaskListItem[], filename = 'team-tasks.csv') {
  const headers = ['Task Number', 'Title', 'Status', 'Priority', 'Due Date', 'Assignee', 'Creator', 'Department'];
  const rows = tasks.map((task) => [
    String(task.taskNumber),
    task.title,
    task.status,
    task.priority,
    task.dueDate ? formatTaskDueDate(task.dueDate) : '',
    employeeDisplayName(task.assignedTo),
    employeeDisplayName(task.createdBy),
    task.department?.name ?? task.createdBy.department ?? '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
