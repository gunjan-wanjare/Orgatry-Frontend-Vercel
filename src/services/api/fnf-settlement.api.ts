import { endpoints } from './endpoints';
import { resourceApi } from './resource.api';
import { httpClient } from './http-client';
import type { ApiResponse } from '@/types/api';
import type {
  FnFSettlement,
  FnFSettlementDetail,
  EmployeeMasterDetails,
  SeparationDetails,
  AttendanceLeaveSettlement,
  SalaryEarnings,
  Deductions,
  AssetsClearance,
  FinanceReimbursement,
  StatutoryCompliance,
  FinalSettlementSummary,
  ApprovalsWorkflow,
} from '@/types/fnf-settlement';

export const fnfSettlementApi = {
  list(params?: Record<string, string | number | boolean | undefined>) {
    return resourceApi.list<FnFSettlement>(endpoints.fnf.list, params as never);
  },

  async get(id: string) {
    const response = await httpClient.get<ApiResponse<FnFSettlementDetail>>(endpoints.fnf.detail(id));
    return response.data.data;
  },

  create(payload: { employeeId: string }) {
    return resourceApi.create<{ employeeId: string }, FnFSettlementDetail>(endpoints.fnf.create, payload);
  },

  async update(id: string, payload: Partial<FnFSettlementDetail>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(endpoints.fnf.update(id), payload);
    return response.data.data;
  },

  async remove(id: string) {
    await httpClient.delete(endpoints.fnf.delete(id));
  },

  async submit(id: string) {
    const response = await httpClient.post<ApiResponse<FnFSettlementDetail>>(endpoints.fnf.submit(id));
    return response.data.data;
  },

  async approve(id: string, payload: { remarks?: string; step?: string }) {
    const response = await httpClient.post<ApiResponse<FnFSettlementDetail>>(endpoints.fnf.approve(id), payload);
    return response.data.data;
  },

  async reject(id: string, payload: { remarks: string; step?: string }) {
    const response = await httpClient.post<ApiResponse<FnFSettlementDetail>>(endpoints.fnf.reject(id), payload);
    return response.data.data;
  },

  async getLetter(id: string) {
    const response = await httpClient.get<ApiResponse<{ letterHtml: string }>>(endpoints.fnf.letter(id));
    return response.data.data.letterHtml;
  },

  async getLetterPdf(id: string) {
    const response = await httpClient.get<Blob>(endpoints.fnf.letterPdf(id), {
      responseType: 'blob',
      timeout: 120_000,
    });
    return response.data;
  },

  async getEmployeeData(employeeId: string) {
    const response = await httpClient.get<ApiResponse<{
      employeeMaster: EmployeeMasterDetails;
      separation: SeparationDetails;
      attendanceLeave: AttendanceLeaveSettlement;
    }>>(endpoints.fnf.employeeData(employeeId));
    return response.data.data;
  },

  async acknowledge(id: string, payload: { acceptance: string; disputeRemarks?: string; digitalSignatureStatus?: string }) {
    const response = await httpClient.post<ApiResponse<FnFSettlementDetail>>(endpoints.fnf.acknowledge(id), payload);
    return response.data.data;
  },

  async updateEmployeeMaster(id: string, payload: Partial<EmployeeMasterDetails>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { employeeMaster: payload },
    );
    return response.data.data;
  },

  async updateSeparation(id: string, payload: Partial<SeparationDetails>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { separation: payload },
    );
    return response.data.data;
  },

  async updateAttendanceLeave(id: string, payload: Partial<AttendanceLeaveSettlement>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { attendanceLeave: payload },
    );
    return response.data.data;
  },

  async updateSalaryEarnings(id: string, payload: Partial<SalaryEarnings>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { salaryEarnings: payload },
    );
    return response.data.data;
  },

  async updateDeductions(id: string, payload: Partial<Deductions>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { deductions: payload },
    );
    return response.data.data;
  },

  async updateAssetsClearance(id: string, payload: Partial<AssetsClearance>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { assetsClearance: payload },
    );
    return response.data.data;
  },

  async updateFinanceReimbursement(id: string, payload: Partial<FinanceReimbursement>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { financeReimbursement: payload },
    );
    return response.data.data;
  },

  async updateStatutoryCompliance(id: string, payload: Partial<StatutoryCompliance>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { statutoryCompliance: payload },
    );
    return response.data.data;
  },

  async updateFinalSettlement(id: string, payload: Partial<FinalSettlementSummary>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { finalSettlement: payload },
    );
    return response.data.data;
  },

  async updateApprovals(id: string, payload: Partial<ApprovalsWorkflow>) {
    const response = await httpClient.patch<ApiResponse<FnFSettlementDetail>>(
      endpoints.fnf.update(id), { approvals: payload },
    );
    return response.data.data;
  },
};

export const fnfKeys = {
  all: ['fnf-settlements'] as const,
  list: (params?: Record<string, unknown>) => ['fnf-settlements', 'list', params] as const,
  detail: (id: string) => ['fnf-settlements', 'detail', id] as const,
};
