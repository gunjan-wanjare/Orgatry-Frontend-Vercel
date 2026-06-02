import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ErrorState } from '@/components/shared/ErrorState';
import { permissions } from '@/constants/permissions';
import { getErrorMessage } from '@/lib/errors';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/store/auth.store';
import {
  TASK_BOARD_COLUMNS,
  TERMINAL_TASK_STATUSES,
  useAddTaskCommentMutation,
  useAssigneeOptions,
  useDeleteTaskCommentMutation,
  useDeleteTaskMutation,
  useTaskDetail,
  useUpdateTaskCommentMutation,
  useUpdateTaskMutation,
  type TaskPriority,
  type TaskStatus,
} from './useTasks';
import {
  TaskAssigneeAvatar,
  TaskPriorityBadge,
  TaskStatusBadge,
  employeeDisplayName,
  isTaskOverdue,
} from './task-utils';
import { formatActivityTime, formatTaskActivity, isTerminalStatus } from './task-activity';

type TaskDetailModalProps = {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PRIORITY_OPTIONS: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function TaskDetailModal({ taskId, open, onOpenChange }: TaskDetailModalProps) {
  const user = useAuthStore((state) => state.user);
  const { canAny } = usePermissions();
  const taskQuery = useTaskDetail(taskId, open);
  const updateTask = useUpdateTaskMutation();
  const deleteTask = useDeleteTaskMutation();
  const addComment = useAddTaskCommentMutation();
  const updateComment = useUpdateTaskCommentMutation();
  const deleteComment = useDeleteTaskCommentMutation();
  const assigneeQuery = useAssigneeOptions(undefined, open);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const task = taskQuery.data;

  const canEdit = canAny([
    permissions.tasksEditSelf,
    permissions.tasksEditTeam,
    permissions.tasksEditDepartment,
    permissions.tasksEditAll,
  ]);
  const canDelete = canAny([
    permissions.tasksDeleteSelf,
    permissions.tasksDeleteTeam,
    permissions.tasksDeleteDepartment,
    permissions.tasksDeleteAll,
  ]);
  const canComment = canAny([permissions.tasksComment]);
  const canModerateComments = canAny([
    permissions.tasksEditTeam,
    permissions.tasksEditDepartment,
    permissions.tasksEditAll,
  ]);

  const isTerminal = task ? isTerminalStatus(task.status) : false;
  const canModifyFields = canEdit && !isTerminal;

  useEffect(() => {
    if (!task) {
      return;
    }

    setTitle(task.title);
    setDescription(task.description ?? '');
  }, [task]);

  const completedSubTasks = useMemo(
    () => task?.subTasks.filter((subTask) => subTask.status === 'COMPLETED').length ?? 0,
    [task?.subTasks],
  );
  const totalSubTasks = task?.subTasks.length ?? 0;
  const subTaskPercent = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

  const saveTask = async (patch: Partial<{
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    assignedToId: string | null;
    dueDate: string | null;
    startDate: string | null;
  }>) => {
    if (!task) {
      return;
    }

    await updateTask.mutateAsync({
      taskId: task.id,
      payload: {
        ...patch,
        updatedAt: task.updatedAt,
      },
    });
  };

  const handleSaveBasics = async () => {
    if (!task) {
      return;
    }

    await saveTask({
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
    });
  };

  const handleAddComment = async () => {
    if (!task || !commentDraft.trim()) {
      return;
    }

    await addComment.mutateAsync({ taskId: task.id, content: commentDraft.trim() });
    setCommentDraft('');
  };

  const handleSaveComment = async (commentId: string) => {
    if (!task || !editingCommentContent.trim()) {
      return;
    }

    await updateComment.mutateAsync({
      commentId,
      content: editingCommentContent.trim(),
      taskId: task.id,
    });
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!task) {
      return;
    }

    await deleteComment.mutateAsync({ commentId, taskId: task.id });
  };

  const handleDeleteTask = async () => {
    if (!task) {
      return;
    }

    await deleteTask.mutateAsync(task.id);
    setDeleteOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{task ? `Task #${task.taskNumber}` : 'Task Details'}</DialogTitle>
            <DialogDescription>Review task context, update fields, comments, and activity history.</DialogDescription>
          </DialogHeader>

          {taskQuery.isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : taskQuery.isError ? (
            <ErrorState
              title="Unable to load task"
              message={getErrorMessage(taskQuery.error)}
              onRetry={() => void taskQuery.refetch()}
            />
          ) : !task ? (
            <p className="text-sm text-muted-foreground">Task not found or unavailable.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    value={title}
                    disabled={!canModifyFields}
                    onChange={(event) => setTitle(event.target.value)}
                    onBlur={() => {
                      if (canModifyFields && title.trim() !== task.title) {
                        void handleSaveBasics();
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    rows={5}
                    value={description}
                    disabled={!canModifyFields}
                    onChange={(event) => setDescription(event.target.value)}
                    onBlur={() => {
                      const next = description.trim() ? description.trim() : '';
                      const current = task.description?.trim() ?? '';
                      if (canModifyFields && next !== current) {
                        void handleSaveBasics();
                      }
                    }}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={task.status}
                      disabled={!canModifyFields}
                      onValueChange={(value) => void saveTask({ status: value as TaskStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_BOARD_COLUMNS.map((status) => (
                          <SelectItem key={status} value={status} disabled={TERMINAL_TASK_STATUSES.includes(task.status) && status !== task.status}>
                            {status.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isTerminal ? (
                      <p className="text-xs text-muted-foreground">Terminal status — further status changes are blocked.</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={task.priority}
                      disabled={!canModifyFields}
                      onValueChange={(value) => void saveTask({ priority: value as TaskPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0) + priority.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Subtasks</Label>
                    <span className="text-sm text-muted-foreground">
                      {completedSubTasks}/{totalSubTasks} complete ({subTaskPercent}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                      style={{ width: `${subTaskPercent}%` }}
                    />
                  </div>
                  {task.subTasks.length > 0 ? (
                    <div className="space-y-2">
                      {task.subTasks.map((subTask) => (
                        <div key={subTask.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2">
                          <div>
                            <p className="text-sm font-medium">{subTask.title}</p>
                            <p className="text-xs text-muted-foreground">#{subTask.taskNumber}</p>
                          </div>
                          <TaskStatusBadge status={subTask.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No subtasks linked to this task.</p>
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-border p-4">
                  <Label>Comments</Label>
                  {task.comments.length > 0 ? (
                    <div className="space-y-3">
                      {task.comments.map((comment) => {
                        const isAuthor = comment.authorId === user?.employeeId;
                        const isEditing = editingCommentId === comment.id;
                        const canDeleteComment = (isAuthor && canComment) || canModerateComments;

                        return (
                          <div key={comment.id} className="rounded-lg border border-border/70 p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <TaskAssigneeAvatar employee={comment.author ?? null} />
                                <div>
                                  <p className="text-sm font-medium">{employeeDisplayName(comment.author)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    {comment.editedAt ? ' · edited' : ''}
                                  </p>
                                </div>
                              </div>
                              {isAuthor && canComment ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditingCommentContent(comment.content);
                                    }}
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                  {canDeleteComment ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => void handleDeleteComment(comment.id)}
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  ) : null}
                                </div>
                              ) : canDeleteComment ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => void handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              ) : null}
                            </div>
                            {isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  rows={3}
                                  value={editingCommentContent}
                                  onChange={(event) => setEditingCommentContent(event.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button type="button" size="sm" onClick={() => void handleSaveComment(comment.id)}>
                                    Save
                                  </Button>
                                  <Button type="button" size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap text-sm text-foreground">{comment.content}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}

                  {canComment ? (
                    <div className="space-y-2 pt-2">
                      <Textarea
                        rows={3}
                        placeholder="Write a comment"
                        value={commentDraft}
                        onChange={(event) => setCommentDraft(event.target.value)}
                      />
                      <Button type="button" disabled={!commentDraft.trim() || addComment.isPending} onClick={() => void handleAddComment()}>
                        {addComment.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        Add Comment
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-border p-4 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Creator</p>
                    <div className="mt-2 flex items-center gap-2">
                      <TaskAssigneeAvatar employee={task.createdBy} />
                      <div>
                        <p className="text-sm font-medium">{employeeDisplayName(task.createdBy)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select
                      value={task.assignedToId ?? 'none'}
                      disabled={!canModifyFields}
                      onValueChange={(value) =>
                        void saveTask({ assignedToId: value === 'none' ? null : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {(assigneeQuery.data ?? []).map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employeeDisplayName(employee)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Reporting Manager</p>
                    <p className="mt-2 text-sm">{employeeDisplayName(task.reportingManager)}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
                    <p className="mt-2 text-sm">{task.department?.name ?? task.createdBy.department ?? '—'}</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Start Date</p>
                      <Input
                        type="date"
                        className="mt-2"
                        disabled={!canModifyFields}
                        value={task.startDate ? task.startDate.slice(0, 10) : ''}
                        onChange={(event) =>
                          void saveTask({
                            startDate: event.target.value ? new Date(event.target.value).toISOString() : null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Due Date</p>
                      <Input
                        type="date"
                        className="mt-2"
                        disabled={!canModifyFields}
                        value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                        onChange={(event) =>
                          void saveTask({
                            dueDate: event.target.value ? new Date(event.target.value).toISOString() : null,
                          })
                        }
                      />
                      {isTaskOverdue(task) ? <p className="mt-1 text-xs text-rose-300">Overdue</p> : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                  </div>

                  {canDelete ? (
                    <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
                      Delete Task
                    </Button>
                  ) : null}
                </div>

                <div className="rounded-xl border border-border p-4">
                  <Label>Activity</Label>
                  <div className="mt-4 space-y-4">
                    {task.activityLogs.length > 0 ? (
                      task.activityLogs.map((entry) => (
                        <div key={entry.id} className="flex gap-3">
                          <TaskAssigneeAvatar employee={entry.actor ?? null} />
                          <div>
                            <p className="text-sm">{formatTaskActivity(entry)}</p>
                            <p className="text-xs text-muted-foreground">{formatActivityTime(entry.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteOpen}
        title="Delete task?"
        description="This task will be soft deleted and removed from active lists."
        confirmLabel="Delete task"
        variant="danger"
        isLoading={deleteTask.isPending}
        onConfirm={() => void handleDeleteTask()}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
