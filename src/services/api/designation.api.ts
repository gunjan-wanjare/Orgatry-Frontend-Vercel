import { httpClient } from './http-client';
import { endpoints } from './endpoints';
import type { ApiResponse } from '@/types/api';

export type DesignationTemplate = {
  id: string;
  designation: string;
  department: string;
  responsibilities: string[];
};

export type DesignationDocumentSnapshot = {
  id: string;
  title: string;
  finalDesignation: string;
  finalDepartment: string;
  finalResponsibilities: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateDesignationDocumentPayload = {
  title: string;
  designation: string;
  department: string;
  responsibilities: string[];
};

export const designationApi = {
  async search(query: string): Promise<DesignationTemplate[]> {
    const response = await httpClient.get<ApiResponse<DesignationTemplate[]>>(
      endpoints.designationsSearch,
      { params: { q: query } },
    );
    return response.data.data;
  },

  async createDocument(
    payload: CreateDesignationDocumentPayload,
  ): Promise<DesignationDocumentSnapshot> {
    const response = await httpClient.post<ApiResponse<DesignationDocumentSnapshot>>(
      endpoints.documents,
      payload,
    );
    return response.data.data;
  },
};
