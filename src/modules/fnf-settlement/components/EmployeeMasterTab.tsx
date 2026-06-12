import { SectionCard } from "@/components/shared/SectionCard";
import { formatDate } from "@/utils/timeUtils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Field, InputField, SelectField, type SectionTabProps } from "./fields";

const EmployeeMasterTab = ({ value, onChange, errors }: SectionTabProps) => {
  return (
    <SectionCard title="Employee Master Details" description="Auto-pulled from HRMS employee database">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Employee ID" value={value.employeeId} />
        <Field label="Full Name" value={value.employeeFullName} />
        <Field label="Department" value={value.department} />
        <Field label="Designation" value={value.designation} />
        <Field label="Location / Branch" value={value.location} />
        <Field label="Date of Joining" value={formatDate(value.dateOfJoining)} />
        <Field label="Reporting Designation" value={value.reportingDesignation} />
        <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.03] px-4 py-3">
          <div className="space-y-0.5">
            <Label className="text-xs text-muted-foreground">Notice Period Applicable</Label>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${value.noticePeriodApplicable ? "text-emerald-400" : "text-rose-400"}`}>
              {value.noticePeriodApplicable ? "Yes" : "No"}
            </span>
            <Switch
              id="notice-period-applicable-switch"
              checked={Boolean(value.noticePeriodApplicable)}
              onCheckedChange={(v) => onChange((p) => ({ ...p, noticePeriodApplicable: v }))}
            />
          </div>
        </div>
        <Field label="Notice Period Duration (Days)" value={value.noticePeriodDurationDays} />

        <InputField label="Date of Exit" type="date" value={value.dateOfExit}
          onChange={(v) => onChange((p) => ({ ...p, dateOfExit: v }))}
          error={errors?.dateOfExit}
        />
        <SelectField label="Type of Separation" value={value.typeOfSeparation as string}
          onChange={(v) => onChange((p) => ({ ...p, typeOfSeparation: v }))}
          options={[
            { value: "RESIGNATION", label: "Resignation" },
            { value: "TERMINATION", label: "Termination" },
            { value: "ABSCONDING", label: "Absconding" },
            { value: "RETIREMENT", label: "Retirement" },
            { value: "MUTUAL_SEPARATION", label: "Mutual Separation" },
          ]}
          error={errors?.typeOfSeparation}
        />
        
        <InputField label="Last Working Day" type="date" value={value.lastWorkingDay}
          onChange={(v) => onChange((p) => ({ ...p, lastWorkingDay: v }))}
          error={errors?.lastWorkingDay}
        />
        <Field label="HR SPOC" value={value.hrSpoc || "-"} />
      </div>
    </SectionCard>
  );
}

export default EmployeeMasterTab;