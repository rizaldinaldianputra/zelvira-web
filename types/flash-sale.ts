export interface FlashSaleItem {
  id?: number;
  productId: number;
  productName?: string;
  productImageUrl?: string;
  variantId: number;
  variantName?: string;
  originalPrice?: number;
  discountPrice: number;
  stockLimit?: number;
  flashStock?: number;
  soldCount?: number;
  maxPurchasePerUser?: number;
}

export interface FlashSale {
  id?: number;
  name: string;
  platform: 'WEB' | 'MOBILE';
  bannerUrl?: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  maxPurchasePerUser?: number;
  items: FlashSaleItem[];
  createdAt?: string;
}
