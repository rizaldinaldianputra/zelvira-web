import { BaseService } from './base.service';
import { apiClient } from './api.client';

export interface DigitalProduct {
  id: number;
  sku: string;
  productName: string;
  category: string;
  brand: string;
  type: string;
  sellerName: string;
  price: number;
  buyerSkuCode: string;
  buyerProductStatus: boolean;
  sellerProductStatus: boolean;
  unlimitedStock: boolean;
  stock: number;
  multi: boolean;
  faultTolerant: boolean;
  cutOff: boolean;
  desc: string;
  isActive: boolean;
}

export class DigitalProductService extends BaseService<DigitalProduct> {
  constructor() {
    super('/api/products/digital');
  }

  async getAllProducts(category?: string): Promise<DigitalProduct[]> {
    const url = category 
      ? `${this.endpoint}?category=${encodeURIComponent(category)}`
      : this.endpoint;
    const response = await apiClient.get<any>(url);
    return Array.isArray(response) ? response : (response.data || []);
  }

  async syncProducts(type: 'prepaid' | 'pasca'): Promise<{ message: string }> {
    const response = await apiClient.post<any>(`${this.endpoint}/sync`, { type });
    return response.data || response;
  }
}

export const digitalProductService = new DigitalProductService();
