import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PermissionScope, RoleRecord } from './permission-matrix.types';
import { countPendingForRole } from './permission-matrix.utils';

type RoleSidebarProps = {
  roles: RoleRecord[];
  selectedRoleCode: string;
  pendingChanges: Record<string, PermissionScope>;
  onSelectRole: (roleCode: string) => void;
  className?: string;
};

export function RoleSidebar({
  roles,
  selectedRoleCode,
  pendingChanges,
  onSelectRole,
  className,
}: RoleSidebarProps) {
  return (
    <nav
      aria-label="Roles"
      className={cn(
        'flex shrink-0 flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pb-0',
        className,
      )}
    >
      {roles.map((role) => {
        const isActive = role.code === selectedRoleCode;
        const pending = countPendingForRole(pendingChanges, role.code);

        return (
          <button
            key={role.code}
            type="button"
            onClick={() => onSelectRole(role.code)}
            className={cn(
              'relative min-w-[140px] rounded-xl border px-4 py-3 text-left transition-colors lg:min-w-0 lg:w-full',
              isActive
                ? 'border-cyan-500/40 bg-cyan-500/10 text-foreground shadow-[0_0_0_1px_rgba(34,211,238,0.15)]'
                : 'border-border/60 bg-slate-950/40 text-muted-foreground hover:border-border hover:bg-slate-900/60 hover:text-foreground',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="permissions-role-indicator"
                className="absolute inset-y-2 left-0 w-1 rounded-full bg-cyan-400"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            ) : null}
            <span className="block text-sm font-medium">{role.name}</span>
            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wide opacity-70">
              {role.code.replace(/_/g, ' ')}
            </span>
            {pending > 0 ? (
              <span className="mt-2 inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                {pending} unsaved
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
