'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Zap, ArrowRight, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { ContentItem } from '@/types/content';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import PromoSaleSection from './PromoSaleSection';
import NewArrivalsSection from './NewArrivalsSection';
import { useGsapSectionReveal } from '@/hooks/useGsapSectionReveal';

interface FeaturedProductsProps {
  items?: ContentItem[];
  initialCatalogProducts?: Product[];
}

interface SectionConfig {
  tag: 'BEST_SELLER' | 'NEW_ARRIVAL' | 'SALE';
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  gradientFrom: string;
  gradientTo: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  searchPlaceholder: string;
  emptyMessage: string;
}

const SECTIONS_CONFIG: SectionConfig[] = [
  {
    tag: 'BEST_SELLER',
    title: 'KOLEKSI PRODUK UNGGULAN',
    subtitle: 'Koleksi busana terlaris pilihan terbaik dengan jaminan mutu dan kualitas premium dari Zelvira',
    badge: 'Best Seller • Pilihan Terlaris',
    icon: Star,
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-rose-600',
    accentText: 'text-pink-700 dark:text-pink-300',
    accentBg: 'bg-pink-50 dark:bg-pink-950/30',
    accentBorder: 'border-pink-200/80 dark:border-pink-900/40',
    searchPlaceholder: 'Cari produk unggulan...',
    emptyMessage: 'Belum ada produk unggulan saat ini.',
  },
  {
    tag: 'NEW_ARRIVAL',
    title: 'NEW ARRIVALS - RILISAN TERBARU',
    subtitle: 'Koleksi busana muslim dan fashion kekinian yang baru saja diluncurkan untuk mempercantik gaya Anda',
    badge: 'Koleksi Baru • Musim Ini',
    icon: Sparkles,
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-purple-600',
    accentText: 'text-indigo-700 dark:text-indigo-300',
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    accentBorder: 'border-indigo-200/80 dark:border-indigo-900/40',
    searchPlaceholder: 'Cari koleksi new arrival...',
    emptyMessage: 'Belum ada produk new arrival saat ini.',
  },
  {
    tag: 'SALE',
    title: 'PROMO SALE & SPECIAL OFFERS',
    subtitle: 'Diskon dan potongan harga terbaik untuk melengkapi outfit favorit Anda dengan penawaran hemat',
    badge: 'Diskon Spesial • Hemat Belanja',
    icon: Zap,
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    accentText: 'text-amber-800 dark:text-amber-300',
    accentBg: 'bg-amber-50 dark:bg-amber-950/30',
    accentBorder: 'border-amber-200/80 dark:border-amber-900/40',
    searchPlaceholder: 'Cari promo diskon...',
    emptyMessage: 'Belum ada produk sale saat ini.',
  },
];

function SingleProductSection({
  config,
  cmsItems,
  allCatalogProducts,
}: {
  config: SectionConfig;
  cmsItems: ContentItem[];
  allCatalogProducts: Product[];
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger Transition
  useGsapSectionReveal(sectionRef, {
    headerSelector: '.featured-header',
    itemSelector: '.featured-card',
    parallaxOrb1Selector: '.featured-orb-1',
    parallaxOrb2Selector: '.featured-orb-2',
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase());
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Extract products specifically tagged for this collection
  const sectionProducts = useMemo(() => {
    const normalize = (val?: string) => (val || '').toUpperCase().replace(/[\s-]+/g, '_').trim();

    // 1. Filter from CMS items first
    const matchedCms = cmsItems
      .filter((item) => normalize(item.tag) === config.tag && item.product)
      .map((item) => ({
        ...item.product!,
        badgeText: item.badgeText || (config.tag === 'BEST_SELLER' ? 'Best Seller' : config.tag === 'SALE' ? 'Sale' : 'New'),
        variants: item.product!.variants || [],
        imageUrl: item.imageUrl || item.product!.imageUrl,
      }));

    let baseList: Product[] = matchedCms;

    // 2. Fallback to catalog ONLY if CMS has NO items curated for this tag
    if (baseList.length === 0 && allCatalogProducts.length > 0) {
      let catalogSlice = [...allCatalogProducts];
      if (config.tag === 'SALE') {
        const discounted = catalogSlice.filter((p) => p.originalPrice && p.price && p.originalPrice > p.price);
        catalogSlice = discounted.length >= 3 ? discounted : catalogSlice.slice(0, 10);
      } else if (config.tag === 'NEW_ARRIVAL') {
        catalogSlice = [...catalogSlice].reverse().slice(0, 10);
      } else {
        catalogSlice = catalogSlice.slice(0, 10);
      }

      baseList = catalogSlice.map((p) => ({
        ...p,
        badgeText: config.tag === 'BEST_SELLER' ? 'Best Seller' : config.tag === 'SALE' ? 'Sale' : 'New',
        variants: p.variants || [],
        imageUrl: p.imageUrl,
      }));
    }

    // 3. Apply search filter
    if (debouncedSearch) {
      baseList = baseList.filter((p) => p.name?.toLowerCase().includes(debouncedSearch));
    }

    return baseList;
  }, [cmsItems, allCatalogProducts, config.tag, debouncedSearch]);

  const pageSize = 5;
  const totalElements = sectionProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const startIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);

  const displayedProducts = useMemo(() => {
    const start = currentPage * pageSize;
    return sectionProducts.slice(start, start + pageSize);
  }, [sectionProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 0 || page >= totalPages || page === currentPage) return;
    setCurrentPage(page);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        pages.push(0, 1, 2, '...', totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0, '...', totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push(0, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1);
      }
    }
    return pages;
  };

  const IconComponent = config.icon;

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 relative bg-linear-to-b from-white via-neutral-50/70 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 text-neutral-900 dark:text-slate-100 overflow-hidden border-b border-neutral-100 dark:border-white/10 scroll-mt-20"
      style={{
        backgroundImage: 'radial-gradient(circle at top right, rgba(244,63,94,0.08) 0%, transparent 450px), radial-gradient(circle at bottom left, rgba(99,102,241,0.07) 0%, transparent 450px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 sm:mb-12">
          <div className="flex items-center gap-5 sm:gap-6">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br ${config.gradientFrom} ${config.gradientTo} rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/20 shrink-0`}
            >
              <IconComponent size={30} className="text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={13} className={config.accentText} />
                <span className={`text-xs font-semibold ${config.accentText}`}>
                  {config.badge}
                </span>
                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${config.accentBg} ${config.accentText} border ${config.accentBorder}`}>
                  5 Produk / Halaman
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {config.title}
              </h2>
              <p className="text-neutral-600 dark:text-slate-300 font-medium text-xs sm:text-sm mt-1 max-w-xl">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Right Action: Search Bar & Total Counter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={config.searchPlaceholder}
                className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500/15 shadow-sm transition-all text-neutral-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Total Results Count Badge */}
            <div className={`px-4 py-2.5 ${config.accentBg} border ${config.accentBorder} rounded-full text-xs font-bold ${config.accentText} shadow-sm flex items-center gap-1.5 whitespace-nowrap`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>
                Menampilkan <strong>{startIndex}-{endIndex}</strong> dari total <strong>{totalElements}</strong> produk
              </span>
            </div>
          </div>
        </div>

        {/* 5 Products Grid */}
        {displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900/80 border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm px-4">
            <Sparkles size={36} className="text-neutral-400 dark:text-slate-500 mb-3" />
            <p className="text-neutral-800 dark:text-white text-sm font-bold uppercase tracking-widest">
              Tidak ada produk yang ditemukan
            </p>
            <p className="text-neutral-600 dark:text-slate-300 text-xs mt-1 max-w-sm">
              {searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}".` : config.emptyMessage}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-5 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-pink-600 dark:hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
              <div key={`${config.tag}-${product.id}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-10 pt-6 border-t border-neutral-200/70 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-semibold text-neutral-500 dark:text-slate-400">
              Halaman <strong className="text-neutral-900 dark:text-white">{currentPage + 1}</strong> dari{' '}
              <strong className="text-neutral-900 dark:text-white">{totalPages}</strong> (Total {totalElements} Produk)
            </p>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                aria-label="Prev"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-slate-300 hover:text-pink-600 hover:border-pink-300 disabled:opacity-40 shadow-sm transition-all"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {getPageNumbers().map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs font-medium text-neutral-400 dark:text-slate-500 select-none">
                      ...
                    </span>
                  );
                }
                const pageNum = p as number;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => handlePageChange(pageNum)}
                    aria-label={`Go to page ${pageNum + 1}`}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                      isActive
                        ? `bg-linear-to-r ${config.gradientFrom} ${config.gradientTo} text-white shadow-md shadow-pink-500/25 scale-105`
                        : 'bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-slate-300 hover:border-pink-300 shadow-sm'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                aria-label="Next"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-slate-300 hover:text-pink-600 hover:border-pink-300 disabled:opacity-40 shadow-sm transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function FeaturedProducts({ items, initialCatalogProducts = [] }: FeaturedProductsProps) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(initialCatalogProducts);

  // Pre-load catalog products for smooth fallback only if not passed from server
  useEffect(() => {
    if (initialCatalogProducts && initialCatalogProducts.length > 0) return;
    let isCancelled = false;
    const fetchCatalog = async () => {
      try {
        const res = await ProductService.getAll(0, 20);
        const list = res?.content || (Array.isArray(res) ? res : []);
        if (!isCancelled) {
          setCatalogProducts(list);
        }
      } catch (err) {
        console.warn('[FeaturedProducts] Failed loading catalog:', err);
      }
    };
    fetchCatalog();
    return () => {
      isCancelled = true;
    };
  }, [initialCatalogProducts]);

  return (
    <div className="flex flex-col">
      {SECTIONS_CONFIG.map((config) => {
        if (config.tag === 'NEW_ARRIVAL') {
          return (
            <NewArrivalsSection
              key="new-arrival-section"
              cmsItems={items || []}
              allCatalogProducts={catalogProducts}
            />
          );
        }

        if (config.tag === 'SALE') {
          return (
            <PromoSaleSection
              key="promo-sale-section"
              cmsItems={items || []}
              allCatalogProducts={catalogProducts}
            />
          );
        }

        return (
          <SingleProductSection
            key={config.tag}
            config={config}
            cmsItems={items || []}
            allCatalogProducts={catalogProducts}
          />
        );
      })}
    </div>
  );
}
