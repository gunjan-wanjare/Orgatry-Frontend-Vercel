import { useSearchParams } from 'react-router-dom';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';

export function useTaskIdParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');

  const setTaskId = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (id) {
      next.set('taskId', id);
    } else {
      next.delete('taskId');
    }
    setSearchParams(next, { replace: true });
  };

  return {
    taskId,
    setTaskId,
    detailOpen: Boolean(taskId),
  };
}

type TaskModalsProps = {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
};

export function TaskModals({ createOpen, onCreateOpenChange }: TaskModalsProps) {
  const { taskId, setTaskId, detailOpen } = useTaskIdParam();

  return (
    <>
      <CreateTaskModal
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        onCreated={(id) => setTaskId(id)}
      />
      <TaskDetailModal
        taskId={taskId}
        open={detailOpen}
        onOpenChange={(open) => {
          if (!open) {
            setTaskId(null);
          }
        }}
      />
    </>
  );
}
