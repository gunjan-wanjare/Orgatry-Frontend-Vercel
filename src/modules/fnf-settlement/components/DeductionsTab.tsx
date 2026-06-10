import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/SectionCard";
import { CurrencyField, formatCurrency, type SectionTabProps } from "./fields";

const DeductionsTab = ({ value, onChange }: SectionTabProps) => {
  return (
    <SectionCard title="Deductions Section">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CurrencyField label="PF Employee Contribution" value={value.pfEmployeeContribution}
          onChange={(v) => onChange((p) => ({ ...p, pfEmployeeContribution: v }))}
        />
        <CurrencyField label="Professional Tax" value={value.professionalTax}
          onChange={(v) => onChange((p) => ({ ...p, professionalTax: v }))}
        />
        <CurrencyField label="Income Tax (TDS)" value={value.incomeTaxTds}
          onChange={(v) => onChange((p) => ({ ...p, incomeTaxTds: v }))}
        />
        <CurrencyField label="Loan Recovery" value={value.loanRecovery}
          onChange={(v) => onChange((p) => ({ ...p, loanRecovery: v }))}
        />
        <CurrencyField label="Advance Salary Recovery" value={value.advanceSalaryRecovery}
          onChange={(v) => onChange((p) => ({ ...p, advanceSalaryRecovery: v }))}
        />
        <CurrencyField label="Asset Recovery Charges" value={value.assetRecoveryCharges}
          onChange={(v) => onChange((p) => ({ ...p, assetRecoveryCharges: v }))}
        />
        <CurrencyField label="Notice Pay Recovery" value={value.noticePayRecovery}
          onChange={(v) => onChange((p) => ({ ...p, noticePayRecovery: v }))}
        />
        <CurrencyField label="Any Other Deduction" value={value.anyOtherDeduction}
          onChange={(v) => onChange((p) => ({ ...p, anyOtherDeduction: v }))}
        />
        <div className="flex items-end">
          <div className="flex-1 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
            <Label className="text-xs text-red-400">Total Deductions</Label>
            <p className="mt-1 text-lg font-semibold text-red-300">
              {formatCurrency(
                Number(value.pfEmployeeContribution ?? 0) + Number(value.professionalTax ?? 0) +
                Number(value.incomeTaxTds ?? 0) + Number(value.loanRecovery ?? 0) +
                Number(value.advanceSalaryRecovery ?? 0) + Number(value.assetRecoveryCharges ?? 0) +
                Number(value.noticePayRecovery ?? 0) + Number(value.anyOtherDeduction ?? 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export default DeductionsTab;