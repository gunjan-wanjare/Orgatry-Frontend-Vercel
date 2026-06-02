import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpClient } from '@/services/api/http-client';
import { endpoints } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type { PaginatedResult } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';

export type TaskStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TaskView =
  | 'assigned'
  | 'created'
  | 'dueToday'
  | 'overdue'
  | 'upcoming'
  | 'completed';

export type TaskEmployee = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department: string;
  profilePhoto?: string | null;
};

export type TaskListItem = {
  id: string;
  taskNumber: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  assignedToId?: string | null;
  reportingManagerId?: string | null;
  departmentId?: string | null;
  parentTaskId?: string | null;
  createdBy: TaskEmployee;
  assignedTo?: TaskEmployee | null;
  reportingManager?: TaskEmployee | null;
  department?: { id: string; name: string } | null;
  _count?: {
    subTasks: number;
    comments: number;
  };
};

export type TaskSubTask = {
  id: string;
  taskNumber: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assignedTo?: TaskEmployee | null;
};

export type TaskComment = {
  id: string;
  taskId: string;
  authorId?: string | null;
  content: string;
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: TaskEmployee | null;
};

export type TaskActivity = {
  id: string;
  taskId: string;
  actorId?: string | null;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
  actor?: TaskEmployee | null;
};

export type TaskDetail = TaskListItem & {
  parentTask?: { id: string; taskNumber: number; title: string; status: TaskStatus } | null;
  subTasks: TaskSubTask[];
  comments: TaskComment[];
  activityLogs: TaskActivity[];
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  assignedToId?: string | null;
  reportingManagerId?: string | null;
  departmentId?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  parentTaskId?: string | null;
  subTasks?: Array<{ title: string }>;
  idempotencyKey?: string;
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string | null;
  reportingManagerId?: string | null;
  departmentId?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  parentTaskId?: string | null;
  updatedAt: string;
};

export type TaskAnalytics = {
  open: number;
  completed: number;
  dueToday: number;
  overdue: number;
  completionRate: number;
  scope?: string;
};

export type AssigneeOption = TaskEmployee;

export type TaskListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  departmentId?: string;
  view?: TaskView;
  enabled?: boolean;
};

export const TASK_BOARD_COLUMNS: TaskStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
  'CANCELLED',
];

export const TERMINAL_TASK_STATUSES: TaskStatus[] = ['COMPLETED', 'CANCELLED'];

export const taskQueryKeys = {
  all: ['tasks'] as const,
  list: (params: TaskListParams) => ['tasks', 'list', params] as const,
  board: ['tasks', 'board'] as const,
  selfAnalytics: ['tasks', 'analytics', 'self'] as const,
  teamAnalytics: ['tasks', 'analytics', 'team'] as const,
  assigneeOptions: (search?: string) => ['tasks', 'assignee-options', search ?? ''] as const,
  detail: (taskId: string) => ['tasks', 'detail', taskId] as const,
  parentOptions: (search?: string) => ['tasks', 'parent-options', search ?? ''] as const,
};

export function invalidateTaskQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
}

export function useTaskList(params: TaskListParams) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: taskQueryKeys.list(params),
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<PaginatedResult<TaskListItem>>>(endpoints.tasks, {
        params: queryParams,
      });
      return res.data.data ?? { items: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useTaskSelfAnalytics(enabled = true) {
  return useQuery({
    queryKey: taskQueryKeys.selfAnalytics,
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<TaskAnalytics>>(endpoints.tasksAnalyticsSelf);
      return res.data.data ?? { open: 0, completed: 0, dueToday: 0, overdue: 0, completionRate: 0 };
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useTaskTeamAnalytics(enabled = true) {
  return useQuery({
    queryKey: taskQueryKeys.teamAnalytics,
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<TaskAnalytics>>(endpoints.tasksAnalyticsTeam);
      return res.data.data ?? { open: 0, completed: 0, dueToday: 0, overdue: 0, completionRate: 0, scope: 'none' };
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useAssigneeOptions(search?: string, enabled = true) {
  return useQuery({
    queryKey: taskQueryKeys.assigneeOptions(search),
    queryFn: async () => {
      const res = await httpClient.get<
        ApiResponse<PaginatedResult<AssigneeOption> & { scope?: string }>
      >(endpoints.tasksAssigneeOptions, {
        params: { search, page: 1, limit: 50 },
      });
      return res.data.data?.items ?? [];
    },
    enabled,
    staleTime: 60_000,
  });
}

export async function fetchTasksForExport(params: Omit<TaskListParams, 'enabled' | 'page'>) {
  const res = await httpClient.get<ApiResponse<PaginatedResult<TaskListItem>>>(endpoints.tasks, {
    params: { ...params, page: 1, limit: 100 },
  });
  return res.data.data?.items ?? [];
}

export function useTaskBoard(enabled = true) {
  return useQuery({
    queryKey: taskQueryKeys.board,
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<PaginatedResult<TaskListItem>>>(endpoints.tasks, {
        params: {
          page: 1,
          limit: 100,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        },
      });
      return res.data.data?.items ?? [];
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { taskId: string; status: TaskStatus; updatedAt: string }) => {
      const res = await httpClient.patch<ApiResponse<TaskDetail>>(
        endpoints.taskStatus(input.taskId),
        {
          status: input.status,
          updatedAt: input.updatedAt,
        },
      );
      return res.data.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: taskQueryKeys.board });
      const previousBoard = queryClient.getQueryData<TaskListItem[]>(taskQueryKeys.board);

      queryClient.setQueryData<TaskListItem[]>(taskQueryKeys.board, (current) =>
        (current ?? []).map((task) =>
          task.id === input.taskId
            ? { ...task, status: input.status, updatedAt: new Date().toISOString() }
            : task,
        ),
      );

      return { previousBoard };
    },
    onError: (error, _input, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(taskQueryKeys.board, context.previousBoard);
      }
      toast.error(getErrorMessage(error));
    },
    onSuccess: (_data, input) => {
      toast.success('Task status updated');
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(input.taskId) });
    },
    onSettled: () => {
      invalidateTaskQueries(queryClient);
    },
  });
}

export function useTaskDetail(taskId: string | null, enabled = true) {
  return useQuery({
    queryKey: taskQueryKeys.detail(taskId ?? ''),
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<TaskDetail>>(endpoints.taskDetail(taskId!));
      return res.data.data!;
    },
    enabled: Boolean(taskId) && enabled,
    staleTime: 15_000,
  });
}

export function useParentTaskOptions(search?: string, enabled = true) {
  return useQuery({
    queryKey: taskQueryKeys.parentOptions(search),
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<PaginatedResult<TaskListItem>>>(endpoints.tasks, {
        params: { search, page: 1, limit: 20, sortBy: 'updatedAt', sortOrder: 'desc' },
      });
      return res.data.data?.items ?? [];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const res = await httpClient.post<ApiResponse<TaskDetail>>(endpoints.tasks, payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Task created');
      invalidateTaskQueries(queryClient);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) => {
      const res = await httpClient.patch<ApiResponse<TaskDetail>>(endpoints.taskDetail(taskId), payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success('Task updated');
      if (data) {
        queryClient.setQueryData(taskQueryKeys.detail(data.id), data);
      }
      invalidateTaskQueries(queryClient);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await httpClient.delete(endpoints.taskDetail(taskId));
      return taskId;
    },
    onSuccess: () => {
      toast.success('Task deleted');
      invalidateTaskQueries(queryClient);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useAddTaskCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const res = await httpClient.post<ApiResponse<TaskComment>>(endpoints.taskComments(taskId), { content });
      return res.data.data;
    },
    onSuccess: (_comment, input) => {
      toast.success('Comment added');
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(input.taskId) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateTaskCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content, taskId }: { commentId: string; content: string; taskId: string }) => {
      const res = await httpClient.patch<ApiResponse<TaskComment>>(endpoints.taskComment(commentId), { content });
      return { comment: res.data.data, taskId };
    },
    onSuccess: (result) => {
      toast.success('Comment updated');
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(result.taskId) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteTaskCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, taskId }: { commentId: string; taskId: string }) => {
      await httpClient.delete(endpoints.taskComment(commentId));
      return taskId;
    },
    onSuccess: (taskId) => {
      toast.success('Comment deleted');
      void queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(taskId) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
