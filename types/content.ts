import { Product } from './product';

export interface ContentItem {
  id?: number;
  platform?: 'WEB' | 'MOBILE' | 'ALL';
  type?: string;
  tag?: string;
  imageUrl?: string;
  bannerUrl?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  ctaText?: string;
  linkUrl?: string;
  emoji?: string;
  iconName?: string;
  productId?: number;
  styleConfig?: string;
  displayOrder?: number;
  isActive?: boolean;
  sectionId?: number;
  startDate?: string;
  endDate?: string;
  price?: number;
  quantity?: number;
  discountType?: string;
  discountValue?: number;
  maxPurchase?: number;
  soldQty?: number;
  contentBody?: string;
  productIds?: string;
  createdAt?: string;
  product?: Product;
  products?: Product[];
}

export interface ContentSection {
  id?: number;
  platform?: 'WEB' | 'MOBILE' | 'ALL';
  type?: string;
  title?: string;
  subtitle?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  items?: ContentItem[];
}

export interface Slide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  bgFrom: string;
  bgTo: string;
  accent: string;
  image: string;
  badge: string;
}

