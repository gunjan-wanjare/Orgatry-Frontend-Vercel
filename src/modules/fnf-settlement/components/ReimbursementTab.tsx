import { SectionCard } from "@/components/shared/SectionCard";
import { CurrencyField, type SectionTabProps } from "./fields";

const ReimbursementTab = ({ value, onChange }: SectionTabProps) => {
  return (
    <SectionCard title="Finance & Reimbursement Claims">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CurrencyField label="Pending Expense Claims" value={value.pendingExpenseClaims}
          onChange={(v) => onChange((p) => ({ ...p, pendingExpenseClaims: v }))}
        />
        <CurrencyField label="Approved but Unpaid Reimbursements" value={value.approvedUnpaidReimbursements}
          onChange={(v) => onChange((p) => ({ ...p, approvedUnpaidReimbursements: v }))}
        />
        <CurrencyField label="Travel Claims" value={value.travelClaims}
          onChange={(v) => onChange((p) => ({ ...p, travelClaims: v }))}
        />
        <CurrencyField label="Medical Claims" value={value.medicalClaims}
          onChange={(v) => onChange((p) => ({ ...p, medicalClaims: v }))}
        />
        <CurrencyField label="Pending Vendor Settlements" value={value.pendingVendorSettlements}
          onChange={(v) => onChange((p) => ({ ...p, pendingVendorSettlements: v }))}
        />
      </div>
    </SectionCard>
  );
}

export default ReimbursementTab;