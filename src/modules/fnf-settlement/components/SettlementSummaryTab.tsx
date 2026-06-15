import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/SectionCard";
import { InputField, SelectField, formatCurrency, type SectionTabProps } from "./fields";

type SettlementSummaryTabProps = SectionTabProps & {
  salaryEarnings: Record<string, unknown>;
  deductions: Record<string, unknown>;
  financeReimbursement: Record<string, unknown>;
  assetsClearance: Record<string, unknown>;
};

const SettlementSummaryTab = ({
  value,
  onChange,
  salaryEarnings,
  deductions,
  financeReimbursement,
  assetsClearance,
}: SettlementSummaryTabProps) => {
  const hasProRata = Number(salaryEarnings.proRataSalary ?? 0) > 0;
  const computedTotalEarnings = hasProRata
    ? Number(salaryEarnings.proRataSalary ?? 0) + Number(salaryEarnings.otherEarnings ?? 0) +
      Number(salaryEarnings.incentivesBonusPayable ?? 0) + Number(salaryEarnings.leaveEncashment ?? 0) +
      Number(financeReimbursement?.approvedUnpaidReimbursements ?? 0) + Number(salaryEarnings.arrears ?? 0)
    : Number(salaryEarnings.basicSalary ?? 0) + Number(salaryEarnings.hra ?? 0) +
      Number(salaryEarnings.conveyanceAllowance ?? 0) + Number(salaryEarnings.specialAllowance ?? 0) +
      Number(salaryEarnings.otherEarnings ?? 0) + Number(salaryEarnings.incentivesBonusPayable ?? 0) +
      Number(salaryEarnings.leaveEncashment ?? 0) + Number(financeReimbursement?.approvedUnpaidReimbursements ?? 0) +
      Number(salaryEarnings.arrears ?? 0);

  const computedTotalDeductions = Number(deductions.pfEmployeeContribution ?? 0) +
    Number(deductions.professionalTax ?? 0) + Number(deductions.incomeTaxTds ?? 0) +
    Number(deductions.loanRecovery ?? 0) + Number(deductions.advanceSalaryRecovery ?? 0) +
    Number(deductions.assetRecoveryCharges ?? 0) + Number(assetsClearance?.assetDamageCharges ?? 0) +
    Number(deductions.noticePayRecovery ?? 0) + Number(deductions.anyOtherDeduction ?? 0);

  const computedNetPayable = computedTotalEarnings - computedTotalDeductions;
  const computedNetRecoverable = computedNetPayable < 0 ? Math.abs(computedNetPayable) : 0;
  const computedFinalNetPayable = computedNetPayable > 0 ? computedNetPayable : 0;

  const totalEarnings = Number(value.totalEarnings) || computedTotalEarnings;
  const totalDeductions = Number(value.totalDeductions) || computedTotalDeductions;
  const netPayable = Number(value.netPayable) || computedFinalNetPayable;
  const netRecoverable = Number(value.netRecoverable) || computedNetRecoverable;
  const settlementType = (value.settlementType as string) || (computedNetPayable >= 0 ? "CREDIT" : "DEBIT");

  return (
    <SectionCard title="Final Settlement Calculation Summary">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <Label className="text-xs text-emerald-400">Total Earnings</Label>
          <p className="mt-1 text-2xl font-bold text-emerald-300">
            {formatCurrency(totalEarnings)}
          </p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <Label className="text-xs text-red-400">Total Deductions</Label>
          <p className="mt-1 text-2xl font-bold text-red-300">
            {formatCurrency(totalDeductions)}
          </p>
        </div>
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
          <Label className="text-xs text-cyan-400">Net Payable</Label>
          <p className="mt-1 text-2xl font-bold text-cyan-300">
            {formatCurrency(netPayable)}
          </p>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
          <Label className="text-xs text-orange-400">Net Recoverable</Label>
          <p className="mt-1 text-2xl font-bold text-orange-300">
            {formatCurrency(netRecoverable)}
          </p>
        </div>
        <SelectField label="Settlement Type" value={settlementType}
          onChange={(v) => onChange((p) => ({ ...p, settlementType: v }))}
          options={[{ value: "CREDIT", label: "Credit (Payable)" }, { value: "DEBIT", label: "Debit (Recoverable)" }]}
        />
        <SelectField
          label="Payment Mode"
          value={(value.paymentMode as string) || "Bank Transfer"}
          onChange={(v) => onChange((p) => ({ ...p, paymentMode: v }))}
          options={[
            { value: "Bank Transfer", label: "Bank Transfer" },
            { value: "Cheque", label: "Cheque" },
            { value: "Cash", label: "Cash" },
          ]}
        />
        <InputField label="Bank Name" type="text" value={value.bankName || ""}
          onChange={(v) => onChange((p) => ({ ...p, bankName: v }))} error={undefined} />
        <InputField label="Bank Account Number" type="text" value={value.bankAccountNumber || ""}
          onChange={(v) => onChange((p) => ({ ...p, bankAccountNumber: v }))} error={undefined} />
        <InputField label="Payment Reference ID" type="text" value={value.paymentReferenceId || ""}
          onChange={(v) => onChange((p) => ({ ...p, paymentReferenceId: v }))} error={undefined} />
        <InputField label="Settlement Release Date" type="date" value={value.settlementReleaseDate || ""}
          onChange={(v) => onChange((p) => ({ ...p, settlementReleaseDate: v }))} error={undefined} />
      </div>
    </SectionCard>
  );
}

export default SettlementSummaryTab;