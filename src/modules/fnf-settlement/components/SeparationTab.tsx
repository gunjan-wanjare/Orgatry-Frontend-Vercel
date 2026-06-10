import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/shared/SectionCard";
import { InputField, SelectField, SwitchField, type SectionTabProps } from "./fields";

const SeparationTab = ({ value, onChange }: SectionTabProps) => {
  return (
    <SectionCard title="Separation & Exit Details">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InputField
          label="Resignation Submission Date"
          type="date"
          value={value.resignationSubmissionDate ?? ""}
          onChange={(v) => onChange((p) => ({ ...p, resignationSubmissionDate: v }))}
        />
        <InputField
          label="Resignation Acceptance Date"
          type="date"
          value={value.resignationAcceptanceDate ?? ""}
          onChange={(v) => onChange((p) => ({ ...p, resignationAcceptanceDate: v }))}
        />
        <SwitchField label="Exit Interview Completed" checked={Boolean(value.exitInterviewCompleted)}
          onChange={(v) => onChange((p) => ({ ...p, exitInterviewCompleted: v }))}
        />
        <InputField
          label="Reason for Exit"
          value={value.reasonForExit ?? ""}
          onChange={(v) => onChange((p) => ({ ...p, reasonForExit: v }))}
        />
        <div className="md:col-span-2">
          <Label className="text-xs text-muted-foreground">Exit Remarks</Label>
          <Textarea
            value={String(value.exitRemarks ?? "")}
            onChange={(e) => onChange((p) => ({ ...p, exitRemarks: e.target.value }))}
            className="mt-1"
          />
        </div>
        <SelectField label="Exit Type" value={value.exitType as string}
          onChange={(v) => onChange((p) => ({ ...p, exitType: v }))}
          options={[{ value: "VOLUNTARY", label: "Voluntary" }, { value: "INVOLUNTARY", label: "Involuntary" }]}
        />
        <SelectField label="Relieving Status" value={value.relievingStatus as string}
          onChange={(v) => onChange((p) => ({ ...p, relievingStatus: v }))}
          options={[{ value: "RELIEVED", label: "Relieved" }, { value: "NOT_RELIEVED", label: "Not Relieved" }]}
        />
        <SelectField label="Exit Clearance Status" value={value.exitClearanceStatus as string}
          onChange={(v) => onChange((p) => ({ ...p, exitClearanceStatus: v }))}
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "CLEARED", label: "Cleared" },
            { value: "NOT_CLEARED", label: "Not Cleared" },
          ]}
        />
      </div>
    </SectionCard>
  );
}

export default SeparationTab;