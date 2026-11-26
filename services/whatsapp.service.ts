import { apiClient } from './api.client';

export interface WhatsAppStatus {
  status: string;
  deviceNumber?: string;
}

export const whatsappService = {
  getStatus: async (): Promise<WhatsAppStatus> => {
    const response = await apiClient.get<any>('/v1/admin/whatsapp/status');
    return response.data;
  },

  fetchQrCodeBlob: async (): Promise<string> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zelvira.co.id/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('zelixa_token') : null;

    if (!token || token === 'null' || token === 'undefined') {
      throw new Error('No authentication token found');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const response = await fetch(`${baseUrl}/v1/admin/whatsapp/qr`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`QR fetch failed: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error('QR code fetch timed out');
      throw error;
    }
  },

  logoutSession: async (): Promise<void> => {
    await apiClient.post('/v1/admin/whatsapp/logout', {});
  },

  sendMessage: async (phoneNumber: string, message: string): Promise<void> => {
    await apiClient.post('/v1/chat/send', { phoneNumber, message });
  },
};
