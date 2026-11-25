import { apiClient } from './api.client';
import { BaseService } from './base.service';
import { FlashSale } from '@/types/flash-sale';

class FlashSaleServiceClass extends BaseService<FlashSale> {
  constructor() {
    super('/flash-sales');
  }

  async getByPlatform(platform: 'WEB' | 'MOBILE'): Promise<FlashSale[]> {
    const response = await apiClient.get<any>(`${this.endpoint}?platform=${platform}`);
    return response.data ?? response;
  }

  async getActive(platform?: 'WEB' | 'MOBILE'): Promise<FlashSale[]> {
    const url = platform
      ? `${this.endpoint}/active?platform=${platform}`
      : `${this.endpoint}/active`;
    const response = await apiClient.get<any>(url);
    return response.data ?? response;
  }

  async getById(id: string | number): Promise<FlashSale> {
    const response = await apiClient.get<FlashSale>(`${this.endpoint}/${id}`);
    return response;
  }

  async create(data: Partial<FlashSale>): Promise<FlashSale> {
    const response = await apiClient.post<FlashSale>(this.endpoint, data);
    return response;
  }

  async update(id: string | number, data: Partial<FlashSale>): Promise<FlashSale> {
    const response = await apiClient.put<FlashSale>(`${this.endpoint}/${id}`, data);
    return response;
  }

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }
}

export const FlashSaleService = new FlashSaleServiceClass();
