import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/SectionCard";
import { CurrencyField, formatCurrency, type SectionTabProps } from "./fields";

const SalaryEarningsTab = ({ value, onChange }: SectionTabProps) => {
  return (
    <SectionCard title="Salary & Earnings Calculation">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CurrencyField label="Basic Salary" value={value.basicSalary}
          onChange={(v) => onChange((p) => ({ ...p, basicSalary: v }))}
        />
        <CurrencyField label="HRA" value={value.hra}
          onChange={(v) => onChange((p) => ({ ...p, hra: v }))}
        />
        <CurrencyField label="Conveyance Allowance" value={value.conveyanceAllowance}
          onChange={(v) => onChange((p) => ({ ...p, conveyanceAllowance: v }))}
        />
        <CurrencyField label="Special Allowance" value={value.specialAllowance}
          onChange={(v) => onChange((p) => ({ ...p, specialAllowance: v }))}
        />
        <CurrencyField label="Other Earnings" value={value.otherEarnings}
          onChange={(v) => onChange((p) => ({ ...p, otherEarnings: v }))}
        />
        <CurrencyField label="Incentives / Bonus Payable" value={value.incentivesBonusPayable}
          onChange={(v) => onChange((p) => ({ ...p, incentivesBonusPayable: v }))}
        />
        <CurrencyField label="Arrears" value={value.arrears}
          onChange={(v) => onChange((p) => ({ ...p, arrears: v }))}
        />
        <CurrencyField label="Notice Period Recovery" value={value.noticePeriodRecovery}
          onChange={(v) => onChange((p) => ({ ...p, noticePeriodRecovery: v }))}
        />
        <CurrencyField label="Pro-rata Salary" value={value.proRataSalary}
          onChange={(v) => onChange((p) => ({ ...p, proRataSalary: v }))}
        />
        <div className="flex items-end">
          <div className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <Label className="text-xs text-emerald-400">Final Gross Salary</Label>
            <p className="mt-1 text-lg font-semibold text-emerald-300">
              {formatCurrency(value.finalGrossSalary ?? (
                Number(value.basicSalary ?? 0) + Number(value.hra ?? 0) +
                Number(value.conveyanceAllowance ?? 0) + Number(value.specialAllowance ?? 0) +
                Number(value.otherEarnings ?? 0) + Number(value.incentivesBonusPayable ?? 0) +
                Number(value.arrears ?? 0)
              ))}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export default SalaryEarningsTab;