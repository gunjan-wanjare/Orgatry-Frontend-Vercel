import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { Button } from '@/components/ui/button';
import { permissions } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/store/auth.store';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import type { TaskListItem } from './useTasks';
import { TaskModals, useTaskIdParam } from './TaskModals';

export function KanbanBoardPanel() {
  const { setTaskId } = useTaskIdParam();
  const { canAny } = usePermissions();
  const permissionsSynced = useAuthStore((state) => state.permissionsSynced);
  const [createOpen, setCreateOpen] = useState(false);

  const canMove = canAny([
    permissions.tasksKanbanMove,
    permissions.tasksEditSelf,
    permissions.tasksEditTeam,
    permissions.tasksEditDepartment,
    permissions.tasksEditAll,
  ]);

  const canCreate = canAny([
    permissions.tasksCreateSelf,
    permissions.tasksCreateTeam,
    permissions.tasksCreateDepartment,
    permissions.tasksCreateAll,
  ]);

  const handleTaskOpen = (task: TaskListItem) => {
    setTaskId(task.id);
  };

  if (!permissionsSynced) {
    return null;
  }

  return (
    <div className="space-y-6">
        <PageHeader
          eyebrow="Task Management"
          title="Task Board"
          description="Move work across backlog, execution, review, and completion columns with drag-and-drop updates synced to the server."
          actions={
            canCreate ? (
              <Button onClick={() => setCreateOpen(true)}>New Task</Button>
            ) : null
          }
        />

        <SectionCard
          title="Kanban Board"
          description={
            canMove
              ? 'Drag cards between columns to change task status. Completed and cancelled cards stay locked.'
              : 'You can view the board, but status changes require kanban move or task edit permissions.'
          }
        >
          <TaskKanbanBoard readOnly={!canMove} onTaskOpen={handleTaskOpen} />
        </SectionCard>

        <TaskModals createOpen={createOpen} onCreateOpenChange={setCreateOpen} />
      </div>
  );
}
