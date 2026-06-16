import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { Search, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/animations/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionModuleAccordion } from './PermissionModuleAccordion';
import { RoleSidebar } from './RoleSidebar';
import { usePermissionMatrixEditor } from './usePermissionMatrixEditor';

export function PermissionsPage() {
  const editor = usePermissionMatrixEditor();
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const blocker = useBlocker(editor.hasUnsavedChanges);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowLeaveConfirm(true);
    }
  }, [blocker.state]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!editor.hasUnsavedChanges) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [editor.hasUnsavedChanges]);

  const selectedRole = editor.sortedRoles.find((role) => role.code === editor.selectedRoleCode);

  const handleRoleSelect = (roleCode: string) => {
    if (roleCode === editor.selectedRoleCode) return;
    if (editor.hasUnsavedChanges) {
      setPendingRoleSwitch(roleCode);
      return;
    }
    editor.selectRole(roleCode);
  };

  const confirmDiscardAndSwitch = () => {
    editor.discardChanges();
    if (pendingRoleSwitch) {
      editor.selectRole(pendingRoleSwitch);
      setPendingRoleSwitch(null);
      return;
    }
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
    setShowLeaveConfirm(false);
  };

  const cancelDiscard = () => {
    setPendingRoleSwitch(null);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    setShowLeaveConfirm(false);
  };

  if (editor.isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <PageHeader
            eyebrow="RBAC"
            title="Permission management"
            description="Loading role permissions..."
          />
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (editor.isError) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <PageHeader
            eyebrow="RBAC"
            title="Permission management"
            description="Failed to load permissions."
          />
          <SectionCard title="Error" description="Could not fetch role permissions.">
            <Button variant="outline" onClick={editor.retry}>
              Retry
            </Button>
          </SectionCard>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="RBAC"
          title="Permission management"
          description="Select a role, adjust module permissions by scope, and save changes. System Admin access is fixed and not shown here."
        />

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <p>System Admin has full access to all features. This cannot be modified.</p>
          </div>
        </div>

        <SectionCard
          title="Role permissions"
          description="One role at a time — scope dropdowns map to resource:action:scope on save."
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={editor.expandAll}>
                Expand all
              </Button>
              <Button variant="outline" size="sm" onClick={editor.collapseAll}>
                Collapse all
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {editor.hasUnsavedChanges ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={editor.saveMutation.isPending}
                  onClick={editor.discardChanges}
                >
                  Discard
                </Button>
              ) : null}
              <Button
                size="sm"
                disabled={!editor.hasUnsavedChanges || editor.saveMutation.isPending}
                onClick={() => editor.saveMutation.mutate()}
              >
                {editor.saveMutation.isPending
                  ? 'Saving...'
                  : `Save Changes${editor.pendingCount > 0 ? ` (${editor.pendingCount})` : ''}`}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <p className="mb-3 hidden text-xs font-medium uppercase tracking-wide text-muted-foreground lg:block">
                Roles
              </p>
              <RoleSidebar
                roles={editor.sortedRoles}
                selectedRoleCode={editor.selectedRoleCode}
                pendingChanges={editor.pendingChanges}
                onSelectRole={handleRoleSelect}
              />
            </aside>

            <motion.div
              key={editor.selectedRoleCode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="min-w-0 space-y-4"
            >
              <div className="rounded-xl border border-border/60 bg-slate-900/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Editing permissions for</p>
                <p className="text-lg font-semibold text-foreground">
                  {selectedRole?.name ?? editor.selectedRoleCode}
                </p>
                {editor.selectedRolePendingCount > 0 ? (
                  <p className="mt-1 text-xs text-amber-300">
                    {editor.selectedRolePendingCount} unsaved change
                    {editor.selectedRolePendingCount === 1 ? '' : 's'} for this role
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search modules or actions..."
                    value={editor.search}
                    onChange={(event) => editor.setSearch(event.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={editor.moduleFilter || '__all__'}
                  onValueChange={(value) => editor.setModuleFilter(value === '__all__' ? '' : value)}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All modules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All modules</SelectItem>
                    {editor.permissionModules.map((module) => (
                      <SelectItem key={module.resource} value={module.resource}>
                        {module.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <PermissionModuleAccordion
                modules={editor.filteredModules}
                expandedModules={editor.expandedModules}
                onToggleModule={editor.toggleModule}
                getScope={editor.getScope}
                isActionPending={editor.isActionPending}
                onScopeChange={editor.updateScope}
                disabled={editor.saveMutation.isPending}
              />
            </motion.div>
          </div>
        </SectionCard>
      </div>

      <ConfirmModal
        open={pendingRoleSwitch !== null || showLeaveConfirm}
        variant="warning"
        title="Unsaved permission changes"
        description="You have unsaved changes. Discard them and continue, or cancel to keep editing."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onConfirm={confirmDiscardAndSwitch}
        onCancel={cancelDiscard}
      />
    </PageTransition>
  );
}
