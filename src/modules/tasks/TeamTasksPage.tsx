import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Download,
  ListTodo,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { SectionCard } from '@/components/shared/SectionCard';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/errors';
import {
  fetchTasksForExport,
  type TaskListItem,
  type TaskPriority,
  type TaskStatus,
  useAssigneeOptions,
  useTaskList,
  useTaskTeamAnalytics,
} from './useTasks';
import { TaskAnalyticsSkeleton, TaskTable, TaskTableLoadingOverlay } from './TaskTable';
import { employeeDisplayName, exportTasksCsv, scopeLabel } from './task-utils';
import { TaskDetailModal } from './TaskDetailModal';
import { useTaskIdParam } from './TaskModals';

const STATUS_OPTIONS: Array<{ value: 'ALL' | TaskStatus; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITY_OPTIONS: Array<{ value: 'ALL' | TaskPriority; label: string }> = [
  { value: 'ALL', label: 'All priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export function TeamTasksPanel() {
  const { taskId, setTaskId, detailOpen } = useTaskIdParam();
  const { can, getScope } = usePermissions();
  const permissionsSynced = useAuthStore((state) => state.permissionsSynced);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | TaskStatus>('ALL');
  const [priority, setPriority] = useState<'ALL' | TaskPriority>('ALL');
  const [assignedToId, setAssignedToId] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const readScope = getScope('tasks', 'read');
  const canExport = can(permissions.tasksReadAll);
  const canViewTeamAnalytics = can(permissions.tasksAnalyticsTeam);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority, assignedToId, fromDate, toDate]);

  const listQuery = useTaskList({
    page,
    limit: 25,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status !== 'ALL' ? { status } : {}),
    ...(priority !== 'ALL' ? { priority } : {}),
    ...(assignedToId !== 'ALL' ? { assignedToId } : {}),
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    enabled: permissionsSynced,
  });

  const analyticsQuery = useTaskTeamAnalytics(permissionsSynced && canViewTeamAnalytics);
  const assigneeOptionsQuery = useAssigneeOptions(undefined, permissionsSynced);

  const analytics = analyticsQuery.data;
  const assigneeOptions = assigneeOptionsQuery.data ?? [];

  const filteredTasks = useMemo(() => {
    const items = listQuery.data?.items ?? [];

    if (!fromDate && !toDate) {
      return items;
    }

    return items.filter((task) => {
      if (!task.dueDate) {
        return false;
      }

      const due = parseISO(task.dueDate);
      if (fromDate && due < parseISO(fromDate)) {
        return false;
      }

      if (toDate && due > parseISO(`${toDate}T23:59:59`)) {
        return false;
      }

      return true;
    });
  }, [fromDate, listQuery.data?.items, toDate]);

  const totalPages = listQuery.data?.meta.totalPages ?? 1;

  const analyticsCards = useMemo(
    () => [
      { label: 'Open Tasks', value: analytics?.open ?? 0, icon: ListTodo, tone: 'cyan' as const },
      { label: 'Completed', value: analytics?.completed ?? 0, icon: CheckCircle2, tone: 'emerald' as const },
      { label: 'Due Today', value: analytics?.dueToday ?? 0, icon: CalendarClock, tone: 'amber' as const },
      {
        label: 'Overdue',
        value: analytics?.overdue ?? 0,
        icon: AlertTriangle,
        tone: 'rose' as const,
      },
      {
        label: 'Completion Rate',
        value: analytics?.completionRate ?? 0,
        formattedValue: `${analytics?.completionRate ?? 0}%`,
        icon: ClipboardList,
        tone: 'violet' as const,
      },
    ],
    [analytics],
  );

  const handleExport = async () => {
    setExporting(true);

    try {
      const items = await fetchTasksForExport({
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(status !== 'ALL' ? { status } : {}),
        ...(priority !== 'ALL' ? { priority } : {}),
        ...(assignedToId !== 'ALL' ? { assignedToId } : {}),
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });

      const exportRows = items.filter((task) => {
        if (!fromDate && !toDate) {
          return true;
        }

        if (!task.dueDate) {
          return false;
        }

        const due = parseISO(task.dueDate);
        if (fromDate && due < parseISO(fromDate)) {
          return false;
        }

        if (toDate && due > parseISO(`${toDate}T23:59:59`)) {
          return false;
        }

        return true;
      });

      if (exportRows.length === 0) {
        toast.error('No tasks available to export');
        return;
      }

      exportTasksCsv(exportRows, `team-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      toast.success(`Exported ${exportRows.length} tasks`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  const handleRowClick = (task: TaskListItem) => {
    setTaskId(task.id);
  };

  return (
    <div className="space-y-6">
        <PageHeader
          eyebrow="Task Management"
          title="Team Tasks"
          description="Review tasks across your permitted visibility scope with filters for assignee, status, priority, and due dates."
          actions={
            canExport ? (
              <Button onClick={() => void handleExport()} disabled={exporting}>
                <Download className="mr-2 size-4" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            ) : null
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-200">
            {scopeLabel(analytics?.scope ?? readScope)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Showing tasks allowed by your `tasks.read.*` permission scope.
          </span>
        </div>

        {canViewTeamAnalytics ? (
          analyticsQuery.isLoading ? (
            <TaskAnalyticsSkeleton />
          ) : analyticsQuery.isError ? (
            <ErrorState
              message={getErrorMessage(analyticsQuery.error)}
              onRetry={() => void analyticsQuery.refetch()}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {analyticsCards.map((card) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  {...(card.formattedValue ? { formattedValue: card.formattedValue } : {})}
                  icon={card.icon}
                  tone={card.tone}
                />
              ))}
            </div>
          )
        ) : null}

        <SectionCard
          title="Filters"
          description="Narrow the team task list before reviewing assignments and due dates."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                className="pl-9"
              />
            </div>

            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger>
                <SelectValue placeholder="Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All employees</SelectItem>
                {assigneeOptions.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employeeDisplayName(employee)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(value) => setStatus(value as 'ALL' | TaskStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={(value) => setPriority(value as 'ALL' | TaskPriority)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
        </SectionCard>

        <SectionCard
          title="Team Task List"
          description="Click a row to open task details."
          actions={<TaskTableLoadingOverlay visible={listQuery.isFetching && !listQuery.isLoading} />}
        >
          {listQuery.isError ? (
            <ErrorState
              message={getErrorMessage(listQuery.error)}
              onRetry={() => void listQuery.refetch()}
            />
          ) : (
            <TaskTable
              tasks={filteredTasks}
              isLoading={listQuery.isLoading}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onRowClick={handleRowClick}
              showCreator
            />
          )}
        </SectionCard>

        <TaskDetailModal
          taskId={taskId}
          open={detailOpen}
          onOpenChange={(open) => {
            if (!open) {
              setTaskId(null);
            }
          }}
        />
      </div>
  );
}
