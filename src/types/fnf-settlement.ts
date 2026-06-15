export type SeparationType = 'RESIGNATION' | 'TERMINATION' | 'ABSCONDING' | 'RETIREMENT' | 'MUTUAL_SEPARATION';
export type ExitType = 'VOLUNTARY' | 'INVOLUNTARY';
export type RelievingStatus = 'RELIEVED' | 'NOT_RELIEVED';
export type SettlementType = 'CREDIT' | 'DEBIT';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ClearanceStatus = 'PENDING' | 'CLEARED' | 'NOT_CLEARED';
export type AssetReturnStatus = 'RETURNED' | 'NOT_APPLICABLE' | 'PENDING';
export type FnFStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DISPUTED' | 'CLOSED';
export type EmployeeAcceptance = 'ACCEPTED' | 'DISPUTED' | 'PENDING';

export type FnFSettlement = {
  id: string;
  caseId: string;
  employeeId: string;
  status: FnFStatus;
  createdAt: string;
  updatedAt: string;
  employee?: {
    employeeId: string;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
    location: string;
    doj: string;
    doe: string;
  };
};

export type FnFSettlementDetail = {
  id: string;
  caseId: string;
  status: FnFStatus;

  employeeMaster: EmployeeMasterDetails;
  separation: SeparationDetails;
  attendanceLeave: AttendanceLeaveSettlement;
  salaryEarnings: SalaryEarnings;
  deductions: Deductions;
  assetsClearance: AssetsClearance;
  financeReimbursement: FinanceReimbursement;
  statutoryCompliance: StatutoryCompliance;
  finalSettlement: FinalSettlementSummary;
  approvals: ApprovalsWorkflow;
  employeeAcknowledgement: EmployeeAcknowledgement;
  auditLogs: AuditLogInfo;

  settlementLetter?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type EmployeeMasterDetails = {
  employeeId: string;
  employeeFullName: string;
  department: string;
  designation: string;
  location: string;
  dateOfJoining: string;
  dateOfExit: string;
  typeOfSeparation: SeparationType;
  noticePeriodApplicable: boolean;
  noticePeriodDurationDays: number;
  lastWorkingDay: string;
  reportingDesignation: string;
  hrSpoc: string;
};

export type SeparationDetails = {
  resignationSubmissionDate: string;
  resignationAcceptanceDate: string;
  exitInterviewCompleted: boolean;
  reasonForExit: string;
  exitRemarks: string;
  exitType: ExitType;
  relievingStatus: RelievingStatus;
  exitClearanceStatus: ClearanceStatus;
};

export type AttendanceLeaveSettlement = {
  totalWorkingDaysFinalMonth: number;
  presentDays: number;
  absentDays: number;
  leaveBalances: Record<string, number>;
  leaveEncashmentEligible: boolean;
  leaveEncashmentDays: number;
  unpaidLeaveDays: number;
  lopDays: number;
  holidayPayAdjustment: number;
};

export type SalaryEarnings = {
  basicSalary: number;
  hra: number;
  conveyanceAllowance: number;
  specialAllowance: number;
  otherEarnings: number;
  incentivesBonusPayable: number;
  leaveEncashment: number;
  arrears: number;
  noticePeriodRecovery: number;
  finalGrossSalary: number;
  proRataSalary: number;
};

export type Deductions = {
  pfEmployeeContribution: number;
  professionalTax: number;
  incomeTaxTds: number;
  loanRecovery: number;
  advanceSalaryRecovery: number;
  assetRecoveryCharges: number;
  noticePayRecovery: number;
  anyOtherDeduction: number;
};

export type AssetItem = {
  name: string;
  serialNumber: string;
  status: AssetReturnStatus;
  damageCharges: number;
};

export type AssetsClearance = {
  laptop: AssetItem;
  mobileSim: AssetItem;
  accessCard: AssetItem;
  idCard: AssetItem;
  documentsFiles: AssetItem;
  softwareLicensesStatus: AssetItem;
  systemCredentials: AssetItem;
  emailAccessDisabled: boolean;
  emailAccessDisabledDate: string;
  systemAccessDisabled: boolean;
  systemAccessDisabledDate: string;
  softwareLicensesAssigned: { id: string; licenseName: string; licenseKey: string }[];
  assetRecoveryStatus: ClearanceStatus;
  assetDamageCharges: number;
};

export type FinanceReimbursement = {
  pendingExpenseClaims: number;
  approvedUnpaidReimbursements: number;
  travelClaims: number;
  medicalClaims: number;
  pendingVendorSettlements: number;
};

export type StatutoryCompliance = {
  pfUanNumber: string;
  pfTransferWithdrawalStatus: string;
  esicNumber: string;
  gratuityEligible: boolean;
  gratuityAmount: number;
  form16IssuanceStatus: string;
  finalTaxComputationStatus: string;
};

export type FinalSettlementSummary = {
  totalEarnings: number;
  totalDeductions: number;
  netPayable: number;
  netRecoverable: number;
  settlementType: SettlementType;
  paymentMode: string;
  bankAccountNumber: string;
  bankName: string;
  paymentReferenceId: string;
  settlementReleaseDate: string;
};

export type ApprovalEntry = {
  role: string;
  status: ApprovalStatus;
  approvedBy: string;
  approvedAt: string;
  remarks: string;
};

export type ApprovalsWorkflow = {
  reportingManager: ApprovalEntry;
  hr: ApprovalEntry;
  finance: ApprovalEntry;
  adminClearance: ApprovalEntry;
  finalAuthorization: ApprovalEntry;
  timestampLogs: string;
};

export type EmployeeAcknowledgement = {
  statementShared: boolean;
  sharedDate: string;
  acceptance: EmployeeAcceptance;
  disputeRemarks: string;
  digitalSignatureStatus: string;
  closureConfirmationDate: string;
};

export type AuditLogInfo = {
  caseId: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
  versionHistory: string;
  auditTrailNotes: string;
};
