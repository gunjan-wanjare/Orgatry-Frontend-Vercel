import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ListTodo,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { SectionCard } from '@/components/shared/SectionCard';
import { StatCard } from '@/components/shared/StatCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { permissions } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/store/auth.store';
import {
  type TaskListItem,
  type TaskView,
  useTaskList,
  useTaskSelfAnalytics,
} from './useTasks';
import { TaskAnalyticsSkeleton, TaskTable, TaskTableLoadingOverlay } from './TaskTable';
import { TaskModals, useTaskIdParam } from './TaskModals';
import { getErrorMessage } from '@/lib/errors';

const VIEW_TABS: Array<{ value: TaskView; label: string }> = [
  { value: 'assigned', label: 'Assigned' },
  { value: 'created', label: 'Created' },
  { value: 'dueToday', label: 'Due Today' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

export function MyTasksPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setTaskId } = useTaskIdParam();
  const { can, canAny } = usePermissions();
  const permissionsSynced = useAuthStore((state) => state.permissionsSynced);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const activeView = (searchParams.get('view') as TaskView | null) ?? 'assigned';
  const canCreate = canAny([
    permissions.tasksCreateSelf,
    permissions.tasksCreateTeam,
    permissions.tasksCreateDepartment,
    permissions.tasksCreateAll,
  ]);
  const canViewSelfAnalytics = can(permissions.tasksAnalyticsSelf);

  useEffect(() => {
    setPage(1);
  }, [activeView]);

  const listQuery = useTaskList({
    page,
    limit: 25,
    view: activeView,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    enabled: permissionsSynced,
  });

  const analyticsQuery = useTaskSelfAnalytics(permissionsSynced && canViewSelfAnalytics);

  const tasks = listQuery.data?.items ?? [];
  const totalPages = listQuery.data?.meta.totalPages ?? 1;
  const analytics = analyticsQuery.data;

  const handleViewChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', value);
    setSearchParams(next);
  };

  const handleRowClick = (task: TaskListItem) => {
    setTaskId(task.id);
  };

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

  return (
    <div className="space-y-6">
        <PageHeader
          eyebrow="Task Management"
          title="My Tasks"
          description="Track tasks assigned to you, created by you, and items due soon across your personal task workspace."
          actions={
            canCreate ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 size-4" />
                New Task
              </Button>
            ) : null
          }
        />

        {canViewSelfAnalytics ? (
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
          title="Task Lists"
          description="Switch views to focus on assigned work, created items, due dates, and completed tasks."
          actions={<TaskTableLoadingOverlay visible={listQuery.isFetching && !listQuery.isLoading} />}
        >
          <Tabs value={activeView} onValueChange={handleViewChange}>
            <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            {VIEW_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg border border-transparent px-3 py-2 data-[state=active]:border-border data-[state=active]:bg-white/[0.05]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {listQuery.isError ? (
            <ErrorState
              message={getErrorMessage(listQuery.error)}
              onRetry={() => void listQuery.refetch()}
            />
          ) : (
            <TaskTable
              tasks={tasks}
              isLoading={listQuery.isLoading}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onRowClick={handleRowClick}
            />
          )}
        </Tabs>
        </SectionCard>

        <TaskModals createOpen={createOpen} onCreateOpenChange={setCreateOpen} />
      </div>
  );
}
