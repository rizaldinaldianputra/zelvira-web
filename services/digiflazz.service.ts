import { apiClient } from './api.client';

export interface DigiflazzBalance {
  deposit: number;
}

export class DigiflazzService {
  static async checkBalance(): Promise<DigiflazzBalance> {
    const response = await apiClient.get<any>('/api/digiflazz/cek-saldo');
    return response.data?.data || response.data || { deposit: 0 };
  }
}
