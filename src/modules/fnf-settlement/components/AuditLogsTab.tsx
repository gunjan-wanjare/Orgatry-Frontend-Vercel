import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/SectionCard";
import { formatDateTime } from "@/utils/timeUtils";
import { Field } from "./fields";
import type { FnFSettlementDetail } from "@/types/fnf-settlement";

type AuditLogsTabProps = {
  settlement: FnFSettlementDetail;
};

const AuditLogsTab = ({ settlement }: AuditLogsTabProps) => {
  return (
    <SectionCard title="Audit & System Logs">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="F&F Case ID / SRN" value={settlement.auditLogs?.caseId ?? settlement.caseId} />
        <Field label="Created By" value={settlement.auditLogs?.createdBy ?? settlement.createdBy} />
        <Field label="Created Date" value={formatDateTime(settlement.auditLogs?.createdDate ?? settlement.createdAt)} />
        <Field label="Last Updated By" value={settlement.auditLogs?.lastUpdatedBy ?? settlement.updatedBy} />
        <Field label="Last Updated Date" value={formatDateTime(settlement.auditLogs?.lastUpdatedDate ?? settlement.updatedAt)} />
        <div className="md:col-span-3">
          <Label className="text-xs text-muted-foreground">Version History</Label>
          <p className="mt-1 whitespace-pre-wrap text-sm">{settlement.auditLogs?.versionHistory ?? "-"}</p>
        </div>
        <div className="md:col-span-3">
          <Label className="text-xs text-muted-foreground">Audit Trail Notes</Label>
          <p className="mt-1 whitespace-pre-wrap text-sm">{settlement.auditLogs?.auditTrailNotes ?? "-"}</p>
        </div>
      </div>
    </SectionCard>
  );
}
export default AuditLogsTab;