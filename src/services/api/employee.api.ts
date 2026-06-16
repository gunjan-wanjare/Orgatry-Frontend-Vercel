import { endpoints } from './endpoints';
import { resourceApi } from './resource.api';
import { httpClient } from './http-client';
import type { ApiResponse } from '@/types/api';
import type { EmployeeFormValues } from '@/schemas/employee.schemas';
import type { EmployeeLicense } from '@/types/domain';

export const employeeApi = {
  create(payload: EmployeeFormValues) {
    return resourceApi.create<EmployeeFormValues, unknown>(endpoints.employees, payload);
  },

  update(id: string, payload: EmployeeFormValues) {
    return resourceApi.update<EmployeeFormValues, unknown>(endpoints.employees, id, payload);
  },

  remove(id: string) {
    return resourceApi.remove(endpoints.employees, id);
  },

  async getProfile(id: string) {
    const response = await httpClient.get<ApiResponse<Record<string, unknown>>>(endpoints.employeeProfile(id));
    return response.data.data;
  },

  async updatePersonal(id: string, payload: Record<string, unknown>) {
    const response = await httpClient.patch<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeProfilePersonal(id),
      payload,
    );
    return response.data.data;
  },

  async updateContact(id: string, payload: Record<string, unknown>) {
    const response = await httpClient.patch<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeProfileContact(id),
      payload,
    );
    return response.data.data;
  },

  async updateEmployment(id: string, payload: Record<string, unknown>) {
    const response = await httpClient.patch<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeProfileEmployment(id),
      payload,
    );
    return response.data.data;
  },

  async updateLicenses(id: string, licenses: EmployeeLicense[]) {
    const response = await httpClient.patch<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeProfile(id),
      { softwareLicensesAssigned: licenses },
    );
    return response.data.data;
  },

  async updateEmergency(id: string, payload: { contacts: Record<string, unknown>[] }) {
    const response = await httpClient.patch<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeProfileEmergency(id),
      payload,
    );
    return response.data.data;
  },

  async revealSensitive(id: string) {
    const response = await httpClient.post<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeRevealSensitive(id),
      { field: 'all' },
    );
    return response.data.data;
  },

  async listDocuments(id: string) {
    const response = await httpClient.get<ApiResponse<Array<Record<string, unknown>>>>(endpoints.employeeDocuments(id));
    return response.data.data;
  },

  async uploadDocument(id: string, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    const response = await httpClient.post<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeDocuments(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  },

  async listBankChangeRequests(id: string) {
    const response = await httpClient.get<ApiResponse<Array<Record<string, unknown>>>>(
      endpoints.employeeBankChangeRequest(id),
    );
    return response.data.data;
  },

  async submitBankChangeRequest(id: string, payload: Record<string, unknown>) {
    const response = await httpClient.post<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeBankChangeRequest(id),
      payload,
    );
    return response.data.data;
  },

  async approveBankChangeRequest(id: string, reqId: string, remarks?: string) {
    const response = await httpClient.post<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeBankChangeApprove(id, reqId),
      { remarks },
    );
    return response.data.data;
  },

  async rejectBankChangeRequest(id: string, reqId: string, remarks: string) {
    const response = await httpClient.post<ApiResponse<Record<string, unknown>>>(
      endpoints.employeeBankChangeReject(id, reqId),
      { remarks },
    );
    return response.data.data;
  },
};
