export type PermissionScope = 'none' | 'self' | 'team' | 'department' | 'all';

export type PermissionMatrix = Record<string, Record<string, Record<string, PermissionScope>>>;

export type RoleRecord = {
  id: string;
  code: string;
  name: string;
  isSystem?: boolean;
  hierarchyLevel?: number;
};

export type PermissionRecord = {
  id: string;
  code: string;
  resource: string;
  action: string;
};

export type PermissionAction = {
  id: string;
  resource: string;
  baseAction: string;
  label: string;
  isScoped: boolean;
};

export type PermissionModule = {
  moduleName: string;
  resource: string;
  label: string;
  actions: PermissionAction[];
};

export type MatrixChangePayload = {
  roleCode: string;
  resource: string;
  action: string;
  scope: PermissionScope;
};

export const SCOPE_OPTIONS: Array<{ value: PermissionScope; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'self', label: 'Self' },
  { value: 'team', label: 'Team' },
  { value: 'department', label: 'Department' },
  { value: 'all', label: 'All' },
];

export const ROLE_DISPLAY_ORDER = [
  'ADMIN',
  'PORTAL_ADMIN',
  'HR',
  'HR_MANAGER',
  'HR_EXECUTIVE',
  'TEAM_LEAD',
  'EMPLOYEE',
  'INTERN',
] as const;
