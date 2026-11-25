import { Metadata } from 'next';
import HeroBanner from '@/components/storefront/HeroBanner';
import FlashSale from '@/components/storefront/FlashSale';
import DealsSection from '@/components/storefront/DealsSection';
import TrendingSection from '@/components/storefront/TrendingSection';
import FeaturedProducts from '@/components/storefront/FeaturedProducts';
import NewsSection from '@/components/storefront/NewsSection';
import { ContentService } from '@/services/content.service';
import { FlashSaleService } from '@/services/flash-sale.service';
import { ProductService } from '@/services/product.service';
import SeoScript from '@/components/storefront/SeoScript';

export const revalidate = 60; // Incremental Static Regeneration (ISR): Instant TTFB with auto background refresh

export const metadata: Metadata = {
  title: 'Zelvira | Premium Aesthetic Store',
  description: 'Your one-stop destination for curated fashion, beauty, and lifestyle products.',
};

export default async function StorefrontHome() {
  let heroItems: any[] = [];
  let featuredItems: any[] = [];
  let flashSaleItems: any[] = [];
  let dealsItems: any[] = [];
  let flashSaleSessions: any[] = [];
  let catalogProducts: any[] = [];

  try {
    // 1. Fetch content items & catalog in parallel
    const [allItems, flashSessions, productsRes] = await Promise.all([
      ContentService.getAllItems('WEB').catch(() => []),
      FlashSaleService.getActive('WEB').catch(() => []),
      ProductService.getAll(0, 20).catch(() => ({ content: [] })),
    ]);

    const activeItems = (allItems || []).filter((item: any) => item.isActive);

    heroItems = activeItems.filter((i: any) => i.type === 'HERO_CAROUSEL');
    featuredItems = activeItems.filter((i: any) => i.type === 'FEATURED_PRODUCTS');
    flashSaleItems = activeItems.filter((i: any) => i.type === 'FLASH_SALE_WEB');
    dealsItems = activeItems.filter((i: any) => i.type === 'DEALS');
    flashSaleSessions = flashSessions || [];
    catalogProducts = productsRes?.content || (Array.isArray(productsRes) ? productsRes : []);
  } catch (error: any) {
    if (!error.isNetworkError) {
      console.error('[StorefrontHome] Failed to fetch storefront data:', error);
    }
  }

  return (
    <>
      <SeoScript pageName="HOME" />

      {/* 1. Hero Carousel Banner */}
      <HeroBanner items={heroItems} />

      {/* 2. Flash Sale (If active sessions or legacy items exist) */}
      {flashSaleSessions && flashSaleSessions.length > 0 ? (
        flashSaleSessions.map((s: any) => (
          <FlashSale key={`fs-session-${s.id}`} session={s} />
        ))
      ) : flashSaleItems.length > 0 ? (
        <FlashSale items={flashSaleItems} />
      ) : null}

      {/* 3. Koleksi Produk Unggulan */}
      <FeaturedProducts items={featuredItems} initialCatalogProducts={catalogProducts} />

      {/* 4. Exclusive Deals & Promo (With products list) */}
      {dealsItems.length > 0 && (
        <DealsSection items={dealsItems} />
      )}

      {/* 5. Trending Section */}
      <TrendingSection items={featuredItems} initialProducts={catalogProducts.slice(0, 5)} />

      {/* 6. News & Editorial Section */}
      <NewsSection />
    </>
  );
}
