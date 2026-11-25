import { Category } from './category';
import { Brand } from './brand';

export interface ProductVariant {
  id: number;
  sku: string;
  size?: string;
  color?: string;
  hexColor?: string;
  groupName?: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  barcode?: string;
  stock: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  imageUrl?: string;
  shortDescription?: string;
  categoryId: number;
  brandId?: number;
  gender?: 'MEN' | 'WOMEN' | 'UNISEX';
  material?: string;
  weight?: number;
  isActive: boolean;
  category?: Category;
  brand?: Brand;
  variants: ProductVariant[];
  banners?: string[];
  images?: string[];
  // UI helpers
  price?: number; // fallback or lowest price
  originalPrice?: number; // for flash sale / discounts
  qty?: number;   // total stock
  stock?: number; // alias for qty or specific flash stock
  img?: string;   // primary image url
}

export interface ProductCardProps {
  product: Product;
}

export interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}
