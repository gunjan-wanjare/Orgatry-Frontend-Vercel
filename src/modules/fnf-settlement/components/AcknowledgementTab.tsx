import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/shared/SectionCard";
import { Field, SelectField, SwitchField, type SectionTabProps } from "./fields";

const AcknowledgementTab = ({ value, onChange }: SectionTabProps) => {
  return (
    <SectionCard title="Employee Acknowledgement">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SwitchField label="Statement Shared" checked={Boolean(value.statementShared)}
          onChange={(v) => onChange((p) => ({ ...p, statementShared: v }))}
        />
        <Field label="Shared Date" value={value.sharedDate} />
        <SelectField label="Employee Acceptance" value={value.acceptance as string}
          onChange={(v) => onChange((p) => ({ ...p, acceptance: v }))}
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "ACCEPTED", label: "Accepted" },
            { value: "DISPUTED", label: "Disputed" },
          ]}
        />
        <div className="md:col-span-2">
          <Label className="text-xs text-muted-foreground">Dispute Remarks</Label>
          <Textarea
            value={String(value.disputeRemarks ?? "")}
            onChange={(e) => onChange((p) => ({ ...p, disputeRemarks: e.target.value }))}
            className="mt-1"
          />
        </div>
        <Field label="Digital Signature / E-sign Status" value={value.digitalSignatureStatus} />
        <Field label="Closure Confirmation Date" value={value.closureConfirmationDate} />
      </div>
    </SectionCard>
  );
}

export default AcknowledgementTab;