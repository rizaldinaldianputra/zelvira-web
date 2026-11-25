import { apiClient } from './api.client';
import { PaginatedResponse, ApiResponse } from '@/types/api';

export class BaseService<T> {
  constructor(protected endpoint: string) {}

  async getAll(page = 0, size = 10, silent = true): Promise<PaginatedResponse<T>> {
    try {
      const response = await apiClient.get<any>(`${this.endpoint}?page=${page}&size=${size}`, { silent });
      // Support both wrapped (status, message, data) and unwrapped (Spring Page)
      return response.data?.content ? response.data : response;
    } catch (error: any) {
      if (silent && error.isNetworkError) {
        return { content: [], totalElements: 0, totalPages: 0, size, number: page } as any;
      }
      throw error;
    }
  }

  async getById(id: number | string, silent = false): Promise<T> {
    try {
      const response = await apiClient.get<any>(`${this.endpoint}/${id}`, { silent });
      return response.data ?? response;
    } catch (error: any) {
      if (silent && error.isNetworkError) {
        return null as any;
      }
      throw error;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<any>(this.endpoint, data);
    return response.data ?? response;
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<any>(`${this.endpoint}/${id}`, data);
    return response.data ?? response;
  }

  async delete(id: number | string): Promise<any> {
    return apiClient.delete<any>(`${this.endpoint}/${id}`);
  }
}
