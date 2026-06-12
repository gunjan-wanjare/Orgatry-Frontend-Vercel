import { SectionCard } from "@/components/shared/SectionCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SelectField, CurrencyField, InputField, type SectionTabProps } from "./fields";

const StatutoryComplianceTab = ({ value, onChange }: SectionTabProps) => {
  return (
    <SectionCard title="Statutory Compliance Fields">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InputField label="PF UAN Number" type="text" value={value.pfUanNumber || ""}
          onChange={(v) => onChange((p) => ({ ...p, pfUanNumber: v }))}
          error={undefined}
        />
        <InputField label="PF Transfer / Withdrawal Status" type="text" value={value.pfTransferWithdrawalStatus || ""}
          onChange={(v) => onChange((p) => ({ ...p, pfTransferWithdrawalStatus: v }))}
          error={undefined}
        />
        <InputField label="ESIC Number" type="text" value={value.esicNumber || ""}
          onChange={(v) => onChange((p) => ({ ...p, esicNumber: v }))}
          error={undefined}
        />
        <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.03] px-4 py-3">
          <div className="space-y-0.5">
            <Label className="text-xs text-muted-foreground">Gratuity Eligible</Label>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${value.gratuityEligible ? "text-emerald-400" : "text-rose-400"}`}>
              {value.gratuityEligible ? "Yes" : "No"}
            </span>
            <Switch
              id="gratuity-eligible-switch"
              checked={Boolean(value.gratuityEligible)}
              onCheckedChange={(v) => onChange((p) => ({ ...p, gratuityEligible: v }))}
            />
          </div>
        </div>
        <CurrencyField label="Gratuity Amount" value={value.gratuityAmount}
          onChange={(v) => onChange((p) => ({ ...p, gratuityAmount: v }))}
        />
        <SelectField label="Form 16 Issuance Status" value={value.form16IssuanceStatus as string}
          onChange={(v) => onChange((p) => ({ ...p, form16IssuanceStatus: v }))}
          options={[
            { value: "NOT_APPLICABLE", label: "Not Applicable" },
            { value: "NOT_INITIATED", label: "Not Initiated" },
            { value: "PENDING_GENERATION", label: "Pending Generation" },
            { value: "GENERATED", label: "Generated" },
            { value: "UNDER_REVIEW", label: "Under Review" },
            { value: "APPROVED", label: "Approved" },
            { value: "ISSUED", label: "Issued" },
            { value: "DELIVERED", label: "Delivered" },
            { value: "REISSUED", label: "Reissued" },
          ]}
        />
        <SelectField label="Final Tax Computation Status" value={value.finalTaxComputationStatus as string}
          onChange={(v) => onChange((p) => ({ ...p, finalTaxComputationStatus: v }))}
          options={[
            { value: "NOT_APPLICABLE", label: "Not Applicable" },
            { value: "NOT_INITIATED", label: "Not Initiated" },
            { value: "PENDING_GENERATION", label: "Pending Generation" },
            { value: "GENERATED", label: "Generated" },
            { value: "UNDER_REVIEW", label: "Under Review" },
            { value: "APPROVED", label: "Approved" },
            { value: "ISSUED", label: "Issued" },
            { value: "DELIVERED", label: "Delivered" },
            { value: "REISSUED", label: "Reissued" },
          ]}
        />
      </div>
    </SectionCard>
  );
}

export default StatutoryComplianceTab;