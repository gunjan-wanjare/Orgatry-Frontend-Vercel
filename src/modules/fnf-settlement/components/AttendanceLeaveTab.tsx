import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/services/api/http-client";
import { endpoints } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import { SectionCard } from "@/components/shared/SectionCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NumericField, type SectionTabProps } from "./fields";

type LeaveType = {
  id: string;
  name: string;
  code: string;
  annualQuota: number;
  isPaid: boolean;
  isActive: boolean;
  deletedAt?: string;
};

const AttendanceLeaveTab = ({ value, onChange }: SectionTabProps) => {
  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["settings-leave-types"],
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<{ leaveTypes: LeaveType[] }>>(endpoints.settings);
      return res.data.data?.leaveTypes?.filter((lt) => lt.isActive && !lt.deletedAt) ?? [];
    },
    staleTime: 30_000,
  });

  const leaveBalances = (value.leaveBalances as Record<string, number>) ?? {};
console.log('leaveBalances = ', leaveBalances)
  return (
    <SectionCard title="Attendance & Leave Settlement">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NumericField
          label="Total Working Days (Final Month)"
          value={value.totalWorkingDaysFinalMonth}
          onChange={(v) => onChange((p) => ({ ...p, totalWorkingDaysFinalMonth: v }))}
          error={undefined}
        />
        <NumericField
          label="Present Days"
          value={value.presentDays}
          onChange={(v) => onChange((p) => ({ ...p, presentDays: v }))}
          error={undefined}
        />
        <NumericField
          label="Absent Days"
          value={value.absentDays}
          onChange={(v) => onChange((p) => ({ ...p, absentDays: v }))}
          error={undefined}
        />
        {leaveTypes.map((type) => (
          <NumericField
            key={type.id}
            label={`${type.name} Balance`}
            value={leaveBalances[type.code] ?? 0}
            onChange={(v) => onChange((p) => ({
              ...p,
              leaveBalances: {
                ...(p.leaveBalances as Record<string, number> ?? {}),
                [type.code]: v,
              },
            }))}
            error={undefined}
          />
        ))}
        <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.03] px-4 py-3">
          <div className="space-y-0.5">
            <Label className="text-xs text-muted-foreground">Leave Encashment Eligible</Label>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${value.leaveEncashmentEligible ? "text-emerald-400" : "text-rose-400"}`}>
              {value.leaveEncashmentEligible ? "Yes" : "No"}
            </span>
            <Switch
              id="leave-encashment-eligible-switch"
              checked={Boolean(value.leaveEncashmentEligible)}
              onCheckedChange={(v) => onChange((p) => ({ ...p, leaveEncashmentEligible: v }))}
            />
          </div>
        </div>
        <NumericField
          label="Leave Encashment Days"
          value={value.leaveEncashmentDays}
          onChange={(v) => onChange((p) => ({ ...p, leaveEncashmentDays: v }))}
          error={undefined}
        />
        <NumericField
          label="Unpaid Leave Days"
          value={value.unpaidLeaveDays}
          onChange={(v) => onChange((p) => ({ ...p, unpaidLeaveDays: v }))}
          error={undefined}
        />
        <NumericField
          label="LOP Days"
          value={value.lopDays}
          onChange={(v) => onChange((p) => ({ ...p, lopDays: v }))}
          error={undefined}
        />
        <NumericField
          label="Holiday Pay Adjustment"
          value={value.holidayPayAdjustment}
          onChange={(v) => onChange((p) => ({ ...p, holidayPayAdjustment: v }))}
          error={undefined}
        />
      </div>
    </SectionCard>
  );
}

export default AttendanceLeaveTab;