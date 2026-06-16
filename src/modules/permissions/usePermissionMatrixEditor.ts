import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/services/api/auth.api';
import { endpoints } from '@/services/api/endpoints';
import { httpClient } from '@/services/api/http-client';
import { useAuthStore } from '@/store/auth.store';
import type { ApiResponse } from '@/types/api';
import type {
  PermissionMatrix,
  PermissionModule,
  PermissionRecord,
  PermissionScope,
  RoleRecord,
} from './permission-matrix.types';
import {
  buildPermissionModules,
  changeKey,
  countPendingForRole,
  hasAnyPendingChanges,
  resolveMatrixScope,
  sortRolesForSidebar,
} from './permission-matrix.utils';

const fetchPermissionMatrix = async (): Promise<PermissionMatrix> => {
  const response = await httpClient.get<ApiResponse<PermissionMatrix>>(endpoints.permissionMatrix);
  return response.data.data ?? {};
};

const fetchRoles = async (): Promise<RoleRecord[]> => {
  const response = await httpClient.get<ApiResponse<RoleRecord[]>>(endpoints.roles);
  return response.data.data ?? [];
};

const fetchPermissions = async (): Promise<PermissionRecord[]> => {
  const response = await httpClient.get<ApiResponse<PermissionRecord[]>>(endpoints.permissions);
  return response.data.data ?? [];
};

export function usePermissionMatrixEditor() {
  const queryClient = useQueryClient();
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('');
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [draftMatrix, setDraftMatrix] = useState<PermissionMatrix>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, PermissionScope>>({});
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const matrixQuery = useQuery({
    queryKey: ['permission-matrix'],
    queryFn: fetchPermissionMatrix,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const rolesQuery = useQuery({
    queryKey: ['rbac-roles'],
    queryFn: fetchRoles,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const permissionsQuery = useQuery({
    queryKey: ['rbac-permissions'],
    queryFn: fetchPermissions,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const matrixData = matrixQuery.data;
  const rolesData = rolesQuery.data;
  const permissionsData = permissionsQuery.data;

  useEffect(() => {
    if (matrixData) {
      setDraftMatrix(matrixData);
      setPendingChanges({});
    }
  }, [matrixData]);

  const sortedRoles = useMemo(() => sortRolesForSidebar(rolesData ?? []), [rolesData]);

  useEffect(() => {
    if (sortedRoles.length > 0 && !selectedRoleCode) {
      setSelectedRoleCode(sortedRoles[0]?.code ?? '');
    }
  }, [sortedRoles, selectedRoleCode]);

  const permissionModules = useMemo(
    () => buildPermissionModules(permissionsData ?? []),
    [permissionsData],
  );

  useEffect(() => {
    if (permissionModules.length > 0 && expandedModules.size === 0) {
      setExpandedModules(new Set(permissionModules.map((module) => module.resource)));
    }
  }, [permissionModules, expandedModules.size]);

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return permissionModules.filter((module: PermissionModule) => {
      if (moduleFilter && module.resource !== moduleFilter) return false;
      if (!query) return true;

      if (
        module.label.toLowerCase().includes(query) ||
        module.resource.toLowerCase().includes(query)
      ) {
        return true;
      }

      return module.actions.some(
        (action) =>
          action.label.toLowerCase().includes(query) ||
          action.baseAction.toLowerCase().includes(query) ||
          `${module.resource}:${action.baseAction}`.includes(query),
      );
    });
  }, [permissionModules, moduleFilter, search]);

  const pendingCount = Object.keys(pendingChanges).length;
  const selectedRolePendingCount = selectedRoleCode
    ? countPendingForRole(pendingChanges, selectedRoleCode)
    : 0;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (pendingCount === 0) {
        return queryClient.getQueryData<PermissionMatrix>(['permission-matrix']) ?? draftMatrix;
      }

      const changes = Object.entries(pendingChanges).map(([key, scope]) => {
        const [roleCode, resource, action] = key.split('::');
        return { roleCode, resource, action, scope };
      });

      const response = await httpClient.put<ApiResponse<PermissionMatrix>>(endpoints.permissionMatrix, {
        changes,
      });
      return response.data.data ?? {};
    },
    onSuccess: async (nextMatrix) => {
      queryClient.setQueryData(['permission-matrix'], nextMatrix);
      await queryClient.invalidateQueries({ queryKey: ['permission-matrix'], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ['rbac-roles'], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ['rbac-permissions'], refetchType: 'all' });

      const freshMatrix = await queryClient.fetchQuery({
        queryKey: ['permission-matrix'],
        queryFn: fetchPermissionMatrix,
      });

      setPendingChanges({});
      setDraftMatrix(freshMatrix);

      const { refreshToken, setSession } = useAuthStore.getState();
      if (refreshToken) {
        try {
          const refreshedSession = await authApi.refresh(refreshToken);
          setSession(refreshedSession);
        } catch {
          toast.warning('Permissions saved, but token refresh failed. Please re-login.');
        }
      }

      toast.success('Permission matrix updated');
    },
    onError: (error: Error) => {
      const serverMatrix = queryClient.getQueryData<PermissionMatrix>(['permission-matrix']) ?? matrixData ?? {};
      setDraftMatrix(serverMatrix);
      setPendingChanges({});
      toast.error(error.message || 'Failed to update permission matrix');
    },
  });

  const getScope = useCallback(
    (resource: string, baseAction: string): PermissionScope => {
      if (!selectedRoleCode) return 'none';
      return resolveMatrixScope(draftMatrix, selectedRoleCode, resource, baseAction);
    },
    [draftMatrix, selectedRoleCode],
  );

  const getOriginalScope = useCallback(
    (resource: string, baseAction: string): PermissionScope => {
      if (!selectedRoleCode) return 'none';
      return resolveMatrixScope(matrixData ?? {}, selectedRoleCode, resource, baseAction);
    },
    [matrixData, selectedRoleCode],
  );

  const isActionPending = useCallback(
    (resource: string, baseAction: string): boolean => {
      if (!selectedRoleCode) return false;
      return Boolean(pendingChanges[changeKey(selectedRoleCode, resource, baseAction)]);
    },
    [pendingChanges, selectedRoleCode],
  );

  const updateScope = useCallback(
    (resource: string, baseAction: string, scope: PermissionScope) => {
      if (!selectedRoleCode || saveMutation.isPending) return;

      setDraftMatrix((current) => ({
        ...current,
        [selectedRoleCode]: {
          ...(current[selectedRoleCode] ?? {}),
          [resource]: {
            ...(current[selectedRoleCode]?.[resource] ?? {}),
            [baseAction]: scope,
          },
        },
      }));

      setPendingChanges((current) => {
        const key = changeKey(selectedRoleCode, resource, baseAction);
        const original = resolveMatrixScope(matrixData ?? {}, selectedRoleCode, resource, baseAction);

        if (scope === original) {
          const next = { ...current };
          delete next[key];
          return next;
        }

        return { ...current, [key]: scope };
      });
    },
    [matrixData, saveMutation.isPending, selectedRoleCode],
  );

  const toggleModule = useCallback((resource: string) => {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(resource)) next.delete(resource);
      else next.add(resource);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedModules(new Set(filteredModules.map((module) => module.resource)));
  }, [filteredModules]);

  const collapseAll = useCallback(() => {
    setExpandedModules(new Set());
  }, []);

  const discardChanges = useCallback(() => {
    setDraftMatrix(matrixData ?? {});
    setPendingChanges({});
  }, [matrixData]);

  const selectRole = useCallback((roleCode: string) => {
    setSelectedRoleCode(roleCode);
  }, []);

  return {
    isLoading: matrixQuery.isLoading || rolesQuery.isLoading || permissionsQuery.isLoading,
    isError: matrixQuery.isError || rolesQuery.isError || permissionsQuery.isError,
    retry: () => {
      void queryClient.invalidateQueries({ queryKey: ['permission-matrix'] });
      void queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      void queryClient.invalidateQueries({ queryKey: ['rbac-permissions'] });
    },
    sortedRoles,
    selectedRoleCode,
    selectRole,
    search,
    setSearch,
    moduleFilter,
    setModuleFilter,
    permissionModules,
    filteredModules,
    expandedModules,
    toggleModule,
    expandAll,
    collapseAll,
    getScope,
    getOriginalScope,
    isActionPending,
    updateScope,
    pendingCount,
    selectedRolePendingCount,
    hasUnsavedChanges: hasAnyPendingChanges(pendingChanges),
    pendingChanges,
    saveMutation,
    discardChanges,
  };
}
