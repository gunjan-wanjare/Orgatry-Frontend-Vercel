import { SectionCard } from "@/components/shared/SectionCard";
import { formatDate } from "@/utils/timeUtils";
import { Field, InputField, SelectField, SwitchField, type SectionTabProps } from "./fields";

const EmployeeMasterTab = ({ value, onChange }: SectionTabProps) => {
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
        <SwitchField label="Notice Period Applicable" checked={Boolean(value.noticePeriodApplicable)}
          onChange={(v) => onChange((p) => ({ ...p, noticePeriodApplicable: v }))}
        />
        <Field label="Notice Period Duration (Days)" value={value.noticePeriodDurationDays} />

        <InputField label="Date of Exit" type="date" value={value.dateOfExit}
          onChange={(v) => onChange((p) => ({ ...p, dateOfExit: v }))}
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
        />
        
        <InputField label="Last Working Day" type="date" value={value.lastWorkingDay}
          onChange={(v) => onChange((p) => ({ ...p, lastWorkingDay: v }))}
        />
        <Field label="HR SPOC" value={value.hrSpoc || "-"} />
      </div>
    </SectionCard>
  );
}

export default EmployeeMasterTab;