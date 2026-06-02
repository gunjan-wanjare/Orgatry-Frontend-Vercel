import { endpoints } from './endpoints';
import { httpClient } from './http-client';
import type { ApiResponse } from '@/types/api';

export const employeeBulkApi = {
  async downloadTemplate(): Promise<Blob> {
    const response = await httpClient.get(endpoints.employeeImportTemplate, { responseType: 'blob' });
    return response.data as Blob;
  },

  async validateImport(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient.post<
      ApiResponse<{
        validRows: unknown[];
        invalidRows: Array<{ row: number; errors: string[] }>;
        summary: { total: number; valid: number; invalid: number };
      }>
    >(endpoints.employeeBulkImport, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async confirmImport(rows: unknown[]) {
    const response = await httpClient.post<
      ApiResponse<{ createdCount: number; failures: Array<{ row: number; reason: string }> }>
    >(endpoints.employeeBulkImportConfirm, { rows });
    return response.data.data;
  },

  async exportEmployees(params?: Record<string, string | boolean>) {
    const response = await httpClient.get(endpoints.employeeExport, {
      params,
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
