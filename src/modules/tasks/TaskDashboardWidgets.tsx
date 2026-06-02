import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, ListTodo } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { StatCard } from '@/components/shared/StatCard';
import { ErrorState } from '@/components/shared/ErrorState';
import { RingChart } from '@/components/charts/RingChart';
import { Skeleton } from '@/components/ui/skeleton';
import { permissions } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import {
  useTaskList,
  useTaskSelfAnalytics,
  useTaskTeamAnalytics,
  type TaskListItem,
} from './useTasks';
import { TaskStatusBadge, formatTaskDueDate, isTaskOverdue } from './task-utils';

type LinkedStatCardProps = {
  to: string;
  label: string;
  value: number;
  icon: typeof ListTodo;
  tone?: 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber';
  trend?: string;
  formattedValue?: string;
};

function LinkedStatCard({ to, label, value, icon, tone = 'cyan', trend, formattedValue }: LinkedStatCardProps) {
  return (
    <Link to={to} className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50">
      <StatCard
        label={label}
        value={value}
        icon={icon}
        tone={tone}
        {...(trend ? { trend } : {})}
        {...(formattedValue ? { formattedValue } : {})}
      />
    </Link>
  );
}

function RecentTasksTable({ tasks }: { tasks: TaskListItem[] }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent tasks to show.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="min-w-full text-sm">
        <thead className="border-b border-border bg-white/[0.03] text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-border/60 last:border-b-0">
              <td className="px-4 py-3">
                <Link
                  to={`/tasks?tab=my&taskId=${task.id}`}
                  className="block max-w-xs truncate font-medium text-foreground hover:text-cyan-200"
                  title={task.title}
                >
                  #{task.taskNumber} {task.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className={cn('px-4 py-3', isTaskOverdue(task) ? 'text-rose-300' : 'text-muted-foreground')}>
                {formatTaskDueDate(task.dueDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MyTasksDashboardSection({ enabled }: { enabled: boolean }) {
  const analyticsQuery = useTaskSelfAnalytics(enabled);
  const recentTasksQuery = useTaskList({
    page: 1,
    limit: 3,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    enabled,
  });

  const analytics = analyticsQuery.data;
  const recentTasks = recentTasksQuery.data?.items ?? [];
  const loading = analyticsQuery.isLoading || recentTasksQuery.isLoading;
  const hasError = analyticsQuery.isError || recentTasksQuery.isError;

  if (loading) {
    return (
      <SectionCard title="My Tasks" description="Personal task workload at a glance.">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-4 h-36 rounded-xl" />
      </SectionCard>
    );
  }

  if (hasError) {
    return (
      <SectionCard title="My Tasks" description="Personal task workload at a glance.">
        <ErrorState
          message={getErrorMessage(analyticsQuery.error ?? recentTasksQuery.error)}
          onRetry={() => {
            void analyticsQuery.refetch();
            void recentTasksQuery.refetch();
          }}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="My Tasks" description="Personal task workload with quick links into your task workspace.">
      <div className="grid gap-4 md:grid-cols-3">
        <LinkedStatCard
          to="/tasks?tab=my"
          label="My Open Tasks"
          value={analytics?.open ?? 0}
          icon={ListTodo}
          tone="cyan"
          trend="Active tasks in your scope"
        />
        <LinkedStatCard
          to="/tasks?tab=my&view=dueToday"
          label="Due Today"
          value={analytics?.dueToday ?? 0}
          icon={CalendarClock}
          tone="amber"
          trend="Tasks due before end of day"
        />
        <LinkedStatCard
          to="/tasks?tab=my&view=overdue"
          label="Overdue"
          value={analytics?.overdue ?? 0}
          icon={AlertTriangle}
          tone={(analytics?.overdue ?? 0) > 0 ? 'rose' : 'amber'}
          trend={(analytics?.overdue ?? 0) > 0 ? 'Needs immediate attention' : 'No overdue tasks'}
        />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Recent tasks</p>
          <Link to="/tasks?tab=my" className="text-sm text-cyan-200 hover:text-cyan-100">
            View all
          </Link>
        </div>
        <RecentTasksTable tasks={recentTasks} />
      </div>
    </SectionCard>
  );
}

function TeamTasksDashboardSection({ enabled }: { enabled: boolean }) {
  const analyticsQuery = useTaskTeamAnalytics(enabled);
  const analytics = analyticsQuery.data;
  const completionRate = analytics?.completionRate ?? 0;

  if (analyticsQuery.isLoading) {
    return (
      <SectionCard title="Team Tasks" description="Team workload and completion health.">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-4 h-52 rounded-xl" />
      </SectionCard>
    );
  }

  if (analyticsQuery.isError) {
    return (
      <SectionCard title="Team Tasks" description="Team workload and completion health.">
        <ErrorState
          message={getErrorMessage(analyticsQuery.error)}
          onRetry={() => void analyticsQuery.refetch()}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Team Tasks" description="Team workload, due-date pressure, and completion rate for your visibility scope.">
      <div className="grid gap-4 md:grid-cols-3">
        <LinkedStatCard
          to="/tasks?tab=team"
          label="Team Tasks"
          value={analytics?.open ?? 0}
          icon={ClipboardList}
          tone="cyan"
          trend="Open tasks across your team scope"
        />
        <LinkedStatCard
          to="/tasks?tab=team"
          label="Team Due Today"
          value={analytics?.dueToday ?? 0}
          icon={CalendarClock}
          tone="amber"
          trend="Team tasks due today"
        />
        <LinkedStatCard
          to="/tasks?tab=team"
          label="Team Overdue"
          value={analytics?.overdue ?? 0}
          icon={AlertTriangle}
          tone={(analytics?.overdue ?? 0) > 0 ? 'rose' : 'amber'}
          trend={(analytics?.overdue ?? 0) > 0 ? 'Escalations may be required' : 'Team is on track'}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <LinkedStatCard
          to="/tasks?tab=team"
          label="Completion Rate"
          value={completionRate}
          formattedValue={`${completionRate}%`}
          icon={CheckCircle2}
          tone="emerald"
          trend="Completed vs total closed workload"
        />
        <div className="rounded-xl border border-border bg-white/[0.02] p-4">
          <p className="mb-4 text-sm font-medium text-foreground">Team completion mix</p>
          <RingChart
            totalLabel={`${completionRate}% complete`}
            segments={[
              { label: 'Completed', value: analytics?.completed ?? 0, color: 'rgb(52 211 153)' },
              { label: 'Open', value: analytics?.open ?? 0, color: 'rgb(34 211 238)' },
            ]}
          />
        </div>
      </div>
    </SectionCard>
  );
}

export function TaskDashboardWidgets() {
  const { can, canDoWithScope } = usePermissions();
  const permissionsSynced = useAuthStore((state) => state.permissionsSynced);

  const showSelfWidget = can(permissions.tasksReadSelf) || canDoWithScope('tasks', 'read', 'self');
  const showTeamWidget = canDoWithScope('tasks', 'read', 'team');
  const canSelfAnalytics = can(permissions.tasksAnalyticsSelf);
  const canTeamAnalytics = can(permissions.tasksAnalyticsTeam);

  if (!permissionsSynced || (!showSelfWidget && !showTeamWidget)) {
    return null;
  }

  return (
    <div className="grid gap-5">
      {showSelfWidget ? <MyTasksDashboardSection enabled={permissionsSynced && canSelfAnalytics} /> : null}
      {showTeamWidget && canTeamAnalytics ? (
        <TeamTasksDashboardSection enabled={permissionsSynced && canTeamAnalytics} />
      ) : showTeamWidget ? (
        <SectionCard title="Team Tasks" description="Open the team task workspace for scoped task visibility.">
          <Link to="/tasks?tab=team" className="text-sm text-cyan-200 hover:text-cyan-100">
            Go to team tasks
          </Link>
        </SectionCard>
      ) : null}
    </div>
  );
}
