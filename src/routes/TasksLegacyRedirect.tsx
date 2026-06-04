import { Navigate, useSearchParams } from 'react-router-dom';
import type { TasksTab } from '@/modules/tasks/TasksPage';

type TasksLegacyRedirectProps = {
  tab: TasksTab;
};

export function TasksLegacyRedirect({ tab }: TasksLegacyRedirectProps) {
  const [searchParams] = useSearchParams();
  const next = new URLSearchParams(searchParams);
  next.set('tab', tab);

  return <Navigate to={{ pathname: '/tasks', search: next.toString() }} replace />;
}
