import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/SectionCard";
import { CurrencyField, formatCurrency, type SectionTabProps } from "./fields";

const SalaryEarningsTab = ({ value, onChange, errors }: SectionTabProps) => {
  return (
    <SectionCard title="Salary & Earnings Calculation">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CurrencyField label="Basic Salary" value={value.basicSalary}
          onChange={(v) => onChange((p) => ({ ...p, basicSalary: v }))}
          error={errors?.basicSalary}
        />
        <CurrencyField label="HRA" value={value.hra}
          onChange={(v) => onChange((p) => ({ ...p, hra: v }))}
          error={errors?.hra}
        />
        <CurrencyField label="Conveyance Allowance" value={value.conveyanceAllowance}
          onChange={(v) => onChange((p) => ({ ...p, conveyanceAllowance: v }))}
          error={errors?.conveyanceAllowance}
        />
        <CurrencyField label="Special Allowance" value={value.specialAllowance}
          onChange={(v) => onChange((p) => ({ ...p, specialAllowance: v }))}
          error={errors?.specialAllowance}
        />
        <CurrencyField label="Other Earnings" value={value.otherEarnings}
          onChange={(v) => onChange((p) => ({ ...p, otherEarnings: v }))}
          error={errors?.otherEarnings}
        />
        <CurrencyField label="Incentives / Bonus Payable" value={value.incentivesBonusPayable}
          onChange={(v) => onChange((p) => ({ ...p, incentivesBonusPayable: v }))}
          error={errors?.incentivesBonusPayable}
        />
        <CurrencyField label="Leave Encashment" value={value.leaveEncashment}
          onChange={(v) => onChange((p) => ({ ...p, leaveEncashment: v }))}
          error={errors?.leaveEncashment}
        />
        <CurrencyField label="Arrears" value={value.arrears}
          onChange={(v) => onChange((p) => ({ ...p, arrears: v }))}
          error={errors?.arrears}
        />
        <CurrencyField label="Notice Period Recovery (if applicable)" value={value.noticePeriodRecovery}
          onChange={(v) => onChange((p) => ({ ...p, noticePeriodRecovery: v }))}
          error={errors?.noticePeriodRecovery}
        />
        <div>
          <CurrencyField label="Pro-rata Salary Calculation" value={value.proRataSalary}
            onChange={(v) => onChange((p) => ({ ...p, proRataSalary: v }))}
            error={errors?.proRataSalary}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Formula: (Basic + HRA + Allowances) &times; (Present Days &divide; Total Working Days)
          </p>
        </div>
        <div className="flex items-end">
          <div className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <Label className="text-xs text-emerald-400">Final Gross Salary</Label>
            <p className="mt-1 text-lg font-semibold text-emerald-300">
              {formatCurrency(
                Number(value.proRataSalary ?? 0) > 0
                  ? Number(value.proRataSalary ?? 0) + Number(value.otherEarnings ?? 0) +
                    Number(value.incentivesBonusPayable ?? 0) + Number(value.arrears ?? 0)
                  : Number(value.basicSalary ?? 0) + Number(value.hra ?? 0) +
                    Number(value.conveyanceAllowance ?? 0) + Number(value.specialAllowance ?? 0) +
                    Number(value.otherEarnings ?? 0) + Number(value.incentivesBonusPayable ?? 0) +
                    Number(value.arrears ?? 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export default SalaryEarningsTab;