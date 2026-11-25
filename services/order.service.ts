import { BaseService } from './base.service';
import { Order, CheckoutRequest, CheckoutResponse } from '@/types/order';
import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api';

class OrderServiceClass extends BaseService<Order> {
  constructor() {
    super('/v1/orders');
  }

  async updateStatus(id: number | string, status: string) {
    return apiClient.patch<ApiResponse<Order>>(`${this.endpoint}/${id}/status`, { status });
  }

  async getMyOrders(): Promise<Order[]> {
    const res = await apiClient.get<ApiResponse<Order[]>>('/v1/orders/my');
    return res.data || [];
  }

  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const res = await apiClient.post<ApiResponse<CheckoutResponse>>('/v1/checkout', request);
    return res.data;
  }

  async getOrderByIdUser(id: number | string): Promise<Order> {
    const res = await apiClient.get<ApiResponse<Order>>(`/v1/orders/${id}`);
    return res.data;
  }

  async addTrackingNumber(id: number | string, trackingNumber: string): Promise<Order> {
    const res = await apiClient.patch<ApiResponse<Order>>(`${this.endpoint}/${id}/tracking`, { trackingNumber });
    return res.data;
  }

  async syncPayment(id: number | string): Promise<Order> {
    const res = await apiClient.post<ApiResponse<Order>>(`${this.endpoint}/${id}/sync-payment`, {});
    return res.data || (res as any);
  }

  async getPaymentToken(id: number | string): Promise<{ paymentToken: string; paymentUrl?: string }> {
    const res = await apiClient.post<ApiResponse<{ paymentToken: string; paymentUrl?: string }>>(`${this.endpoint}/${id}/payment-token`, {});
    return res.data;
  }

  async syncPaymentByNumber(orderNumber: string): Promise<Order> {
    const res = await apiClient.post<ApiResponse<Order>>(`${this.endpoint}/number/${orderNumber}/sync-payment`, {});
    return res.data || (res as any);
  }
}

export const OrderService = new OrderServiceClass();
