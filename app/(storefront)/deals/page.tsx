import { Metadata } from 'next';
import { ContentService } from '@/services/content.service';
import { ProductService } from '@/services/product.service';
import DealsSection from '@/components/storefront/DealsSection';
import DealsCatalog from '@/components/storefront/DealsCatalog';
import { Sparkles, Ticket } from 'lucide-react';
import SeoScript from '@/components/storefront/SeoScript';
import { Product } from '@/types/product';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Exclusive Deals & Penawaran Spesial | Zelvira',
  description: 'Jelajahi promo eksklusif, diskon musiman, dan penawaran terbaik untuk produk pilihan Zelvira.',
};

export default async function DealsPage() {
  let deals: any[] = [];
  let catalogProducts: Product[] = [];

  try {
    const dealsRes = await ContentService.getPublicItemsByType('DEALS', 'WEB');
    deals = dealsRes || [];
  } catch (err) {
    console.warn('[DealsPage] Failed to fetch CMS deals:', err);
  }

  try {
    const prodRes = await ProductService.getAll(0, 32);
    const all = prodRes?.content || (Array.isArray(prodRes) ? prodRes : []);

    // Prioritize products with discount or high sales
    const discounted = all.filter((p) => p.originalPrice && p.price && p.originalPrice > p.price);
    catalogProducts = discounted.length >= 6 ? discounted : all;
  } catch (err) {
    console.warn('[DealsPage] Failed to fetch catalog products:', err);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-neutral-900 dark:text-slate-100">
      <SeoScript pageName="DEALS" />

      {/* Header Section */}
      <section className="pt-28 pb-16 bg-neutral-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-400 mb-6 border border-white/10">
              <Ticket size={14} className="fill-pink-500" /> Penawaran Terbatas
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              EXCLUSIVE <span className="bg-linear-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent italic">DEALS</span>
            </h1>
            <p className="max-w-2xl text-white/70 font-medium text-xs sm:text-sm leading-relaxed">
              Nikmati penghematan istimewa untuk busana dan produk favorit Anda. Mulai dari diskon musiman hingga penawaran voucher terbatas.
            </p>
          </div>
        </div>
      </section>

      {/* 1. CMS Deals Section (If configured) */}
      {deals && deals.length > 0 && (
        <DealsSection items={deals} />
      )}

      {/* 2. Interactive Deals Products Catalog (Always active) */}
      <DealsCatalog products={catalogProducts} />
    </main>
  );
}
