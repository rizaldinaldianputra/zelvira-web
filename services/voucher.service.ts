import { Voucher } from '@/types/voucher';
import { BaseService } from './base.service';
import { apiClient } from './api.client';

class VoucherServiceClass extends BaseService<Voucher> {
  constructor() {
    super('/vouchers');
  }

  async getAvailable(): Promise<Voucher[]> {
    return apiClient.get<Voucher[]>('/vouchers/available');
  }

  async getMyVouchers(): Promise<any[]> {
    return apiClient.get<any[]>('/vouchers/my-vouchers');
  }

  async claim(code: string): Promise<any> {
    return apiClient.post<any>(`/vouchers/claim/${code}`, {});
  }

  async getByCode(code: string): Promise<Voucher> {
    return apiClient.get<Voucher>(`/vouchers/code/${code}`);
  }
}

export const VoucherService = new VoucherServiceClass();
