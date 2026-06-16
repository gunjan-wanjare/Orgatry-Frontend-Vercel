import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormField } from '@/components/forms/FormField';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from '@/schemas/employee.schemas';
import { endpoints } from '@/services/api/endpoints';
import { useDebounce } from '@/hooks/use-debounce';
import { httpClient } from '@/services/api/http-client';
import type { ApiResponse } from '@/types/api';

export type EmployeeFormRecord = Partial<EmployeeFormValues> & {
  id?: string;
};

type EmployeeFormDialogProps = {
  open: boolean;
  employee?: EmployeeFormRecord | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EmployeeFormValues) => void;
};

export const LOCATION_OPTIONS = [
  { label: 'Hyderabad', value: 'HYD' as const },
  { label: 'London', value: 'LON' as const },
  { label: 'Singapore', value: 'SIN' as const },
  { label: 'Dubai', value: 'DUB' as const },
  { label: 'Remote', value: 'REMOTE' as const },
  { label: 'Hybrid', value: 'HYBRID' as const },
  { label: 'WFH', value: 'WFH' as const },
];

function getDefaultValues(): EmployeeFormValues {
  return {
    employeeId: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    workLocation: undefined,
    roleId: undefined,
    hrSpocId: undefined,
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    reportingManagerId: undefined,
    softwareLicensesAssigned: [],
  };
}

type ManagerListItem = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
};

export function EmployeeFormDialog({
  open,
  employee,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: EmployeeFormDialogProps) {
  // FIX: Casted schema wrapper as any to cleanly bypass strict exactOptionalPropertyTypes rules 
  // on nested properties that accept string | undefined vs omitted keys
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema) as any,
    defaultValues: getDefaultValues(),
  });

  const [managerSearch, setManagerSearch] = useState('');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [hrSpocSearch, setHrSpocSearch] = useState('');
  const [showHrSpocDropdown, setShowHrSpocDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const debouncedSearch = useDebounce(managerSearch, 300);
  const debouncedHrSpocSearch = useDebounce(hrSpocSearch, 300);

  const { data: departments = [] } = useQuery({
    queryKey: ['config', 'hr.departments'],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<{ key: string; value: string[] }>>(
        endpoints.config.byKey('hr.departments'),
      );
      return response.data.data?.value ?? [];
    },
    enabled: open,
    staleTime: 60_000,
  });

  const { data: designations = [] } = useQuery({
    queryKey: ['config', 'hr.designations'],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<{ key: string; value: string[] }>>(
        endpoints.config.byKey('hr.designations'),
      );
      return response.data.data?.value ?? [];
    },
    enabled: open,
    staleTime: 60_000,
  });

  type RoleOption = { id: string; name: string };

  const { data: roleOptions = [] } = useQuery({
    queryKey: ['employees', 'role-options'],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<RoleOption[]>>(
        endpoints.employeeRoleOptions,
      );
      return response.data.data ?? [];
    },
    enabled: open,
    staleTime: 60_000,
  });

  const { data: managersData = [] } = useQuery({
    queryKey: ['employees', 'managers', debouncedSearch],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<{ items: ManagerListItem[] }>>(
        endpoints.employees,
        {
          params: {
            search: debouncedSearch,
            limit: 20,
          },
        },
      );
      return response.data.data?.items ?? [];
    },
    enabled: open,
    staleTime: 30_000,
  });

  const { data: hrSpocData = [] } = useQuery({
    queryKey: ['employees', 'hr-spocs', debouncedHrSpocSearch],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<{ items: ManagerListItem[] }>>(
        endpoints.employees,
        {
          params: {
            search: debouncedHrSpocSearch,
            department: 'Human Resources',
            limit: 20,
          },
        },
      );
      return response.data.data?.items ?? [];
    },
    enabled: open,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!open) {
      form.reset(getDefaultValues());
      setManagerSearch('');
      setShowManagerDropdown(false);
      setHrSpocSearch('');
      setShowHrSpocDropdown(false);
      return;
    }

    if (employee) {
      form.reset({
        ...getDefaultValues(),
        ...employee,
        employeeId: employee.id ? (employee.employeeId ?? '') : '',
        joiningDate: employee.joiningDate
          ? String(employee.joiningDate).slice(0, 10)
          : getDefaultValues().joiningDate,
        reportingManagerId: employee.reportingManagerId ?? undefined,
        hrSpocId: employee.hrSpocId ?? undefined,
        softwareLicensesAssigned: employee.softwareLicensesAssigned ?? [],
      });
      return;
    }

    form.reset(getDefaultValues());
    setManagerSearch('');
    setShowManagerDropdown(false);
    setHrSpocSearch('');
    setShowHrSpocDropdown(false);
  }, [employee, form, open]);

  const selectedManagerId = form.watch('reportingManagerId') ?? '';
  const selectedHrSpocId = form.watch('hrSpocId') ?? '';

  const selectedManager = useMemo(
    () => managersData.find((item) => item.id === selectedManagerId),
    [managersData, selectedManagerId],
  );

  const selectedHrSpoc = useMemo(
    () => hrSpocData.find((item) => item.id === selectedHrSpocId),
    [hrSpocData, selectedHrSpocId],
  );

  useEffect(() => {
    if (selectedManager && !managerSearch) {
      setManagerSearch(`${selectedManager.firstName} ${selectedManager.lastName}`);
    }
  }, [selectedManager]);

  useEffect(() => {
    if (selectedHrSpoc && !hrSpocSearch) {
      setHrSpocSearch(`${selectedHrSpoc.firstName} ${selectedHrSpoc.lastName}`);
    }
  }, [selectedHrSpoc]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !isSubmitting && onOpenChange(next)}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {employee?.id ? 'Edit employee' : 'Create employee'}
          </DialogTitle>
          <DialogDescription>
            {employee?.id
              ? 'Update employee details. Password can be left blank to keep the existing one.'
              : 'Set a password for the new employee. Visibility policy is enforced by the API.'}
          </DialogDescription>
        </DialogHeader>

        {/* FIX: Explicitly typed 'values' inside handleSubmit block to resolve TS2345 generic inference fallback */}
        <form className="grid gap-4" onSubmit={form.handleSubmit((values: EmployeeFormValues) => {
          if (!employee?.id && !values.password) {
            form.setError('password', { message: 'Password is required' });
            return;
          }
          onSubmit(values);
        })}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Work email"
              name="email"
              register={form.register}
              error={form.formState.errors.email?.message}
            />
            <FormField
              label="First name"
              name="firstName"
              register={form.register}
              error={form.formState.errors.firstName?.message}
            />
            <FormField
              label="Last name"
              name="lastName"
              register={form.register}
              error={form.formState.errors.lastName?.message}
            />
            <FormField
              label="Phone"
              name="phone"
              register={form.register}
              error={form.formState.errors.phone?.message}
            />

            {employee?.id ? (
              <FormField
                label="Employee ID"
                name="employeeId"
                register={form.register}
                error={form.formState.errors.employeeId?.message}
              />
            ) : null}

            {!employee?.id ? (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="pr-16"
                    {...form.register('password')}
                  />
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const val = form.getValues('password');
                        if (val) {
                          navigator.clipboard.writeText(val);
                          setPasswordCopied(true);
                          setTimeout(() => setPasswordCopied(false), 1500);
                        }
                      }}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
                      title="Copy password"
                    >
                      {passwordCopied ? (
                        <Check className="size-4 text-emerald-400" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                {form.formState.errors.password?.message && (
                  <span className="text-xs text-rose-300">
                    {form.formState.errors.password.message}
                  </span>
                )}
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label>Department *</Label>
              <Select
                value={form.watch('department')}
                onValueChange={(value) =>
                  form.setValue('department', value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.department && (
                <span className="text-xs text-rose-400">
                  {form.formState.errors.department.message}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Designation *</Label>
              <Select
                value={form.watch('designation')}
                onValueChange={(value) =>
                  form.setValue('designation', value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.designation && (
                <span className="text-xs text-rose-400">
                  {form.formState.errors.designation.message}
                </span>
              )}
            </div>

            <div className="grid gap-2 text-sm">
              <Label>Role</Label>
              <Select
                value={form.watch('roleId') ?? ''}
                onValueChange={(value) =>
                  form.setValue('roleId', value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              label="Joining date"
              name="joiningDate"
              type="date"
              register={form.register}
              error={form.formState.errors.joiningDate?.message}
            />

            <div className="grid gap-2 text-sm">
              <Label>Work Location</Label>
              <Select
                value={form.watch('workLocation') ?? ''}
                onValueChange={(value) =>
                  form.setValue('workLocation', value as EmployeeFormValues['workLocation'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>HR SPOC</Label>
              <div className="relative">
                <Input
                  placeholder="Search HR SPOC name..."
                  value={hrSpocSearch}
                  onChange={(event) => {
                    setHrSpocSearch(event.target.value);
                    setShowHrSpocDropdown(true);
                  }}
                  onFocus={() => {
                    if (hrSpocSearch) setShowHrSpocDropdown(true);
                  }}
                  className="mb-1"
                />
                {showHrSpocDropdown && hrSpocData.length > 0 && hrSpocSearch && (
                  <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-slate-900 shadow-xl">
                    {hrSpocData
                      .filter((spoc) => spoc.id !== employee?.id)
                      .map((spoc) => (
                        <button
                          key={spoc.id}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/8"
                          onClick={() => {
                            form.setValue('hrSpocId', spoc.id, {
                              shouldValidate: true,
                            });
                            setHrSpocSearch(
                              `${spoc.firstName} ${spoc.lastName}`,
                            );
                            setShowHrSpocDropdown(false);
                          }}
                        >
                          <span className="font-medium">
                            {spoc.firstName} {spoc.lastName}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {spoc.designation} - {spoc.department}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              {selectedHrSpocId && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Selected HR SPOC:{' '}
                    {selectedHrSpoc
                      ? `${selectedHrSpoc.firstName} ${selectedHrSpoc.lastName}`
                      : hrSpocSearch || selectedHrSpocId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('hrSpocId', '');
                      setHrSpocSearch('');
                      setShowHrSpocDropdown(true);
                    }}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    Clear
                  </button>
                </div>
              )}
              {form.formState.errors.hrSpocId && (
                <span className="text-xs text-rose-400">
                  {form.formState.errors.hrSpocId.message}
                </span>
              )}
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>Reporting Manager</Label>
              <div className="relative">
                <Input
                  placeholder="Search manager name..."
                  value={managerSearch}
                  onChange={(event) => {
                    setManagerSearch(event.target.value);
                    setShowManagerDropdown(true);
                  }}
                  onFocus={() => {
                    if (managerSearch) setShowManagerDropdown(true);
                  }}
                  className="mb-1"
                />
                {showManagerDropdown && managersData.length > 0 && managerSearch && (
                  <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-slate-900 shadow-xl">
                    {managersData
                      .filter((manager) => manager.id !== employee?.id)
                      .map((manager) => (
                        <button
                          key={manager.id}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/8"
                          onClick={() => {
                            form.setValue('reportingManagerId', manager.id, {
                              shouldValidate: true,
                            });
                            setManagerSearch(
                              `${manager.firstName} ${manager.lastName}`,
                            );
                            setShowManagerDropdown(false);
                          }}
                        >
                          <span className="font-medium">
                            {manager.firstName} {manager.lastName}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {manager.designation} - {manager.department}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              {selectedManagerId && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Selected manager:{' '}
                    {selectedManager
                      ? `${selectedManager.firstName} ${selectedManager.lastName}`
                      : managerSearch || selectedManagerId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('reportingManagerId', '');
                      setManagerSearch('');
                      setShowManagerDropdown(true);
                    }}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    Clear
                  </button>
                </div>
              )}
              {form.formState.errors.reportingManagerId && (
                <span className="text-xs text-rose-400">
                  {form.formState.errors.reportingManagerId.message}
                </span>
              )}
            </div>

            <div className="grid gap-2 text-sm">
              <Label>Employment type</Label>
              <Select
                value={form.watch('employmentType')}
                onValueChange={(value) =>
                  form.setValue('employmentType', value as EmployeeFormValues['employmentType'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'CONSULTANT'].map(
                    (item) => (
                      <SelectItem key={item} value={item}>
                        {item.replace('_', ' ')}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 text-sm">
              <Label>Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) =>
                  form.setValue('status', value as EmployeeFormValues['status'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {['ACTIVE', 'INACTIVE', 'ON_NOTICE', 'TERMINATED'].map((item) => (
                    <SelectItem key={item} value={item}>
                      {item.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {employee?.id ? 'Update employee' : 'Create employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}