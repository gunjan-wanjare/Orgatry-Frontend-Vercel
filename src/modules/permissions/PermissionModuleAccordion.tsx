import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PermissionModule, PermissionScope } from './permission-matrix.types';
import { ScopeDropdown } from './ScopeDropdown';

type PermissionModuleAccordionProps = {
  modules: PermissionModule[];
  expandedModules: Set<string>;
  onToggleModule: (resource: string) => void;
  getScope: (resource: string, baseAction: string) => PermissionScope;
  isActionPending: (resource: string, baseAction: string) => boolean;
  onScopeChange: (resource: string, baseAction: string, scope: PermissionScope) => void;
  disabled?: boolean;
};

export function PermissionModuleAccordion({
  modules,
  expandedModules,
  onToggleModule,
  getScope,
  isActionPending,
  onScopeChange,
  disabled = false,
}: PermissionModuleAccordionProps) {
  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
        No permissions match your search.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((module) => {
        const expanded = expandedModules.has(module.resource);

        return (
          <section
            key={module.resource}
            className="overflow-hidden rounded-xl border border-border/70 bg-slate-950/30"
          >
            <button
              type="button"
              onClick={() => onToggleModule(module.resource)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-900/50"
            >
              <div>
                <p className="font-medium text-foreground">{module.label}</p>
                <p className="text-xs text-muted-foreground">
                  {module.actions.length} permission{module.actions.length === 1 ? '' : 's'}
                </p>
              </div>
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground"
              >
                <ChevronDown className="size-4" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  key={`${module.resource}-body`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <ul className="divide-y divide-border/50 border-t border-border/50">
                    {module.actions.map((action) => {
                      const pending = isActionPending(module.resource, action.baseAction);
                      const scope = getScope(module.resource, action.baseAction);

                      return (
                        <li
                          key={action.id}
                          className={cn(
                            'flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
                            pending && 'bg-amber-500/[0.04] border-l-2 border-l-amber-400',
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{action.label}</p>
                            <p className="mt-0.5 truncate font-mono text-[11px] text-cyan-300/80">
                              {module.resource}:{action.baseAction}
                            </p>
                          </div>
                          <ScopeDropdown
                            value={scope}
                            disabled={disabled}
                            isPending={pending}
                            onChange={(next) =>
                              onScopeChange(module.resource, action.baseAction, next)
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}
