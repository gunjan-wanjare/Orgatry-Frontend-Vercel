import { formatDistanceToNow } from 'date-fns';
import type { TaskActivity, TaskStatus } from './useTasks';
import { employeeDisplayName } from './task-utils';

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function formatStatus(value?: string | null): string {
  if (!value) {
    return 'updated status';
  }

  return STATUS_LABELS[value] ?? value.replace(/_/g, ' ');
}

export function formatTaskActivity(entry: TaskActivity): string {
  const name = employeeDisplayName(entry.actor);

  switch (entry.action) {
    case 'CREATED':
      return `${name} created this task`;
    case 'ASSIGNED':
      return `${name} assigned task`;
    case 'REASSIGNED':
      return `${name} reassigned task`;
    case 'STATUS_CHANGED':
      return `${name} moved task to ${formatStatus(entry.newValue)}`;
    case 'COMMENT_ADDED':
      return `${name} added a comment`;
    case 'COMMENT_UPDATED':
      return `${name} edited their comment`;
    case 'COMMENT_DELETED':
      return `${name} deleted a comment`;
    case 'DELETED':
      return `${name} deleted this task`;
    default:
      return `${name} updated this task`;
  }
}

export function formatActivityTime(value: string): string {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function isTerminalStatus(status: TaskStatus): boolean {
  return status === 'COMPLETED' || status === 'CANCELLED';
}
