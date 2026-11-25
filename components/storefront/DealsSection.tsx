'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Tag, Sparkles, Percent, ShoppingBag } from 'lucide-react';
import { ContentItem } from '@/types/content';
import { Product } from '@/types/product';
import { ProductService } from '@/services/product.service';
import { formatImageUrl } from '@/lib/url-utils';
import ProductCard from './ProductCard';
import { useGsapSectionReveal } from '@/hooks/useGsapSectionReveal';

interface DealsSectionProps {
  items?: ContentItem[];
}

export default function DealsSection({ items }: DealsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [dealsWithProducts, setDealsWithProducts] = useState<
    Array<{
      deal: ContentItem;
      products: Product[];
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // GSAP scroll-triggered entrance transition
  useGsapSectionReveal({
    targetRef: sectionRef,
    selector: '.deals-header, .deals-banner, .deals-grid',
    stagger: 0.12,
  });

  useEffect(() => {
    let isCancelled = false;

    const loadDealsProducts = async () => {
      setIsLoading(true);
      try {
        if (!items || items.length === 0) {
          setDealsWithProducts([]);
          return;
        }

        // Fetch products for all deals
        const result = await Promise.all(
          items.map(async (deal) => {
            const rawIds = (deal as any).productIds || '';
            const ids = rawIds
              .split(',')
              .map((s: string) => Number(s.trim()))
              .filter((n: number) => !isNaN(n) && n > 0);

            let dealProducts: Product[] = [];

            if (ids.length > 0) {
              try {
                dealProducts = await ProductService.getByIds(ids);
                if (!Array.isArray(dealProducts)) {
                  dealProducts = (dealProducts as any)?.data || [];
                }
              } catch (e) {
                console.warn(`[DealsSection] Failed to load products for deal ${deal.id}:`, e);
              }
            }

            // Fallback: If no products configured for this deal, fetch some discount products
            if (dealProducts.length === 0) {
              try {
                const catalogRes = await ProductService.getAll(0, 8);
                const catalog = catalogRes?.content || (Array.isArray(catalogRes) ? catalogRes : []);
                // Prioritize products with discount
                const saleProducts = catalog.filter((p) => p.originalPrice && p.price && p.originalPrice > p.price);
                dealProducts = (saleProducts.length > 0 ? saleProducts : catalog).slice(0, 4);
              } catch { }
            }

            return {
              deal,
              products: dealProducts,
            };
          })
        );

        if (!isCancelled) {
          setDealsWithProducts(result);
        }
      } catch (err) {
        console.error('[DealsSection] Error loading deals products:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadDealsProducts();

    return () => {
      isCancelled = true;
    };
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-24 bg-gradient-to-b from-white via-neutral-50/70 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 border-b border-neutral-100 dark:border-white/10 relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at top right, rgba(168,85,247,0.08) 0%, transparent 400px), radial-gradient(circle at bottom left, rgba(236,72,153,0.08) 0%, transparent 400px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="deals-header flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200/70 dark:border-white/10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/25 shrink-0">
              <Percent size={28} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">
                  <Sparkles size={11} className="fill-purple-500 text-purple-500" />
                  Penawaran Eksklusif
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                EXCLUSIVE DEALS &amp; PROMO
              </h2>
              <p className="text-neutral-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                Nikmati penawaran diskon spesial dan potongan harga eksklusif untuk produk-produk pilihan terbaik.
              </p>
            </div>
          </div>

          <Link
            href="/deals"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/50 text-xs font-semibold transition-all shadow-sm group self-start md:self-auto shrink-0"
          >
            <span>Semua Promo Deals</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Deals List */}
        {dealsWithProducts.map(({ deal, products }, idx) => (
          <div key={deal.id || idx} className="space-y-8">
            {/* Promo Banner Card */}
            <div className="deals-banner group relative rounded-[2.5rem] overflow-hidden bg-neutral-900 shadow-xl border border-neutral-200/60 dark:border-white/10 min-h-[260px] sm:min-h-[300px] flex items-center">
              {/* Background Image (Sharp, no blur) */}
              {deal.imageUrl && (
                <Image
                  src={formatImageUrl(deal.imageUrl)}
                  alt={deal.title || 'Deal Banner'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-black/25 dark:from-black/90 dark:via-black/70 dark:to-black/35" />

              {/* Banner Floating Content */}
              <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-2xl text-white">
                {deal.badgeText && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-purple-500 to-pink-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-purple-500/30">
                    <Tag size={12} /> {deal.badgeText}
                  </div>
                )}
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-3 text-white">
                  {deal.title}
                </h3>
                {deal.subtitle && (
                  <p className="text-white/85 text-xs sm:text-base font-medium leading-relaxed mb-6 max-w-lg">
                    {deal.subtitle}
                  </p>
                )}

                {deal.ctaText && (
                  <Link
                    href={deal.linkUrl || '/products'}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white hover:bg-pink-500 text-neutral-900 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl active:scale-95 group/btn"
                  >
                    <span>{deal.ctaText}</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

            {/* Products Grid for this Deal */}
            {products.length > 0 && (
              <div className="deals-grid space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-purple-600 dark:text-purple-400" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-white">
                      Produk Pilihan Deal ({products.length} Item)
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={`${deal.id}-${product.id}`} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
