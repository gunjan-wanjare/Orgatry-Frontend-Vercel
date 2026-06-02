import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTransition } from '@/components/animations/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { permissions } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/store/auth.store';
import { MyTasksPanel } from './MyTasksPage';
import { TeamTasksPanel } from './TeamTasksPage';
import { KanbanBoardPanel } from './KanbanBoardPage';

export type TasksTab = 'my' | 'team' | 'board';

const TASK_TABS: TasksTab[] = ['my', 'team', 'board'];

function parseTasksTab(value: string | null): TasksTab {
  if (value && TASK_TABS.includes(value as TasksTab)) {
    return value as TasksTab;
  }

  return 'my';
}

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const permissionsSynced = useAuthStore((state) => state.permissionsSynced);
  const { canAny } = usePermissions();

  const permissionsLoading = !hasHydrated || !permissionsSynced;

  const canAccessTasks = canAny([
    permissions.tasksReadSelf,
    permissions.tasksReadTeam,
    permissions.tasksReadDepartment,
    permissions.tasksReadAll,
  ]);

  const canAccessTeamTasks = canAny([
    permissions.tasksReadTeam,
    permissions.tasksReadDepartment,
    permissions.tasksReadAll,
  ]);

  const activeTab = parseTasksTab(searchParams.get('tab'));

  const visibleTabs = useMemo(() => {
    const tabs: TasksTab[] = ['my', 'board'];
    if (canAccessTeamTasks) {
      tabs.splice(1, 0, 'team');
    }
    return tabs;
  }, [canAccessTeamTasks]);

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    if (activeTab === 'team' && !canAccessTeamTasks) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', 'my');
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, canAccessTeamTasks, permissionsLoading, searchParams, setSearchParams]);

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', value);
    if (value !== 'my') {
      next.delete('view');
    }
    setSearchParams(next, { replace: true });
  };

  if (permissionsLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Tabs value="my">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my" disabled>
                My Tasks
              </TabsTrigger>
              <TabsTrigger value="team" disabled>
                Team Tasks
              </TabsTrigger>
              <TabsTrigger value="board" disabled>
                Task Board
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="h-56 animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      </PageTransition>
    );
  }

  if (!canAccessTasks) {
    return (
      <PageTransition>
        <div className="flex min-h-64 items-center justify-center">
          <p className="text-muted-foreground">You don&apos;t have access to tasks.</p>
        </div>
      </PageTransition>
    );
  }

  const tabGridClass =
    visibleTabs.length === 3 ? 'grid-cols-3' : visibleTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <PageTransition>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className={`grid w-full ${tabGridClass}`}>
            <TabsTrigger value="my">My Tasks</TabsTrigger>
            {canAccessTeamTasks ? <TabsTrigger value="team">Team Tasks</TabsTrigger> : null}
            <TabsTrigger value="board">Task Board</TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="mt-6 space-y-6">
            <MyTasksPanel />
          </TabsContent>

          {canAccessTeamTasks ? (
            <TabsContent value="team" className="mt-6 space-y-6">
              <TeamTasksPanel />
            </TabsContent>
          ) : null}

          <TabsContent value="board" className="mt-6 space-y-6">
            <KanbanBoardPanel />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
