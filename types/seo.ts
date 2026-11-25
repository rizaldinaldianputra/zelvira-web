export interface SeoConfig {
  id?: number;
  pageName: string;
  targetType?: 'HEAD' | 'BODY' | string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  scriptCode?: string;
  isActive?: boolean;
}
