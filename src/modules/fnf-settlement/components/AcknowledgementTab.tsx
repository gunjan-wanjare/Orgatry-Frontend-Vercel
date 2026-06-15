import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/shared/SectionCard";
import { Switch } from "@/components/ui/switch";
import { Field, SelectField, type SectionTabProps } from "./fields";
import { formatDateTime } from "@/utils/timeUtils";

const AcknowledgementTab = ({ value, onChange }: SectionTabProps) => {
  return (
    <SectionCard title="Employee Acknowledgement">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.03] px-4 py-3">
          <div className="space-y-0.5">
            <Label className="text-xs text-muted-foreground">Full & Final Statement Shared</Label>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${value.statementShared ? "text-emerald-400" : "text-rose-400"}`}>
              {value.statementShared ? "Yes" : "No"}
            </span>
            <Switch
              id="statement-shared-switch"
              checked={Boolean(value.statementShared)}
              onCheckedChange={(v) => onChange((p) => ({ ...p, statementShared: v }))}
            />
          </div>
        </div>
        <Field label="Shared Date" value={formatDateTime(value.sharedDate)} />
        <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.03] px-4 py-3">
          <div className="space-y-0.5">
            <Label className="text-xs text-muted-foreground">Employee Acceptance</Label>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${value.acceptance === "ACCEPTED" ? "text-emerald-400" : "text-rose-400"}`}>
              {value.acceptance === "ACCEPTED" ? "Accepted" : "Disputed"}
            </span>
            <Switch
              id="acceptance-switch"
              checked={value.acceptance === "ACCEPTED"}
              onCheckedChange={(v) => onChange((p) => ({ ...p, acceptance: v ? "ACCEPTED" : "DISPUTED" }))}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs text-muted-foreground">Dispute Remarks</Label>
          <Textarea
            value={String(value.disputeRemarks ?? "")}
            onChange={(e) => onChange((p) => ({ ...p, disputeRemarks: e.target.value }))}
            className="mt-1"
          />
        </div>
        <SelectField label="Digital Signature / E-sign Status" value={value.digitalSignatureStatus as string}
          onChange={(v) => onChange((p) => ({ ...p, digitalSignatureStatus: v }))}
          options={[
            { value: "NOT_REQUIRED", label: "Not Required" },
            { value: "PENDING", label: "Pending" },
            { value: "SIGNING", label: "Signing" },
            { value: "SIGNED", label: "Signed" },
            { value: "FAILED", label: "Failed" },
          ]}
        />
        <Field label="Closure Confirmation Date" value={formatDateTime(value.closureConfirmationDate)} />
      </div>
    </SectionCard>
  );
}

export default AcknowledgementTab;