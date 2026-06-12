import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  Loader2,
  Save,
  Send,
  CheckCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fnfSettlementApi, fnfKeys } from "@/services/api/fnf-settlement.api";
import { downloadFnFSettlementPdf } from "./pdf-download.utils";
import { generateSettlementLetterHtml } from "./settlement-letter.utils";
import { usePermissions } from "@/hooks/use-permissions";
import { useCurrentUser } from "@/store/auth.store";
import { permissions } from "@/constants/permissions";
import { getErrorMessage } from "@/lib/errors";
import type { FnFSettlementDetail, FnFStatus } from "@/types/fnf-settlement";
import EmployeeMasterTab from "./components/EmployeeMasterTab";
import SeparationTab from "./components/SeparationTab";
import AttendanceLeaveTab from "./components/AttendanceLeaveTab";
import SalaryEarningsTab from "./components/SalaryEarningsTab";
import DeductionsTab from "./components/DeductionsTab";
import AssetsClearanceTab from "./components/AssetsClearanceTab";
import ReimbursementTab from "./components/ReimbursementTab";
import StatutoryComplianceTab from "./components/StatutoryComplianceTab";
import SettlementSummaryTab from "./components/SettlementSummaryTab";
import ApprovalsTab from "./components/ApprovalsTab";
import AcknowledgementTab from "./components/AcknowledgementTab";
import AuditLogsTab from "./components/AuditLogsTab";
import SettlementLetterTab from "./components/SettlementLetterTab";

const statusColor: Record<FnFStatus, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  PENDING_APPROVAL: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
  DISPUTED: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  CLOSED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

const approvalSteps = [
  { key: "reportingManager", label: "Reporting Manager", rolePatterns: ["reporting", "manager", "reporting_manager"] },
  { key: "hr", label: "HR", rolePatterns: ["hr"] },
  { key: "finance", label: "Finance", rolePatterns: ["finance"] },
  { key: "adminClearance", label: "Admin Clearance", rolePatterns: ["admin"] },
  { key: "finalAuthorization", label: "Final Authorization (HR Head / CFO)", rolePatterns: ["cfo", "hr_head", "final", "authorization"] },
];

type TabKey =
  | "employee-master"
  | "separation"
  | "attendance-leave"
  | "salary"
  | "deductions"
  | "assets"
  | "reimbursement"
  | "statutory"
  | "settlement-summary"
  | "approvals"
  | "acknowledgement"
  | "audit-logs"
  | "letter";

export const FnFSettlementDetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const activeTab = (searchParams.get("tab") as TabKey) || "employee-master";
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState<string>("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { can, canDo } = usePermissions();
  const canRead = can(permissions.fnfRead);
  const canManage = canDo("fnf", "manage");
  const canWrite = can(permissions.fnfWrite) || canDo("fnf", "write") || canManage;
  const canApprove = can(permissions.fnfApprove) || canDo("fnf", "approve") || canManage;
  const currentUser = useCurrentUser();

  const { data: settlement, isLoading } = useQuery({
    queryKey: fnfKeys.detail(id),
    queryFn: () => fnfSettlementApi.get(id),
    enabled: Boolean(id) && canRead,
    staleTime: 30_000,
    gcTime: 60_000,
  });
  const status = settlement?.status;

  const currentPendingStep = useMemo(() => {
    if (!settlement || status !== "PENDING_APPROVAL") return null;
    const approvals = settlement.approvals as Record<string, { status?: string }> | undefined;
    if (!approvals) return approvalSteps[0];
    for (const step of approvalSteps) {
      const entry = approvals[step.key];
      if (!entry || entry.status === "PENDING") return step;
    }
    return null;
  }, [settlement, status]);

  const canActOnCurrentStep = useMemo(() => {
    if (!currentPendingStep || !canApprove) return false;
    const userRoles = currentUser?.roles?.map((r) => r.toLowerCase()) ?? [];
    return currentPendingStep.rolePatterns.some((pattern) =>
      userRoles.some((role) => role.includes(pattern))
    );
  }, [currentPendingStep, canApprove, currentUser?.roles]);
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: fnfKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: fnfKeys.all });
  };

  const handleDownloadPdf = useCallback(async () => {
    if (!settlement) return;
    try {
      setDownloading(true);
      await downloadFnFSettlementPdf(settlement.id);
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  }, [settlement]);

  const [employeeMaster, setEmployeeMaster] = useState({} as Record<string, unknown>);
  const [separation, setSeparation] = useState({} as Record<string, unknown>);
  const [attendanceLeave, setAttendanceLeave] = useState({} as Record<string, unknown>);
  const [salaryEarnings, setSalaryEarnings] = useState({} as Record<string, unknown>);
  const [deductions, setDeductions] = useState({} as Record<string, unknown>);
  const [assetsClearance, setAssetsClearance] = useState({} as Record<string, unknown>);
  const [financeReimbursement, setFinanceReimbursement] = useState({} as Record<string, unknown>);
  const [statutoryCompliance, setStatutoryCompliance] = useState({} as Record<string, unknown>);
  const [finalSettlement, setFinalSettlement] = useState({} as Record<string, unknown>);
  const [acknowledgement, setAcknowledgement] = useState({} as Record<string, unknown>);

  const toDateValue = (v: unknown): string => {
    if (!v) return "";
    const s = String(v);
    return s.includes("T") ? s.slice(0, 10) : s;
  };

  useEffect(() => {
    if (!settlement) return;
    const em = settlement.employeeMaster as Record<string, unknown> | undefined;
    if (em) {
      setEmployeeMaster({
        ...em,
        dateOfExit: toDateValue(em.dateOfExit),
        lastWorkingDay: toDateValue(em.lastWorkingDay),
      });
    }
    const separationData = settlement.separation as Record<string, unknown> | undefined;
    if (separationData) {
      setSeparation({
        ...separationData,
        resignationSubmissionDate: toDateValue(separationData.resignationSubmissionDate),
        resignationAcceptanceDate: toDateValue(separationData.resignationAcceptanceDate),
      });
    }
    setAttendanceLeave(settlement.attendanceLeave as unknown as Record<string, unknown>);
    setSalaryEarnings(settlement.salaryEarnings as unknown as Record<string, unknown>);
    setDeductions(settlement.deductions as unknown as Record<string, unknown>);
    setAssetsClearance(settlement.assetsClearance as unknown as Record<string, unknown>);
    setFinanceReimbursement(settlement.financeReimbursement as unknown as Record<string, unknown>);
    setStatutoryCompliance(settlement.statutoryCompliance as unknown as Record<string, unknown>);
    setFinalSettlement(settlement.finalSettlement as unknown as Record<string, unknown>);
    setAcknowledgement(settlement.employeeAcknowledgement as unknown as Record<string, unknown>);
  }, [settlement]);

  // Auto-calculate pro-rata salary calculation based on entered and fetched data
  useEffect(() => {
    const basic = Number(salaryEarnings.basicSalary ?? 0);
    const hra = Number(salaryEarnings.hra ?? 0);
    const conveyance = Number(salaryEarnings.conveyanceAllowance ?? 0);
    const special = Number(salaryEarnings.specialAllowance ?? 0);
    const presentDays = Number(attendanceLeave.presentDays ?? 0);
    const totalDays = Number(attendanceLeave.totalWorkingDaysFinalMonth ?? 0);

    const calculated = totalDays > 0 ? Math.round((basic + hra + conveyance + special) * (presentDays / totalDays) * 100) / 100 : 0;
    if (Number(salaryEarnings.proRataSalary ?? 0) !== calculated) {
      setSalaryEarnings((prev) => ({
        ...prev,
        proRataSalary: calculated,
      }));
    }
  }, [
    salaryEarnings.basicSalary,
    salaryEarnings.hra,
    salaryEarnings.conveyanceAllowance,
    salaryEarnings.specialAllowance,
    attendanceLeave.presentDays,
    attendanceLeave.totalWorkingDaysFinalMonth,
  ]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<FnFSettlementDetail>) => fnfSettlementApi.update(id, payload),
    onSuccess: () => { toast.success("Saved"); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const submitMutation = useMutation({
    mutationFn: () => fnfSettlementApi.submit(id),
    onSuccess: () => { toast.success("Submitted for approval"); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const approveMutation = useMutation({
    mutationFn: () => fnfSettlementApi.approve(id, { remarks: approveRemarks, step: currentPendingStep?.key as string }),
    onSuccess: () => { toast.success("Approved"); invalidate(); setApproveDialogOpen(false); setApproveRemarks(""); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () => fnfSettlementApi.reject(id, { remarks: rejectRemarks, step: currentPendingStep?.key  as string}),
    onSuccess: () => { toast.success("Rejected"); invalidate(); setRejectDialogOpen(false); setRejectRemarks(""); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => fnfSettlementApi.remove(id),
    onSuccess: () => {
      toast.success("Settlement deleted");
      queryClient.invalidateQueries({ queryKey: fnfKeys.all });
      navigate("/fnf-settlement");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const letterHtml = useMemo(() => {
    if (!settlement) return null;
    return generateSettlementLetterHtml(settlement);
  }, [settlement]);

  const setTab = (tab: string) => setSearchParams({ tab });

  const toIsoDate = (val: string) => {
    if (!val) return val;
    if (val.includes("T")) return val;
    return `${val}T00:00:00.000Z`;
  };
  const handleSave = useCallback(() => {
    const hasProRata = Number(salaryEarnings.proRataSalary ?? 0) > 0;
    const computedTotalEarnings = hasProRata
      ? Number(salaryEarnings.proRataSalary ?? 0) + Number(salaryEarnings.otherEarnings ?? 0) +
        Number(salaryEarnings.incentivesBonusPayable ?? 0) + Number(salaryEarnings.leaveEncashment ?? 0) +
        Number(financeReimbursement?.approvedUnpaidReimbursements ?? 0) + Number(salaryEarnings.arrears ?? 0)
      : Number(salaryEarnings.basicSalary ?? 0) + Number(salaryEarnings.hra ?? 0) +
        Number(salaryEarnings.conveyanceAllowance ?? 0) + Number(salaryEarnings.specialAllowance ?? 0) +
        Number(salaryEarnings.otherEarnings ?? 0) + Number(salaryEarnings.incentivesBonusPayable ?? 0) +
        Number(salaryEarnings.leaveEncashment ?? 0) + Number(financeReimbursement?.approvedUnpaidReimbursements ?? 0) +
        Number(salaryEarnings.arrears ?? 0);

    const computedTotalDeductions = Number(deductions.pfEmployeeContribution ?? 0) +
      Number(deductions.professionalTax ?? 0) + Number(deductions.incomeTaxTds ?? 0) +
      Number(deductions.loanRecovery ?? 0) + Number(deductions.advanceSalaryRecovery ?? 0) +
      Number(deductions.assetRecoveryCharges ?? 0) + Number(assetsClearance?.assetDamageCharges ?? 0) +
      Number(deductions.noticePayRecovery ?? 0) + Number(deductions.anyOtherDeduction ?? 0);

    const computedNetPayable = computedTotalEarnings - computedTotalDeductions;
    const netPayable = computedNetPayable > 0 ? computedNetPayable : 0;
    const netRecoverable = computedNetPayable < 0 ? Math.abs(computedNetPayable) : 0;
    const settlementType = computedNetPayable >= 0 ? "CREDIT" : "DEBIT";

    const computedFinalGrossSalary = hasProRata
      ? Number(salaryEarnings.proRataSalary ?? 0) + Number(salaryEarnings.otherEarnings ?? 0) +
        Number(salaryEarnings.incentivesBonusPayable ?? 0) + Number(salaryEarnings.arrears ?? 0)
      : Number(salaryEarnings.basicSalary ?? 0) + Number(salaryEarnings.hra ?? 0) +
        Number(salaryEarnings.conveyanceAllowance ?? 0) + Number(salaryEarnings.specialAllowance ?? 0) +
        Number(salaryEarnings.otherEarnings ?? 0) + Number(salaryEarnings.incentivesBonusPayable ?? 0) +
        Number(salaryEarnings.arrears ?? 0);

    const payload: Record<string, unknown> = {
      employeeMaster: {
        ...employeeMaster,
        dateOfExit: toIsoDate(String(employeeMaster.dateOfExit ?? "")),
        lastWorkingDay: toIsoDate(String(employeeMaster.lastWorkingDay ?? "")),
      },
      separation: {
        ...separation,
        resignationSubmissionDate: toIsoDate(String(separation.resignationSubmissionDate ?? "")),
        resignationAcceptanceDate: toIsoDate(String(separation.resignationAcceptanceDate ?? "")),
      },
      attendanceLeave,
      salaryEarnings: {
        ...salaryEarnings,
        finalGrossSalary: computedFinalGrossSalary,
      },
      deductions,
      assetsClearance,
      financeReimbursement,
      statutoryCompliance,
      finalSettlement: {
        ...finalSettlement,
        totalEarnings: computedTotalEarnings,
        totalDeductions: computedTotalDeductions,
        netPayable,
        netRecoverable,
        settlementType,
      },
      employeeAcknowledgement: acknowledgement,
    };
    saveMutation.mutate(payload as Partial<FnFSettlementDetail>);
  }, [employeeMaster, separation, attendanceLeave, salaryEarnings, deductions, assetsClearance, financeReimbursement, statutoryCompliance, finalSettlement, acknowledgement, saveMutation]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settlement) {
    return (
      <PageTransition>
        <PageHeader title="Not Found" description="Settlement record not found." />
        <Button variant="outline" onClick={() => navigate("/fnf-settlement")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </PageTransition>
    );
  }


  return (
    <PageTransition>
      <PageHeader
        eyebrow={`Case: ${settlement.caseId}`}
        title={`${String(employeeMaster.employeeFullName ?? "")} - Full & Final Settlement`}
        description={`Employee ID: ${String(employeeMaster.employeeId ?? "")}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-xs ${statusColor[status!] ?? ""}`}>
              {status?.replace(/_/g, " ")}
            </Badge>
            {currentPendingStep && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                Pending: {currentPendingStep.label}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/fnf-settlement")}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-4 w-4" />
              )}
              PDF
            </Button>
            {status === "DRAFT" && canWrite && (
              <Button size="sm" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-4 w-4" />
                )}
                Submit
              </Button>
            )}
            {status === "PENDING_APPROVAL" && canActOnCurrentStep && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setApproveDialogOpen(true)}
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            {canWrite && (status === "PENDING_APPROVAL" || status === "DRAFT") && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            )}
            {canWrite && (
              <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                Save
              </Button>
            )}
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setTab} className="mt-6">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="employee-master">Employee Master</TabsTrigger>
          <TabsTrigger value="separation">Separation</TabsTrigger>
          <TabsTrigger value="attendance-leave">Attendance & Leave</TabsTrigger>
          <TabsTrigger value="salary">Salary & Earnings</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="reimbursement">Reimbursements</TabsTrigger>
          <TabsTrigger value="statutory">Statutory</TabsTrigger>
          <TabsTrigger value="settlement-summary">Summary</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="acknowledgement">Acknowledgement</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="letter">Settlement Letter</TabsTrigger>
        </TabsList>

        <TabsContent value="employee-master">
          <EmployeeMasterTab value={employeeMaster} onChange={setEmployeeMaster} errors={undefined} />
        </TabsContent>

        <TabsContent value="separation">
          <SeparationTab value={separation} onChange={setSeparation} errors={undefined} />
        </TabsContent>

        <TabsContent value="attendance-leave">
          <AttendanceLeaveTab value={attendanceLeave} onChange={setAttendanceLeave} />
        </TabsContent>

        <TabsContent value="salary">
          <SalaryEarningsTab value={salaryEarnings} onChange={setSalaryEarnings} errors={undefined} />
        </TabsContent>

        <TabsContent value="deductions">
          <DeductionsTab value={deductions} onChange={setDeductions} errors={undefined} />
        </TabsContent>

        <TabsContent value="assets">
          <AssetsClearanceTab value={assetsClearance} onChange={setAssetsClearance} />
        </TabsContent>

        <TabsContent value="reimbursement">
          <ReimbursementTab value={financeReimbursement} onChange={setFinanceReimbursement} />
        </TabsContent>

        <TabsContent value="statutory">
          <StatutoryComplianceTab value={statutoryCompliance} onChange={setStatutoryCompliance} />
        </TabsContent>

        <TabsContent value="settlement-summary">
          <SettlementSummaryTab
            value={finalSettlement}
            onChange={setFinalSettlement}
            salaryEarnings={salaryEarnings}
            deductions={deductions}
            financeReimbursement={financeReimbursement}
            assetsClearance={assetsClearance}
          />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalsTab settlement={settlement} />
        </TabsContent>

        <TabsContent value="acknowledgement">
          <AcknowledgementTab value={acknowledgement} onChange={setAcknowledgement} />
        </TabsContent>

        <TabsContent value="audit-logs">
          <AuditLogsTab settlement={settlement} />
        </TabsContent>

        <TabsContent value="letter">
          <SettlementLetterTab letterHtml={letterHtml} downloading={downloading} onDownloadPdf={handleDownloadPdf} />
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Settlement</DialogTitle>
            <DialogDescription>Provide remarks for rejecting this Full & Final settlement.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection remarks..."
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending || !rejectRemarks}>
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Settlement</DialogTitle>
            <DialogDescription>Provide remarks for approving this Full & Final settlement.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter approval remarks..."
            value={approveRemarks}
            onChange={(e) => setApproveRemarks(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
              {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteOpen}
        title="Delete settlement?"
        description="This Full & Final settlement will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete settlement"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteOpen(false)}
      />
    </PageTransition>
  );
}

