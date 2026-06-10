import { SectionCard } from "@/components/shared/SectionCard";
import { Field, SwitchField, CurrencyField, type SectionTabProps } from "./fields";

const StatutoryComplianceTab = ({ value, onChange }: SectionTabProps) => {
  return (
    <SectionCard title="Statutory Compliance Fields">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="PF UAN Number" value={value.pfUanNumber} />
        <Field label="PF Transfer / Withdrawal Status" value={value.pfTransferWithdrawalStatus} />
        <Field label="ESIC Number" value={value.esicNumber} />
        <SwitchField label="Gratuity Eligible" checked={Boolean(value.gratuityEligible)}
          onChange={(v) => onChange((p) => ({ ...p, gratuityEligible: v }))}
        />
        <CurrencyField label="Gratuity Amount" value={value.gratuityAmount}
          onChange={(v) => onChange((p) => ({ ...p, gratuityAmount: v }))}
        />
        <Field label="Form 16 Issuance Status" value={value.form16IssuanceStatus} />
        <Field label="Final Tax Computation Status" value={value.finalTaxComputationStatus} />
      </div>
    </SectionCard>
  );
}

export default StatutoryComplianceTab;