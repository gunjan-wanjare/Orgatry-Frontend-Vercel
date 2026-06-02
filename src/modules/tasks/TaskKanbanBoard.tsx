import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  TouchSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, useSpring, useTransform } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
import {
  TASK_BOARD_COLUMNS,
  TERMINAL_TASK_STATUSES,
  type TaskListItem,
  type TaskStatus,
  useTaskBoard,
  useUpdateTaskStatusMutation,
} from './useTasks';
import {
  TaskAssigneeAvatar,
  TaskPriorityBadge,
  employeeDisplayName,
  formatTaskDueDate,
  isTaskOverdue,
} from './task-utils';

const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

type TaskKanbanBoardProps = {
  readOnly?: boolean;
  onTaskOpen?: (task: TaskListItem) => void;
};

function AnimatedCount({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 120, damping: 16 });
  const display = useTransform(spring, (latest) => String(Math.round(latest)));

  return <motion.span>{display}</motion.span>;
}

function resolveTargetStatus(overId: string, tasks: TaskListItem[]): TaskStatus | null {
  if (TASK_BOARD_COLUMNS.includes(overId as TaskStatus)) {
    return overId as TaskStatus;
  }

  return tasks.find((task) => task.id === overId)?.status ?? null;
}

function TaskCardContent({ task, dragging = false }: { task: TaskListItem; dragging?: boolean }) {
  const subTaskCount = task._count?.subTasks ?? 0;

  return (
    <div className={cn('space-y-3', dragging && 'scale-[1.02] shadow-lg shadow-cyan-500/10')}>
      <div>
        <p className="line-clamp-2 font-medium text-foreground" title={task.title}>
          {task.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">#{task.taskNumber}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TaskPriorityBadge priority={task.priority} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <TaskAssigneeAvatar employee={task.assignedTo ?? null} />
          <span className="truncate text-xs text-muted-foreground">
            {employeeDisplayName(task.assignedTo)}
          </span>
        </div>
        <span className={cn('text-xs', isTaskOverdue(task) ? 'text-rose-300' : 'text-muted-foreground')}>
          {formatTaskDueDate(task.dueDate)}
        </span>
      </div>

      {subTaskCount > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Subtasks</span>
            <span>{subTaskCount}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SortableTaskCard({
  task,
  readOnly,
  onOpen,
}: {
  task: TaskListItem;
  readOnly?: boolean;
  onOpen?: (task: TaskListItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: readOnly || TERMINAL_TASK_STATUSES.includes(task.status),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-manipulation rounded-2xl border border-border bg-slate-950/70 p-4 text-left shadow-sm transition',
        !readOnly && !TERMINAL_TASK_STATUSES.includes(task.status)
          ? 'cursor-grab hover:border-cyan-400/30 hover:bg-cyan-400/[0.04] active:cursor-grabbing'
          : 'cursor-pointer opacity-95',
        isDragging && 'opacity-40',
      )}
      onClick={() => onOpen?.(task)}
    >
      <TaskCardContent task={task} />
    </motion.div>
  );
}

function KanbanColumn({
  status,
  tasks,
  readOnly,
  onOpen,
}: {
  status: TaskStatus;
  tasks: TaskListItem[];
  readOnly?: boolean;
  onOpen?: (task: TaskListItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full min-h-[36rem] w-72 min-w-[18rem] flex-shrink-0 flex-col overflow-hidden rounded-3xl border border-border bg-white/[0.03]',
        isOver && !readOnly && 'ring-2 ring-cyan-400/30',
      )}
    >
      <div className="space-y-2 border-b border-border/50 p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1 text-sm font-semibold uppercase tracking-wide text-foreground">
            {STATUS_LABELS[status]}
          </span>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            <AnimatedCount value={tasks.length} />
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  {...(readOnly !== undefined ? { readOnly } : {})}
                  {...(onOpen ? { onOpen } : {})}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[12rem] flex-1 items-center justify-center rounded-2xl border border-dashed border-border/70 p-4">
              <EmptyState
                title="No tasks here"
                description={readOnly ? 'Nothing in this column yet.' : 'Drop tasks here to update status.'}
                className="min-h-0 border-0 bg-transparent p-0"
              />
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export function TaskKanbanBoard({ readOnly = false, onTaskOpen }: TaskKanbanBoardProps) {
  const boardQuery = useTaskBoard();
  const moveMutation = useUpdateTaskStatusMutation();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const tasks = boardQuery.data ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const grouped = useMemo(() => {
    const map = new Map<TaskStatus, TaskListItem[]>();
    TASK_BOARD_COLUMNS.forEach((status) => map.set(status, []));

    tasks.forEach((task) => {
      const column = TASK_BOARD_COLUMNS.includes(task.status) ? task.status : 'BACKLOG';
      map.get(column)?.push(task);
    });

    return map;
  }, [tasks]);

  const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over || readOnly) {
      return;
    }

    const activeId = String(active.id);
    const activeItem = tasks.find((task) => task.id === activeId);
    if (!activeItem) {
      return;
    }

    if (TERMINAL_TASK_STATUSES.includes(activeItem.status)) {
      toast.error('Completed or cancelled tasks cannot be moved');
      return;
    }

    const nextStatus = resolveTargetStatus(String(over.id), tasks);
    if (!nextStatus || activeItem.status === nextStatus) {
      return;
    }

    moveMutation.mutate({
      taskId: activeItem.id,
      status: nextStatus,
      updatedAt: activeItem.updatedAt,
    });
  };

  if (boardQuery.isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="inline-flex min-w-full gap-4 pb-2">
          {TASK_BOARD_COLUMNS.map((status) => (
            <div
              key={status}
              className="flex h-[36rem] w-72 min-w-[18rem] flex-shrink-0 flex-col overflow-hidden rounded-3xl border border-border bg-white/[0.03]"
            >
              <div className="border-b border-border/50 p-4 pb-3">
                <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
              </div>
              <div className="space-y-3 p-3">
                <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
                <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (boardQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(boardQuery.error)}
        onRetry={() => void boardQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutGrid className="size-4" />
          Drag tasks across columns to update status
        </div>
        {readOnly ? <Badge variant="outline">View only</Badge> : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="w-full overflow-x-auto pb-2">
          <div className="inline-flex min-w-full gap-4">
            {TASK_BOARD_COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={grouped.get(status) ?? []}
                readOnly={readOnly}
                {...(onTaskOpen ? { onOpen: onTaskOpen } : {})}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-72 rounded-2xl border border-cyan-400/40 bg-slate-950/95 p-4 shadow-xl shadow-cyan-500/10">
              <TaskCardContent task={activeTask} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
