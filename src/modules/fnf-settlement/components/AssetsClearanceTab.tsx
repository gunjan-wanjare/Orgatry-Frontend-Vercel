import { SectionCard } from "@/components/shared/SectionCard";
import { Field, SelectField, SwitchField, CurrencyField, type SectionTabProps } from "./fields";

const AssetsClearanceTab = ({ value, onChange }: SectionTabProps) => {
  const assets = value as Record<string, unknown>;

  return (
    <SectionCard title="Company Assets Clearance">
      <div className="space-y-6">
        {(["laptop", "mobileSim", "accessCard", "idCard"] as const).map((key) => {
          const asset = assets[key] as Record<string, unknown> | undefined;
          if (!asset) return null;
          return (
            <div key={key} className="rounded-lg border border-border bg-white/[0.03] p-4">
              <h4 className="mb-3 text-sm font-medium capitalize text-cyan-200">
                {key === "mobileSim" ? "Mobile / SIM" : key === "accessCard" ? "Access Card" : key === "idCard" ? "ID Card" : "Laptop"}
              </h4>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Name" value={asset.name} />
                <Field label="Serial Number" value={asset.serialNumber} />
                <SelectField
                  label="Status"
                  value={asset.status as string}
                  onChange={(v) => {
                    const updated = { ...assets, [key]: { ...asset, status: v } };
                    onChange(updated);
                  }}
                  options={[
                    { value: "RETURNED", label: "Returned" },
                    { value: "NOT_APPLICABLE", label: "Not Applicable" },
                    { value: "PENDING", label: "Pending" },
                  ]}
                />
                <CurrencyField label="Damage Charges" value={asset.damageCharges}
                  onChange={(v) => {
                    const updated = { ...assets, [key]: { ...asset, damageCharges: v } };
                    onChange(updated);
                  }}
                />
              </div>
            </div>
          );
        })}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SwitchField label="Email Access Disabled" checked={Boolean(assets.emailAccessDisabled)}
            onChange={(v) => onChange((p) => ({ ...p, emailAccessDisabled: v }))}
          />
          <Field label="Email Disabled Date" value={assets.emailAccessDisabledDate} />
          <SwitchField label="System Access Disabled" checked={Boolean(assets.systemAccessDisabled)}
            onChange={(v) => onChange((p) => ({ ...p, systemAccessDisabled: v }))}
          />
          <Field label="System Disabled Date" value={assets.systemAccessDisabledDate} />
          <div className="md:col-span-2">
            <Field label="Software Licenses Assigned" value={Array.isArray(assets.softwareLicensesAssigned) ? (assets.softwareLicensesAssigned as string[]).join(", ") : ""} />
          </div>
          <SelectField label="Asset Recovery Status" value={assets.assetRecoveryStatus as string}
            onChange={(v) => onChange((p) => ({ ...p, assetRecoveryStatus: v }))}
            options={[{ value: "PENDING", label: "Pending" }, { value: "CLEARED", label: "Cleared" }, { value: "NOT_CLEARED", label: "Not Cleared" }]}
          />
          <CurrencyField label="Total Asset Damage Charges" value={assets.assetDamageCharges}
            onChange={(v) => onChange((p) => ({ ...p, assetDamageCharges: v }))}
          />
        </div>
      </div>
    </SectionCard>
  );
}

export default AssetsClearanceTab;