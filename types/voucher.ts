export interface Voucher {
  id: number;
  code: string;
  discountAmount: number;
  minPurchase: number;
  discountType?: 'FIXED' | 'PERCENTAGE' | string;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
  targetMembership?: string;
  // UI helpers
  title?: string;
  desc?: string;
}
