import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/SectionCard";
import { Field, SelectField, formatCurrency, type SectionTabProps } from "./fields";

type SettlementSummaryTabProps = SectionTabProps & {
  salaryEarnings: Record<string, unknown>;
};

const SettlementSummaryTab = ({ value, onChange, salaryEarnings }: SettlementSummaryTabProps) => {
  return (
    <SectionCard title="Final Settlement Calculation Summary">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <Label className="text-xs text-emerald-400">Total Earnings</Label>
          <p className="mt-1 text-2xl font-bold text-emerald-300">
            {formatCurrency(value.totalEarnings ?? Number(salaryEarnings.finalGrossSalary ?? 0))}
          </p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <Label className="text-xs text-red-400">Total Deductions</Label>
          <p className="mt-1 text-2xl font-bold text-red-300">
            {formatCurrency(value.totalDeductions ?? 0)}
          </p>
        </div>
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
          <Label className="text-xs text-cyan-400">Net Payable</Label>
          <p className="mt-1 text-2xl font-bold text-cyan-300">
            {formatCurrency(value.netPayable ?? 0)}
          </p>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
          <Label className="text-xs text-orange-400">Net Recoverable</Label>
          <p className="mt-1 text-2xl font-bold text-orange-300">
            {formatCurrency(value.netRecoverable ?? 0)}
          </p>
        </div>
        <SelectField label="Settlement Type" value={value.settlementType as string}
          onChange={(v) => onChange((p) => ({ ...p, settlementType: v }))}
          options={[{ value: "CREDIT", label: "Credit (Payable)" }, { value: "DEBIT", label: "Debit (Recoverable)" }]}
        />
        <Field label="Payment Mode" value={value.paymentMode} />
        <Field label="Bank Name" value={value.bankName} />
        <Field label="Bank Account Number" value={value.bankAccountNumber} />
        <Field label="Payment Reference ID" value={value.paymentReferenceId} />
        <Field label="Settlement Release Date" value={value.settlementReleaseDate} />
      </div>
    </SectionCard>
  );
}

export default SettlementSummaryTab;