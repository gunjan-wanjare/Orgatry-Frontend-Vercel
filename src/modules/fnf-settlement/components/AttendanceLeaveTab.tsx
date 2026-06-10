import { SectionCard } from "@/components/shared/SectionCard";
import { NumericField, SwitchField, type SectionTabProps } from "./fields";

const AttendanceLeaveTab = ({ value, onChange }: SectionTabProps) => {
  return (
    <SectionCard title="Attendance & Leave Settlement">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NumericField label="Total Working Days (Final Month)" value={value.totalWorkingDaysFinalMonth}
          onChange={(v) => onChange((p) => ({ ...p, totalWorkingDaysFinalMonth: v }))}
        />
        <NumericField label="Present Days" value={value.presentDays}
          onChange={(v) => onChange((p) => ({ ...p, presentDays: v }))}
        />
        <NumericField label="Absent Days" value={value.absentDays}
          onChange={(v) => onChange((p) => ({ ...p, absentDays: v }))}
        />
        <NumericField label="EL Balance" value={value.leaveBalanceEl}
          onChange={(v) => onChange((p) => ({ ...p, leaveBalanceEl: v }))}
        />
        <NumericField label="CL Balance" value={value.leaveBalanceCl}
          onChange={(v) => onChange((p) => ({ ...p, leaveBalanceCl: v }))}
        />
        <NumericField label="SL Balance" value={value.leaveBalanceSl}
          onChange={(v) => onChange((p) => ({ ...p, leaveBalanceSl: v }))}
        />
        <SwitchField label="Leave Encashment Eligible" checked={Boolean(value.leaveEncashmentEligible)}
          onChange={(v) => onChange((p) => ({ ...p, leaveEncashmentEligible: v }))}
        />
        <NumericField label="Leave Encashment Days" value={value.leaveEncashmentDays}
          onChange={(v) => onChange((p) => ({ ...p, leaveEncashmentDays: v }))}
        />
        <NumericField label="Unpaid Leave Days" value={value.unpaidLeaveDays}
          onChange={(v) => onChange((p) => ({ ...p, unpaidLeaveDays: v }))}
        />
        <NumericField label="LOP Days" value={value.lopDays}
          onChange={(v) => onChange((p) => ({ ...p, lopDays: v }))}
        />
        <NumericField label="Holiday Pay Adjustment" value={value.holidayPayAdjustment}
          onChange={(v) => onChange((p) => ({ ...p, holidayPayAdjustment: v }))}
        />
      </div>
    </SectionCard>
  );
}

export default AttendanceLeaveTab;