import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, RefreshCw, Loader2, UserRound, ExternalLink, BriefcaseBusiness, Clock3, BadgeCheck, AlertTriangle, Trash2 } from "lucide-react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDateTime } from "@/utils/timeUtils";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { httpClient } from "@/services/api/http-client";
import { endpoints } from "@/services/api/endpoints";
import { useDebounce } from "@/hooks/use-debounce";
import { usePermissions } from "@/hooks/use-permissions";
import { permissions } from "@/constants/permissions";
import { fnfSettlementApi, fnfKeys } from "@/services/api/fnf-settlement.api";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse } from "@/types/api";
import type { FnFSettlement, FnFStatus } from "@/types/fnf-settlement";

type EmployeeRecord = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
};

const statusColor: Record<FnFStatus, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  PENDING_APPROVAL: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
  DISPUTED: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  CLOSED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

export const FnFSettlementPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const debouncedEmployeeSearch = useDebounce(employeeSearch, 300);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteTarget, setDeleteTarget] = useState<FnFSettlement | null>(null);
  const { can, canDo } = usePermissions();
  const canRead = can(permissions.fnfRead);
  const canWrite = can(permissions.fnfWrite) || canDo("fnf", "write") || canDo("fnf", "manage");

  const columns = useMemo<ColumnDef<FnFSettlement>[]>(() => [
    {
      id: "caseId",
      accessorKey: "caseId",
      header: "Case ID",
      meta: { style: { width: 200, whiteSpace: 'wrap' } },
      cell: ({ row }) => (
        <span className="font-mono text-xs text-cyan-200">{row.original.caseId}</span>
      ),
    },
    {
      id: "employeeId",
      accessorKey: "employee.employeeId",
      header: "Employee ID",
      meta: { style: { width: 180, whiteSpace: 'wrap' } },
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.employee?.employeeId}</span>
      ),
    },
    {
      id: "firstName",
      accessorKey: "employee.firstName",
      header: "Employee Name",
      meta: { style: { width: 240, whiteSpace: 'wrap' } },
      cell: ({ row }) => {
        const e = row.original.employee;
        return <span className="font-medium">{e ? `${e.firstName} ${e.lastName}` : "-"}</span>;
      },
    },
    {
      id: "department",
      accessorKey: "employee.department",
      header: "Department",
      meta: { style: { width: 150, whiteSpace: 'wrap' } },
    },
    {
      id: "designation",
      accessorKey: "employee.designation",
      header: "Designation",
      meta: { style: { width: 180, whiteSpace: 'wrap' } },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      meta: { style: { width: 120, whiteSpace: 'nowrap' } },
      cell: ({ row }) => (
        <Badge variant="outline" className={`text-xs ${statusColor[row.original.status] ?? ""}`}>
          {row.original.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Created Date",
      meta: { style: { width: 180, whiteSpace: 'wrap' } },
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: "Last Updated",
      meta: { style: { width: 180, whiteSpace: 'wrap' } },
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      meta: { sticky: 'right', style: { width: 180}},
      cell: ({ row }) => {
        const settlement = row.original;
        const canDelete = canWrite && (settlement.status === "PENDING_APPROVAL" || settlement.status === "DRAFT");
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => navigate(`/fnf-settlement/${settlement.id}`)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Button>
            {canDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="h-8 gap-1 text-xs"
                onClick={() => setDeleteTarget(settlement)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ], [navigate]);

  const page = Number(searchParams.get("page")) || 1;
  const activeSort = sorting[0];
  const sortParams = activeSort ? { sortBy: activeSort.id, sortOrder: activeSort.desc ? "desc" as const : "asc" as const } : {};
  const listParams = { page, search: searchParams.get("search") || undefined, ...sortParams };

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: fnfKeys.list(listParams),
    queryFn: () => fnfSettlementApi.list(listParams),
    enabled: canRead,
    staleTime: 30_000,
    gcTime: 60_000,
  });

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees", "fnf-select", debouncedEmployeeSearch],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<{ items: EmployeeRecord[] }>>(endpoints.employees, {
        params: { search: debouncedEmployeeSearch || undefined, limit: 20 },
      });
      return response.data.data?.items ?? [];
    },
    enabled: dialogOpen && can(permissions.employeeRead),
    staleTime: 30_000,
    gcTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (employeeId: string) => fnfSettlementApi.create({ employeeId }),
    onSuccess: (result) => {
      toast.success("Full & Final Settlement created");
      setDialogOpen(false);
      setEmployeeSearch("");
      refetch();
      navigate(`/fnf-settlement/${result.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (settlementId: string) => fnfSettlementApi.remove(settlementId),
    onSuccess: () => {
      toast.success("Settlement deleted");
      setDeleteTarget(null);
      refetch();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const summary = useMemo(() => {
    const items = data?.items ?? [];
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "PENDING_APPROVAL").length,
      approved: items.filter((item) => item.status === "APPROVED").length,
      draft: items.filter((item) => item.status === "DRAFT").length,
    };
  }, [data?.items]);

  return (
    <PageTransition>
      <div className="space-y-6 p-5 lg:p-6">
        <PageHeader
          eyebrow="Exit & compliance"
          title="Full & Final Settlement"
          description="Track separation cases, approvals, and employee settlement actions in one place."
          actionsContainerClassName="h-[stretch] mt-2 lg:mt-0"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Refresh
              </Button>
              {canWrite && (
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Settlement
                </Button>
              )}
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total settlements', value: summary.total, icon: BriefcaseBusiness, tone: 'from-cyan-500/15 to-transparent border-cyan-500/20' },
            { label: 'Pending approval', value: summary.pending, icon: Clock3, tone: 'from-amber-500/15 to-transparent border-amber-500/20' },
            { label: 'Approved', value: summary.approved, icon: BadgeCheck, tone: 'from-emerald-500/15 to-transparent border-emerald-500/20' },
            { label: 'Drafts', value: summary.draft, icon: AlertTriangle, tone: 'from-rose-500/15 to-transparent border-rose-500/20' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className={`rounded-3xl border bg-gradient-to-br ${tone} p-4 shadow-sm`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-2.5 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <SectionCard
          title="Settlement records"
          description="Review current cases, search employees quickly, and open any settlement for further action."
          actions={(
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
              <SearchInput
                placeholder="Search by name, ID, case..."
                showSearchButton
                onSubmit={(value) => setSearchParams({ search: value, page: "1" })}
              />
              </div>
            </div>
          )}
        >
          <div className="space-y-4">

            <DataTable
              data={data?.items ?? []}
              columns={columns}
              isLoading={isLoading || isRefetching}
              emptyTitle="No settlements found"
              emptyDescription="Create a new Full & Final settlement to get started."
              onSortingChange={setSorting}
              fullWidth={false}
              page={page}
              totalPages={data?.meta.totalPages ?? 0}
              total={data?.meta.total ?? 0}
              onPageChange={(p) => setSearchParams({ search: searchParams.get("search") ?? "", page: String(p) })}
            />
          </div>
        </SectionCard>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Employee</DialogTitle>
            <DialogDescription>
              Choose an employee to create a Full & Final settlement for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Search employee by name or ID..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {!can(permissions.employeeRead) ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  You do not have permission to view employees.
                </p>
              ) : employeesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : employeesData?.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No employees found
                </p>
              ) : (
                employeesData?.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    disabled={createMutation.isPending}
                    onClick={() => createMutation.mutate(emp.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-white/[0.03] px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.07] disabled:opacity-50"
                  >
                    <UserRound className="h-8 w-8 shrink-0 rounded-full border border-border p-1.5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {emp.employeeId} &middot; {emp.department} &middot; {emp.designation}
                      </p>
                    </div>
                    {createMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
          <DialogFooter className="text-xs text-muted-foreground">
            {employeesData?.length ?? 0} employee{(employeesData?.length ?? 0) !== 1 ? "s" : ""} found
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete settlement?"
        description={`This will permanently delete the Full & Final settlement for ${deleteTarget?.employee ? `${deleteTarget.employee.firstName} ${deleteTarget.employee.lastName}` : "this employee"}. This action cannot be undone.`}
        confirmLabel="Delete settlement"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageTransition>
  );
}

