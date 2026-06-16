import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit3, Eye, Loader2, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { endpoints } from "@/services/api/endpoints";
import { employeeApi } from "@/services/api/employee.api";
import { OperationalModulePage } from "@/modules/shared/OperationalModulePage";
import type { EmployeeFormValues } from "@/schemas/employee.schemas";
import { permissions } from "@/constants/permissions";
import { LOCATION_OPTIONS } from "./EmployeeFormDialog";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionGate } from "@/components/guards/PermissionGate";
import {
  EmployeeFormDialog,
  type EmployeeFormRecord,
} from "./EmployeeFormDialog";
import { EmployeeBulkActions } from "./EmployeeBulkActions";
import { useAuthStore } from "@/store/auth.store";

type EmployeeRecord = EmployeeFormRecord & Record<string, unknown>;

export function EmployeesPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { can, canDo } = usePermissions();

  const canCreate =
    can(permissions.employeeCreate) ||
    can(permissions.employeeUserManage) ||
    canDo("employee", "write") ||
    canDo("employee", "manage");
  const canEdit =
    can(permissions.employeeUpdate) ||
    can(permissions.employeeUserManage) ||
    canDo("employee", "write") ||
    canDo("employee", "manage");
  const canDelete =
    can(permissions.employeeDelete) ||
    can(permissions.employeeUserManage) ||
    canDo("employee", "manage") ||
    canDo("employee", "delete");
  const showActionsColumn = canEdit || canDelete;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRecord | null>(null);

  const invalidateEmployees = () => {
    void queryClient.invalidateQueries({ queryKey: ["employees"] });
    void queryClient.invalidateQueries({ queryKey: ["departments-hierarchy"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: EmployeeFormValues) => employeeApi.create(values),
    onSuccess: () => {
      toast.success("Employee created successfully");
      setDialogOpen(false);
      setEditingEmployee(null);
      invalidateEmployees();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to create employee");
    },
  });

  const updateFn = useCallback(
    ({ id, values }: { id: string; values: EmployeeFormValues }) =>
      employeeApi.update(id, values),
    [],
  );

  const updateMutation = useMutation({
    mutationFn: updateFn,
    onSuccess: () => {
      toast.success("Employee updated");
      setDialogOpen(false);
      setEditingEmployee(null);
      invalidateEmployees();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: employeeApi.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      const previous = queryClient.getQueriesData({
        queryKey: ["employees"],
      });
      queryClient.setQueriesData({ queryKey: ["employees"] }, (current) => {
        if (!current || typeof current !== "object" || !("items" in current)) {
          return current;
        }

        const data = current as {
          items: EmployeeRecord[];
          meta: { total: number };
        };
        return {
          ...data,
          items: data.items.filter((item) => item.id !== id),
          meta: { ...data.meta, total: Math.max(data.meta.total - 1, 0) },
        };
      });
      return { previous };
    },
    onError: (error, _id, context) => {
      context?.previous.forEach(([key, value]) =>
        queryClient.setQueryData(key, value),
      );
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Employee deleted");
      setDeleteTarget(null);
    },
    onSettled: invalidateEmployees,
  });

  const columns = useMemo<ColumnDef<EmployeeRecord>[]>(() => {
    const baseColumns: ColumnDef<EmployeeRecord>[] = [
      {
        accessorKey: "employeeId",
        header: "Employee ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {String(row.original.employeeId ?? "-")}
          </span>
        ),
      },
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {String(row.original.firstName ?? "")}{" "}
            {String(row.original.lastName ?? "")}
          </span>
        ),
      },
      { accessorKey: "department", header: "Department" },
      { accessorKey: "designation", header: "Designation" },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
          const code = String(row.original.location ?? '');
          const loc = LOCATION_OPTIONS.find((l) => l.value === code);
          return <span>{loc?.label ?? (code || '-')}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="success">{String(row.original.status ?? "-")}</Badge>
        ),
      },
      {
        id: "view",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button size="sm" variant="ghost" asChild>
            <Link to={`/employees/${row.original.id}`}>
              <Eye className="size-3.5" />
              View
            </Link>
          </Button>
        ),
      },
    ];

    if (!showActionsColumn) {
      return baseColumns;
    }

    baseColumns.push({
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const employee = row.original;
        const isSelf = currentUser?.employeeId === employee.id;

        if (isSelf) return null;

        return (
          <div className="flex items-center gap-2">
            <PermissionGate
              permissions={[
                permissions.employeeUpdate,
                permissions.employeeUserManage,
              ]}
            >
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingEmployee(employee);
                  setDialogOpen(true);
                }}
              >
                <Edit3 className="size-3.5" />
                Edit
              </Button>
            </PermissionGate>
            <PermissionGate
              permissions={[
                permissions.employeeDelete,
                permissions.employeeUserManage,
              ]}
            >
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteTarget(employee)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </PermissionGate>
          </div>
        );
      },
    });

    return baseColumns;
  }, [currentUser?.employeeId, showActionsColumn]);

  const submitEmployee = (values: EmployeeFormValues) => {
    const payload: EmployeeFormValues = {
      ...values,
      ...(values.reportingManagerId ? {} : { reportingManagerId: undefined }),
    };

    if (editingEmployee?.id) {
      updateMutation.mutate({ id: editingEmployee.id, values: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <>
      {(canCreate || canEdit) ? (
        <div className="mb-4 flex justify-end">
          <EmployeeBulkActions onCompleted={invalidateEmployees} />
        </div>
      ) : null}
      <OperationalModulePage<EmployeeRecord>
        config={{
          resource: "employees",
          endpoint: endpoints.employees,
          eyebrow: "Core HRMS",
          title: "Employee management",
          description:
            "Manage actual employee records, profiles, reporting hierarchy, employment status, and HR-owned employee data.",
          createLabel: "Create employee",
          columns,
          emptyTitle: "No employees found",
          emptyDescription:
            "Active employee records will appear here after they are created or converted from pre-onboarding.",
          ...(canCreate
            ? {
                onCreate: () => {
                  setEditingEmployee(null);
                  setDialogOpen(true);
                },
              }
            : {}),
          filters: [
            { key: "status", label: "Status", value: "Active" },
            {
              key: "visibility",
              label: "Visibility",
              value: "Policy enforced",
            },
          ],
        }}
      />
      <EmployeeFormDialog
        open={dialogOpen}
        employee={editingEmployee}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingEmployee(null);
          }
        }}
        onSubmit={submitEmployee}
      />
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) =>
          !deleteMutation.isPending && !open && setDeleteTarget(null)
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete employee?</DialogTitle>
            <DialogDescription>
              This soft-deletes the employee from HRMS views. Visibility rules
              still apply.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-white/[0.035] p-4 text-sm text-muted-foreground">
            {deleteTarget?.firstName} {deleteTarget?.lastName} -{" "}
            {deleteTarget?.employeeId}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending || !deleteTarget?.id}
              onClick={() =>
                deleteTarget?.id && deleteMutation.mutate(deleteTarget.id)
              }
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
