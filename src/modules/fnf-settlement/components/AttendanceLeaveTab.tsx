import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/services/api/http-client";
import { endpoints } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import { SectionCard } from "@/components/shared/SectionCard";
import { Field, SwitchField, type SectionTabProps } from "./fields";

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
        <Field label="Total Working Days (Final Month)" value={value.totalWorkingDaysFinalMonth} />
        <Field label="Present Days" value={value.presentDays} />
        <Field label="Absent Days" value={value.absentDays} />
        {leaveTypes.map((type) => (
          <Field
            key={type.id}
            label={`${type.name} Balance`}
            value={leaveBalances[type.code] ?? 0}
          />
        ))}
        <SwitchField label="Leave Encashment Eligible" checked={Boolean(value.leaveEncashmentEligible)}
          onChange={() => onChange((p) => ({ ...p, leaveEncashmentEligible: p.leaveEncashmentEligible }))}
        />
        <Field label="Leave Encashment Days" value={value.leaveEncashmentDays} />
        <Field label="Unpaid Leave Days" value={value.unpaidLeaveDays} />
        <Field label="LOP Days" value={value.lopDays} />
        <Field label="Holiday Pay Adjustment" value={value.holidayPayAdjustment} />
      </div>
    </SectionCard>
  );
}

export default AttendanceLeaveTab;