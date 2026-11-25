import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api';

export interface WalletTransaction {
  id: number;
  type: 'TOPUP' | 'PAYMENT' | 'POINTS_EARNED' | 'POINTS_REDEEMED';
  amount: number;
  points: number;
  description: string;
  referenceId: string;
  status: string;
  createdAt: string;
}

export interface WalletInfo {
  balance: number;
  points: number;
  recentTransactions: WalletTransaction[];
}

export const walletService = {
  getWalletInfo: async (): Promise<WalletInfo> => {
    const response = await apiClient.get<any>('/v1/wallet');
    const data = (response as any)?.data || response;
    return {
      balance: Number(data?.balance || 0),
      points: Number(data?.points || 0),
      recentTransactions: Array.isArray(data?.recentTransactions) ? data.recentTransactions : []
    };
  },

  initiateTopup: async (amount: number): Promise<any> => {
    const response = await apiClient.post<any>('/v1/wallet/topup', { amount });
    return (response as any)?.data || response;
  },

  verifyTopup: async (transactionId: number): Promise<{ status: string; message: string }> => {
    const response = await apiClient.post<any>(`/v1/wallet/topup/${transactionId}/verify`, {});
    return (response as any)?.data || response;
  }
};

