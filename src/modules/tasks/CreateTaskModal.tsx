import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { permissions } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { useDebounce } from '@/hooks/use-debounce';
import { endpoints } from '@/services/api/endpoints';
import { httpClient } from '@/services/api/http-client';
import type { ApiResponse } from '@/types/api';
import {
  useAssigneeOptions,
  useCreateTaskMutation,
  useParentTaskOptions,
  type TaskPriority,
} from './useTasks';
import { employeeDisplayName } from './task-utils';
import { v4 as uuidv4 } from 'uuid';

const createTaskSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().trim().max(5000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    assignedToId: z.string().optional(),
    dueDate: z.string().optional(),
    startDate: z.string().optional(),
    departmentId: z.string().optional(),
    parentTaskId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (value.dueDate) {
      const due = new Date(value.dueDate);
      if (due < today) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Due date cannot be in the past', path: ['dueDate'] });
      }
    }

    if (value.startDate && value.dueDate && new Date(value.startDate) > new Date(value.dueDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date must be before due date',
        path: ['startDate'],
      });
    }
  });

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

type CreateTaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (taskId: string) => void;
};

type DepartmentOption = { id: string; name: string };

type DepartmentNode = {
  id: string;
  name: string;
  subDepartments?: DepartmentNode[];
};

const PRIORITY_OPTIONS: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function CreateTaskModal({ open, onOpenChange, onCreated }: CreateTaskModalProps) {
  const { canAny, canDoWithScope } = usePermissions();
  const createMutation = useCreateTaskMutation();
  const [subTasks, setSubTasks] = useState<Array<{ id: string; title: string }>>([]);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  const debouncedAssigneeSearch = useDebounce(assigneeSearch, 300);
  const debouncedParentSearch = useDebounce(parentSearch, 300);

  const canPickDepartment = canDoWithScope('tasks', 'create', 'department');

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      assignedToId: undefined,
      dueDate: '',
      startDate: '',
      departmentId: undefined,
      parentTaskId: undefined,
    },
  });

  const titleValue = form.watch('title') ?? '';

  const assigneeQuery = useAssigneeOptions(debouncedAssigneeSearch || undefined, open);
  const parentQuery = useParentTaskOptions(debouncedParentSearch || undefined, open);

  const departmentsQuery = useQuery({
    queryKey: ['departments', 'task-create'],
    enabled: open && canPickDepartment,
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<{ departments: DepartmentNode[] }>>(endpoints.departments.list);
      const flatten = (nodes: DepartmentNode[]): DepartmentOption[] =>
        nodes.flatMap((node) => [
          { id: node.id, name: node.name },
          ...flatten(node.subDepartments ?? []),
        ]);
      return flatten(res.data.data?.departments ?? []);
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setSubTasks([]);
      setAssigneeSearch('');
      setParentSearch('');
    }
  }, [form, open]);

  const todayInputMin = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleAddSubTask = () => {
    setSubTasks((current) => [...current, { id: uuidv4(), title: '' }]);
  };

  const handleRemoveSubTask = (id: string) => {
    setSubTasks((current) => current.filter((item) => item.id !== id));
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const validSubTasks = subTasks.map((item) => item.title.trim()).filter((title) => title.length >= 3);

    const idempotencyKey = uuidv4();

    const result = await createMutation.mutateAsync({
      title: values.title.trim(),
      description: values.description?.trim() || null,
      priority: values.priority,
      assignedToId: values.assignedToId || null,
      departmentId: values.departmentId || null,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
      parentTaskId: values.parentTaskId || null,
      subTasks: validSubTasks.map((title) => ({ title })),
      idempotencyKey,
    });

    onOpenChange(false);
    if (result?.id) {
      onCreated?.(result.id);
    }
  });

  const canSubmit = canAny([
    permissions.tasksCreateSelf,
    permissions.tasksCreateTeam,
    permissions.tasksCreateDepartment,
    permissions.tasksCreateAll,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Add a new task with assignee, schedule, optional subtasks, and parent linkage.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="title">Title *</Label>
              <span className="text-xs text-muted-foreground">{titleValue.length}/200</span>
            </div>
            <Input id="title" placeholder="Enter task title" {...form.register('title')} />
            {form.formState.errors.title ? (
              <p className="text-xs text-rose-300">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} placeholder="Describe the task" {...form.register('description')} />
            {form.formState.errors.description ? (
              <p className="text-xs text-rose-300">{form.formState.errors.description.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Priority *</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(value) => form.setValue('priority', value as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
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

            <div className="grid gap-2">
              <Label htmlFor="assigneeSearch">Assignee</Label>
              <Input
                id="assigneeSearch"
                placeholder="Search employees"
                value={assigneeSearch}
                onChange={(event) => setAssigneeSearch(event.target.value)}
              />
              <Select
                value={form.watch('assignedToId') ?? 'none'}
                onValueChange={(value) => form.setValue('assignedToId', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
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

            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...form.register('startDate')} />
              {form.formState.errors.startDate ? (
                <p className="text-xs text-rose-300">{form.formState.errors.startDate.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" min={todayInputMin} {...form.register('dueDate')} />
              {form.formState.errors.dueDate ? (
                <p className="text-xs text-rose-300">{form.formState.errors.dueDate.message}</p>
              ) : null}
            </div>
          </div>

          {canPickDepartment ? (
            <div className="grid gap-2">
              <Label>Department</Label>
              <Select
                value={form.watch('departmentId') ?? 'none'}
                onValueChange={(value) => form.setValue('departmentId', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No department</SelectItem>
                  {(departmentsQuery.data ?? []).map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="parentSearch">Parent Task</Label>
            <Input
              id="parentSearch"
              placeholder="Search parent tasks"
              value={parentSearch}
              onChange={(event) => setParentSearch(event.target.value)}
            />
            <Select
              value={form.watch('parentTaskId') ?? 'none'}
              onValueChange={(value) => form.setValue('parentTaskId', value === 'none' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Optional parent task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent task</SelectItem>
                {(parentQuery.data ?? []).map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    #{task.taskNumber} {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <Label>Subtasks</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSubTask}>
                <Plus className="mr-2 size-4" />
                Add subtask
              </Button>
            </div>
            {subTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add optional subtasks that will be created with this task.</p>
            ) : (
              <div className="space-y-2">
                {subTasks.map((subTask, index) => (
                  <div key={subTask.id} className="flex items-center gap-2">
                    <Input
                      value={subTask.title}
                      placeholder={`Subtask ${index + 1}`}
                      onChange={(event) =>
                        setSubTasks((current) =>
                          current.map((item) =>
                            item.id === subTask.id ? { ...item, title: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubTask(subTask.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
