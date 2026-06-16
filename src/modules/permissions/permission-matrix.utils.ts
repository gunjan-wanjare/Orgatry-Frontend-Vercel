import type {
  PermissionAction,
  PermissionMatrix,
  PermissionModule,
  PermissionRecord,
  PermissionScope,
  MatrixChangePayload,
  RoleRecord,
} from './permission-matrix.types';
import { ROLE_DISPLAY_ORDER } from './permission-matrix.types';

const KNOWN_SCOPES = new Set<PermissionScope>(['self', 'team', 'department', 'all']);

export const SCOPE_RANK: Record<PermissionScope, number> = {
  none: 0,
  self: 1,
  team: 2,
  department: 3,
  all: 4,
};

export const changeKey = (roleCode: string, resource: string, action: string) =>
  `${roleCode}::${resource}::${action}`;

export const titleCase = (value: string) =>
  value
    .replace(/[_\.:-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const MODULE_LABELS: Record<string, string> = {
  mailers_docs: 'Mailers & Docs',
  employee_directory: 'Employee Directory',
  employee_user_management: 'Employee User Management',
  employee_visibility: 'Employee Visibility',
  preonboarding: 'Pre-Onboarding',
};

export function moduleLabel(resource: string): string {
  return MODULE_LABELS[resource] ?? titleCase(resource);
}

export function parseActionToBase(action: string): { baseAction: string; isScoped: boolean } {
  const parts = action.split('.').filter(Boolean);
  if (parts.length <= 1) {
    return { baseAction: action, isScoped: false };
  }

  const last = parts[parts.length - 1] as PermissionScope;
  if (KNOWN_SCOPES.has(last)) {
    return { baseAction: parts.slice(0, -1).join('.'), isScoped: true };
  }

  return { baseAction: action, isScoped: false };
}

/** Parse flat permission codes (e.g. attendance:approve.team) into base action + scope. */
export function parseFlatPermissionCode(code: string): {
  resource: string;
  baseAction: string;
  scope: PermissionScope;
} | null {
  if (code.includes(':')) {
    const parts = code.split(':');
    if (parts.length !== 3) return null;
    const [resource, action, scope] = parts;
    if (!resource || !action || !scope) return null;
    if (!isPermissionScope(scope)) return null;
    return { resource, baseAction: action, scope };
  }

  if (code.includes('.')) {
    const parts = code.split('.').filter(Boolean);
    if (parts.length === 3) {
      const [resource, action, scopePart] = parts;
      if (resource && action && scopePart && isPermissionScope(scopePart)) {
        return { resource, baseAction: action, scope: scopePart };
      }
    }

    const resource = parts[0];
    if (!resource) return null;
    const actionSegment = parts.slice(1).join('.') || (parts[parts.length - 1] ?? '');
    const { baseAction } = parseActionToBase(actionSegment);
    return { resource, baseAction, scope: 'all' };
  }

  return null;
}

export function isPermissionScope(value: string): value is PermissionScope {
  return value === 'none' || value === 'self' || value === 'team' || value === 'department' || value === 'all';
}

export function highestScope(scopes: PermissionScope[]): PermissionScope {
  return scopes.reduce<PermissionScope>(
    (best, scope) => ((SCOPE_RANK[scope] ?? 0) > (SCOPE_RANK[best] ?? 0) ? scope : best),
    'none',
  );
}

/** Map flat permission strings to UI dropdown state; conflicts resolve to highest scope. */
export function flatPermissionsToScopeMap(codes: string[]): Map<string, PermissionScope> {
  const map = new Map<string, PermissionScope>();

  for (const code of codes) {
    const parsed = parseFlatPermissionCode(code);
    if (!parsed) continue;

    const key = `${parsed.resource}::${parsed.baseAction}`;
    const existing = map.get(key) ?? 'none';
    map.set(key, highestScope([existing, parsed.scope]));
  }

  return map;
}

export function buildPermissionModules(permissions: PermissionRecord[]): PermissionModule[] {
  const byResource = new Map<string, Map<string, PermissionAction>>();

  for (const permission of permissions) {
    if (!permission.resource || !permission.action) continue;

    const { baseAction, isScoped } = parseActionToBase(permission.action);
    const resourceMap = byResource.get(permission.resource) ?? new Map<string, PermissionAction>();

    if (!resourceMap.has(baseAction)) {
      resourceMap.set(baseAction, {
        id: `${permission.resource}:${baseAction}`,
        resource: permission.resource,
        baseAction,
        label: titleCase(baseAction),
        isScoped,
      });
    }

    byResource.set(permission.resource, resourceMap);
  }

  return [...byResource.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([resource, actions]) => ({
      moduleName: resource,
      resource,
      label: moduleLabel(resource),
      actions: [...actions.values()].sort((a, b) => a.baseAction.localeCompare(b.baseAction)),
    }));
}

export function resolveMatrixScope(
  matrix: PermissionMatrix,
  roleCode: string,
  resource: string,
  baseAction: string,
): PermissionScope {
  const cells = matrix[roleCode]?.[resource];
  if (!cells) return 'none';

  const scopes: PermissionScope[] = [];

  for (const [actionKey, scope] of Object.entries(cells)) {
    const { baseAction: parsedBase } = parseActionToBase(actionKey);
    const matches = actionKey === baseAction || parsedBase === baseAction;
    if (matches && isPermissionScope(scope)) {
      scopes.push(scope);
    }
  }

  return highestScope(scopes);
}

export function scopeSelectionsToPayload(
  roleCode: string,
  selections: Array<{ resource: string; baseAction: string; scope: PermissionScope }>,
): MatrixChangePayload[] {
  return selections.map(({ resource, baseAction, scope }) => ({
    roleCode,
    resource,
    action: baseAction,
    scope,
  }));
}

export function sortRolesForSidebar(roles: RoleRecord[]): RoleRecord[] {
  const orderIndex = new Map(ROLE_DISPLAY_ORDER.map((code, index) => [code, index]));

  return roles
    .filter((role) => role.code !== 'SUPER_ADMIN')
    .sort((a, b) => {
      const aOrder = orderIndex.get(a.code as (typeof ROLE_DISPLAY_ORDER)[number]);
      const bOrder = orderIndex.get(b.code as (typeof ROLE_DISPLAY_ORDER)[number]);

      if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;

      const aLevel = a.hierarchyLevel ?? Number.MAX_SAFE_INTEGER;
      const bLevel = b.hierarchyLevel ?? Number.MAX_SAFE_INTEGER;
      if (aLevel !== bLevel) return aLevel - bLevel;
      return a.name.localeCompare(b.name);
    });
}

export function countPendingForRole(
  pendingChanges: Record<string, PermissionScope>,
  roleCode: string,
): number {
  const prefix = `${roleCode}::`;
  return Object.keys(pendingChanges).filter((key) => key.startsWith(prefix)).length;
}

export function hasAnyPendingChanges(pendingChanges: Record<string, PermissionScope>): boolean {
  return Object.keys(pendingChanges).length > 0;
}
