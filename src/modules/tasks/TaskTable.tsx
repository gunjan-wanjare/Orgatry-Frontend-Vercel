import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import type { TaskListItem } from './useTasks';
import {
  TaskAssigneeAvatar,
  TaskPriorityBadge,
  TaskStatusBadge,
  employeeDisplayName,
  formatTaskDueDate,
  isTaskOverdue,
} from './task-utils';

type TaskTableProps = {
  tasks: TaskListItem[];
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick?: (task: TaskListItem) => void;
  showCreator?: boolean;
};

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-lg bg-white/[0.04]" />
      ))}
    </div>
  );
}

export function TaskTable({
  tasks,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
  onRowClick,
  showCreator = false,
}: TaskTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="Try another filter or create a new task when task creation is enabled."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-white/[0.03] text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              {showCreator ? <th className="px-4 py-3 font-medium">Creator</th> : null}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={cn(
                  'border-b border-border/60 transition-colors last:border-b-0',
                  onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : undefined,
                )}
                onClick={() => onRowClick?.(task)}
              >
                <td className="px-4 py-3">
                  <div className="max-w-xs truncate font-medium text-foreground" title={task.title}>
                    #{task.taskNumber} {task.title}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <TaskPriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-3">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td className={cn('px-4 py-3', isTaskOverdue(task) ? 'text-rose-300' : 'text-foreground')}>
                  {formatTaskDueDate(task.dueDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TaskAssigneeAvatar employee={task.assignedTo ?? null} />
                    <span className="truncate text-muted-foreground">{employeeDisplayName(task.assignedTo)}</span>
                  </div>
                </td>
                {showCreator ? (
                  <td className="px-4 py-3 text-muted-foreground">{employeeDisplayName(task.createdBy)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TaskAnalyticsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
      ))}
    </div>
  );
}

export function TaskTableLoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Refreshing tasks...
    </div>
  );
}
