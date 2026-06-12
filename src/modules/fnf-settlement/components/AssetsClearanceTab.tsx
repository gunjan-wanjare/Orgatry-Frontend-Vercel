import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/SectionCard";
import { Field, SelectField, CurrencyField, type SectionTabProps } from "./fields";
import { formatDateTimeInTimezone } from "@/utils/timeUtils";

const AssetsClearanceTab = ({ value, onChange }: SectionTabProps) => {
  const assets = value as Record<string, unknown>;

  const computedDamageCharges =
    Number((assets.laptop as Record<string, unknown>)?.damageCharges ?? 0) +
    Number((assets.mobileSim as Record<string, unknown>)?.damageCharges ?? 0) +
    Number((assets.accessCard as Record<string, unknown>)?.damageCharges ?? 0) +
    Number((assets.idCard as Record<string, unknown>)?.damageCharges ?? 0) +
    Number((assets.documentsFiles as Record<string, unknown>)?.damageCharges ?? 0) +
    Number((assets.softwareLicensesStatus as Record<string, unknown>)?.damageCharges ?? 0) +
    Number((assets.systemCredentials as Record<string, unknown>)?.damageCharges ?? 0);

  return (
    <SectionCard title="Company Assets Clearance">
      <div className="space-y-6">
        {(["laptop", "mobileSim", "accessCard", "idCard", "documentsFiles", "softwareLicensesStatus", "systemCredentials"] as const).map((key) => {
          const asset = (assets[key] as Record<string, unknown> | undefined) || { name: "", serialNumber: "", status: "NOT_APPLICABLE", damageCharges: 0 };
          return (
            <div key={key} className="rounded-lg border border-border bg-white/[0.03] p-4">
              <h4 className="mb-3 text-sm font-medium capitalize text-cyan-200">
                {key === "mobileSim"
                  ? "Mobile / SIM"
                  : key === "accessCard"
                    ? "Access Card"
                    : key === "idCard"
                      ? "ID Card"
                      : key === "laptop"
                        ? "Laptop/Desktop"
                        : key === "documentsFiles"
                          ? "Documents / Files"
                          : key === "softwareLicensesStatus"
                            ? "Software Licenses"
                            : "System Credentials"}
              </h4>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Name" value={asset.name || "-"} />
                <SelectField
                  label="Status"
                  value={asset.status as string || "NOT_APPLICABLE"}
                  onChange={(v) => {
                    const updated = { ...assets, [key]: { ...asset, status: v } };
                    onChange(updated);
                  }}
                  options={
                    key === "softwareLicensesStatus"
                      ? [
                          { value: "DEACTIVATED", label: "Deactivated" },
                          { value: "NOT_APPLICABLE", label: "Not Applicable" },
                          { value: "PENDING", label: "Pending" },
                        ]
                      : key === "systemCredentials"
                        ? [
                            { value: "REVOKED", label: "Revoked" },
                            { value: "NOT_APPLICABLE", label: "Not Applicable" },
                            { value: "PENDING", label: "Pending" },
                          ]
                        : [
                            { value: "RETURNED", label: "Returned" },
                            { value: "NOT_APPLICABLE", label: "Not Applicable" },
                            { value: "PENDING", label: "Pending" },
                          ]
                  }
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
          <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.03] px-4 py-3">
            <div className="space-y-0.5">
              <Label className="text-xs text-muted-foreground">Email Access Disabled</Label>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${assets.emailAccessDisabled ? "text-emerald-400" : "text-rose-400"}`}>
                {assets.emailAccessDisabled ? "Yes" : "No"}
              </span>
              <Switch
                id="email-access-disabled-switch"
                checked={Boolean(assets.emailAccessDisabled)}
                onCheckedChange={(v) => onChange((p) => ({ ...p, emailAccessDisabled: v }))}
              />
            </div>
          </div>
          <Field label="Email Disabled Date" value={formatDateTimeInTimezone(assets.emailAccessDisabledDate)} />
          <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.03] px-4 py-3">
            <div className="space-y-0.5">
              <Label className="text-xs text-muted-foreground">System Access Disabled</Label>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${assets.systemAccessDisabled ? "text-emerald-400" : "text-rose-400"}`}>
                {assets.systemAccessDisabled ? "Yes" : "No"}
              </span>
              <Switch
                id="system-access-disabled-switch"
                checked={Boolean(assets.systemAccessDisabled)}
                onCheckedChange={(v) => onChange((p) => ({ ...p, systemAccessDisabled: v }))}
              />
            </div>
          </div>
          <Field label="System Disabled Date" value={formatDateTimeInTimezone(assets.systemAccessDisabledDate)} />
          <div className="md:col-span-2">
            <Field label="Software Licenses Assigned" value={(Array.isArray(assets.softwareLicensesAssigned) && assets.softwareLicensesAssigned?.length > 0) ? (assets.softwareLicensesAssigned as {licenseName: string}[]).map(e => e.licenseName).join(", ") : "-"} />
          </div>
          <SelectField label="Asset Recovery Status" value={assets.assetRecoveryStatus as string}
            onChange={(v) => onChange((p) => ({ ...p, assetRecoveryStatus: v }))}
            options={[{ value: "PENDING", label: "Pending" }, { value: "CLEARED", label: "Cleared" }]}
          />
          <CurrencyField label="Total Asset Damage Charges" value={assets.assetDamageCharges ?? computedDamageCharges}
            onChange={(v) => onChange((p) => ({ ...p, assetDamageCharges: v }))}
          />
        </div>
      </div>
    </SectionCard>
  );
}

export default AssetsClearanceTab;
