import { z } from "zod";

const optionalDate = z.string().optional().or(z.literal(""));
const optionalNonNegativeNumber = z
  .union([z.number(), z.string(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null || v === "") return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  })
  .pipe(z.number().min(0, "Must be 0 or positive"));

export const employeeMasterSchema = z.object({
  employeeId: z.string().optional(),
  employeeFullName: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  location: z.string().optional(),
  dateOfJoining: z.string().optional(),
  dateOfExit: optionalDate,
  typeOfSeparation: z.enum(
    ["RESIGNATION", "TERMINATION", "ABSCONDING", "RETIREMENT", "MUTUAL_SEPARATION"],
    { errorMap: () => ({ message: "Select a separation type" }) },
  ).optional().or(z.literal("")),
  noticePeriodApplicable: z.boolean().optional(),
  noticePeriodDurationDays: z
    .union([z.number(), z.string(), z.undefined()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === null || v === "") return 0;
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    }),
  lastWorkingDay: optionalDate,
  reportingDesignation: z.string().optional(),
  hrSpoc: z.string().optional(),
});

export const separationSchema = z.object({
  resignationSubmissionDate: optionalDate,
  resignationAcceptanceDate: optionalDate,
  exitInterviewCompleted: z.boolean().optional(),
  reasonForExit: z.string().optional(),
  exitRemarks: z.string().optional(),
  exitType: z.enum(["VOLUNTARY", "INVOLUNTARY"], {
    errorMap: () => ({ message: "Select exit type" }),
  }).optional().or(z.literal("")),
  relievingStatus: z.enum(["RELIEVED", "NOT_RELIEVED"], {
    errorMap: () => ({ message: "Select relieving status" }),
  }).optional().or(z.literal("")),
  exitClearanceStatus: z.enum(["PENDING", "CLEARED", "NOT_CLEARED"], {
    errorMap: () => ({ message: "Select exit clearance status" }),
  }).optional().or(z.literal("")),
});

export const salaryEarningsSchema = z.object({
  basicSalary: optionalNonNegativeNumber,
  hra: optionalNonNegativeNumber,
  conveyanceAllowance: optionalNonNegativeNumber,
  specialAllowance: optionalNonNegativeNumber,
  otherEarnings: optionalNonNegativeNumber,
  incentivesBonusPayable: optionalNonNegativeNumber,
  leaveEncashment: optionalNonNegativeNumber,
  arrears: optionalNonNegativeNumber,
  noticePeriodRecovery: optionalNonNegativeNumber,
  proRataSalary: optionalNonNegativeNumber,
  finalGrossSalary: optionalNonNegativeNumber,
});

export const deductionsSchema = z.object({
  pfEmployeeContribution: optionalNonNegativeNumber,
  professionalTax: optionalNonNegativeNumber,
  incomeTaxTds: optionalNonNegativeNumber,
  loanRecovery: optionalNonNegativeNumber,
  advanceSalaryRecovery: optionalNonNegativeNumber,
  assetRecoveryCharges: optionalNonNegativeNumber,
  noticePayRecovery: optionalNonNegativeNumber,
  anyOtherDeduction: optionalNonNegativeNumber,
});

const assetItemSchema = z.object({
  name: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(["RETURNED", "NOT_APPLICABLE", "PENDING"]).optional().or(z.literal("")),
  damageCharges: optionalNonNegativeNumber,
});

export const assetsClearanceSchema = z.object({
  laptop: assetItemSchema.optional(),
  mobileSim: assetItemSchema.optional(),
  accessCard: assetItemSchema.optional(),
  idCard: assetItemSchema.optional(),
  documentsFiles: assetItemSchema.optional(),
  softwareLicensesStatus: assetItemSchema.optional(),
  systemCredentials: assetItemSchema.optional(),
  emailAccessDisabled: z.boolean().optional(),
  emailAccessDisabledDate: optionalDate,
  systemAccessDisabled: z.boolean().optional(),
  systemAccessDisabledDate: optionalDate,
  softwareLicensesAssigned: z.array(z.string()).optional(),
  assetRecoveryStatus: z.enum(["PENDING", "CLEARED", "NOT_CLEARED"], {
    errorMap: () => ({ message: "Select asset recovery status" }),
  }).optional().or(z.literal("")),
  assetDamageCharges: optionalNonNegativeNumber,
});

export const reimbursementSchema = z.object({
  pendingExpenseClaims: optionalNonNegativeNumber,
  approvedUnpaidReimbursements: optionalNonNegativeNumber,
  travelClaims: optionalNonNegativeNumber,
  medicalClaims: optionalNonNegativeNumber,
  pendingVendorSettlements: optionalNonNegativeNumber,
});

export const statutoryComplianceSchema = z.object({
  pfUanNumber: z.string().optional(),
  pfTransferWithdrawalStatus: z.string().optional(),
  esicNumber: z.string().optional(),
  gratuityEligible: z.boolean().optional(),
  gratuityAmount: optionalNonNegativeNumber,
  form16IssuanceStatus: z.string().optional(),
  finalTaxComputationStatus: z.string().optional(),
});

export const settlementSummarySchema = z.object({
  totalEarnings: optionalNonNegativeNumber,
  totalDeductions: optionalNonNegativeNumber,
  netPayable: optionalNonNegativeNumber,
  netRecoverable: optionalNonNegativeNumber,
  settlementType: z.enum(["CREDIT", "DEBIT"], {
    errorMap: () => ({ message: "Select settlement type" }),
  }).optional().or(z.literal("")),
  paymentMode: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  paymentReferenceId: z.string().optional(),
  settlementReleaseDate: optionalDate,
});

export const acknowledgementSchema = z.object({
  statementShared: z.boolean().optional(),
  sharedDate: optionalDate,
  acceptance: z.enum(["PENDING", "ACCEPTED", "DISPUTED"], {
    errorMap: () => ({ message: "Select acceptance status" }),
  }).optional().or(z.literal("")),
  disputeRemarks: z.string().optional(),
  digitalSignatureStatus: z.string().optional(),
  closureConfirmationDate: optionalDate,
});

export type EmployeeMasterValues = z.infer<typeof employeeMasterSchema>;
export type SeparationValues = z.infer<typeof separationSchema>;
export type SalaryEarningsValues = z.infer<typeof salaryEarningsSchema>;
export type DeductionsValues = z.infer<typeof deductionsSchema>;
export type AssetsClearanceValues = z.infer<typeof assetsClearanceSchema>;
export type ReimbursementValues = z.infer<typeof reimbursementSchema>;
export type StatutoryComplianceValues = z.infer<typeof statutoryComplianceSchema>;
export type SettlementSummaryValues = z.infer<typeof settlementSummarySchema>;
export type AcknowledgementValues = z.infer<typeof acknowledgementSchema>;
