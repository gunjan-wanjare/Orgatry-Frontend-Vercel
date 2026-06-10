import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/shared/SectionCard";
import type { FnFSettlementDetail } from "@/types/fnf-settlement";

type ApprovalsTabProps = {
  settlement: FnFSettlementDetail;
};

const steps = [
  { key: "reportingManager", label: "Reporting Manager" },
  { key: "hr", label: "HR" },
  { key: "finance", label: "Finance" },
  { key: "adminClearance", label: "Admin Clearance" },
  { key: "finalAuthorization", label: "Final Authorization (HR Head / CFO)" },
];

const ApprovalsTab = ({ settlement }: ApprovalsTabProps) => {
  return (
    <SectionCard title="Approvals Workflow">
      <div className="space-y-4">
        {steps.map(({ key, label }) => {
          const entry = settlement.approvals?.[key as keyof typeof settlement.approvals] as Record<string, unknown> | undefined;
          if (!entry) return null;
          return (
            <div key={key} className="rounded-lg border border-border bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{label}</h4>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    entry.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : entry.status === "REJECTED"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  }`}
                >
                  {String(entry.status ?? "PENDING")}
                </Badge>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                <span>By: {String(entry.approvedBy ?? "-")}</span>
                <span>Date: {entry.approvedAt ? String(entry.approvedAt).slice(0, 10) : "-"}</span>
                <span>Remarks: {String(entry.remarks ?? "-")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

export default ApprovalsTab;