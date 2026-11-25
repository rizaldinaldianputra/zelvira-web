'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Flame,
  Crown,
  Medal,
  Star,
  Users,
  ShoppingBag,
  Heart,
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { ContentItem } from '@/types/content';
import { formatImageUrl } from '@/lib/url-utils';
import { useWishlist } from '@/contexts/WishlistContext';
import { useGsapSectionReveal } from '@/hooks/useGsapSectionReveal';

const AddToCartModal = dynamic(() => import('./AddToCartModal'), {
  ssr: false,
});

type LeaderboardTab = 'ALL' | 'TOP_SALES' | 'HIGH_RATED' | 'VIRAL';

interface TrendingSectionProps {
  items?: ContentItem[];
  initialProducts?: Product[];
}

export default function TrendingSection({ items = [], initialProducts = [] }: TrendingSectionProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(initialProducts.length === 0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(initialProducts.length);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('ALL');

  // Modal State
  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger Section Transition
  useGsapSectionReveal(sectionRef, {
    headerSelector: '.trending-header',
    itemSelector: '.trending-card',
  });

  // Debounce search query input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch products from ProductService
  useEffect(() => {
    let isCancelled = false;

    const fetchTrendingProducts = async () => {
      if (currentPage === 0 && !debouncedSearch && products.length > 0) {
        return;
      }
      setIsLoading(true);
      try {
        const res = await ProductService.getAll(currentPage, 5, debouncedSearch || undefined);
        if (isCancelled) return;

        let list: Product[] = [];
        let totalP = 1;
        let totalE = 0;

        if (res && res.content) {
          list = res.content;
          totalP = res.totalPages || 1;
          totalE = res.totalElements || res.content.length;
        } else if (Array.isArray(res)) {
          list = res.slice(0, 5);
          totalP = Math.ceil(res.length / 5) || 1;
          totalE = res.length;
        }

        // If CMS has curated items tagged 'TRENDING' and on page 0 without search
        if (currentPage === 0 && !debouncedSearch && items && items.length > 0) {
          const cmsTrending: Product[] = items
            .filter((i) => (i.tag?.toUpperCase() === 'TRENDING' || i.type === 'TRENDING_NOW') && i.product)
            .map((i) => ({
              ...i.product!,
              badgeText: i.badgeText || 'Top Trending',
              imageUrl: i.imageUrl || i.product!.imageUrl,
              variants: i.product!.variants || [],
            }));

          if (cmsTrending.length > 0) {
            list = cmsTrending;
            totalE = cmsTrending.length;
            totalP = 1;
          }
        }

        setProducts(list);
        setTotalPages(totalP);
        setTotalElements(totalE);
      } catch (err) {
        console.warn('[TrendingSection] Failed to fetch products:', err);
        if (!isCancelled) {
          setProducts([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchTrendingProducts();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedSearch]);

  const handlePageChange = (page: number) => {
    if (page < 0 || page >= totalPages || page === currentPage) return;
    setCurrentPage(page);

    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenCart = (product: Product) => {
    setSelectedProductForCart(product);
    setIsCartModalOpen(true);
  };

  const championProduct = products[0];
  const rankedFollowers = products.slice(1, 5);

  const getRankBadge = (rankIdx: number) => {
    switch (rankIdx) {
      case 0:
        return {
          label: '👑 #1 TOP TRENDING',
          bg: 'bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 text-white',
          border: 'border-amber-400/50',
          watermark: '#01',
          sold: '1.9k+ Terjual',
          viewers: '24 orang melihat',
        };
      case 1:
        return {
          label: '🥈 #2 TERPOPULER',
          bg: 'bg-linear-to-r from-slate-600 via-slate-500 to-cyan-600 text-white',
          border: 'border-cyan-300/40',
          watermark: '#02',
          sold: '1.3k+ Terjual',
          viewers: '19 orang melihat',
        };
      case 2:
        return {
          label: '🥉 #3 TERPOPULER',
          bg: 'bg-linear-to-r from-amber-700 via-amber-600 to-orange-500 text-white',
          border: 'border-amber-500/40',
          watermark: '#03',
          sold: '980+ Terjual',
          viewers: '14 orang melihat',
        };
      case 3:
        return {
          label: '⭐ #4 TOP CHOICE',
          bg: 'bg-linear-to-r from-emerald-600 to-teal-600 text-white',
          border: 'border-emerald-300/40',
          watermark: '#04',
          sold: '820+ Terjual',
          viewers: '11 orang melihat',
        };
      default:
        return {
          label: '⭐ #5 TOP CHOICE',
          bg: 'bg-linear-to-r from-blue-600 to-indigo-600 text-white',
          border: 'border-blue-300/40',
          watermark: '#05',
          sold: '750+ Terjual',
          viewers: '9 orang melihat',
        };
    }
  };

  // Helper for pagination
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

  const startIndex = totalElements === 0 ? 0 : currentPage * 5 + 1;
  const endIndex = Math.min((currentPage + 1) * 5, totalElements);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 relative bg-linear-to-b from-white via-cyan-50/20 to-white dark:from-slate-950 dark:via-cyan-950/15 dark:to-slate-950 text-neutral-900 dark:text-slate-100 overflow-hidden border-b border-neutral-200/80 dark:border-white/10 scroll-mt-20"
      style={{
        backgroundImage: 'radial-gradient(circle at top right, rgba(6,182,212,0.08) 0%, transparent 450px), radial-gradient(circle at bottom left, rgba(59,130,246,0.07) 0%, transparent 450px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Header Section */}
        <div className="trending-header flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-white/10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-sm">
                <Crown size={14} className="fill-white" />
                Leaderboard Hall of Fame
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/40">
                <Flame size={12} className="text-orange-500 fill-orange-500" />
                Trending &amp; Terlaris Minggu Ini
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              PRODUK TERBARU &amp; POPULER
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl font-medium">
              Daftar produk paling banyak dicari dan terlaris dengan ulasan tertinggi dari ribuan pelanggan Zelvira.
            </p>
          </div>

          {/* Right Action: Search Bar & Total Counter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk populer..."
                className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-sm transition-all text-neutral-900 dark:text-white"
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

            <div className="px-4 py-2.5 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/40 rounded-full text-xs font-bold text-cyan-800 dark:text-cyan-200 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>
                {isLoading ? (
                  'Memuat peringkat...'
                ) : (
                  <>
                    Peringkat <strong>#{startIndex} - #{endIndex}</strong> dari total <strong>{totalElements}</strong>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'ALL', label: '🏆 Top Leaderboard' },
            { id: 'TOP_SALES', label: '🔥 Paling Cepat Terjual' },
            { id: 'HIGH_RATED', label: '⭐ Rating Sempurna (4.9+)' },
            { id: 'VIRAL', label: '✨ Viral di Media Sosial' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LeaderboardTab)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-neutral-600 dark:text-slate-300 hover:border-cyan-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTrendingTab"
                    className="absolute inset-0 bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── LEADERBOARD SHOWCASE GRID ─────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-5 aspect-4/5 bg-neutral-100 dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-4/5 bg-neutral-100 dark:bg-slate-900 rounded-4xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm px-4">
            <Sparkles size={36} className="text-neutral-400 dark:text-slate-500 mb-3" />
            <p className="text-neutral-800 dark:text-white text-sm font-bold uppercase tracking-widest">
              Tidak ada produk yang ditemukan
            </p>
            <p className="text-neutral-500 dark:text-slate-400 text-xs mt-1 max-w-sm">
              {searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}".` : 'Belum ada produk trending saat ini.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-5 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-all"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* 1. PODIUM CHAMPION CARD (#1 TOP SELLER - Left Column Col Span 5) */}
            {championProduct && (
              <div
                className={`trending-card trending-champion ${rankedFollowers.length === 0 ? 'lg:col-span-12 max-w-xl mx-auto w-full' : 'lg:col-span-5'} group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-7 border-2 border-amber-400/60 dark:border-amber-500/40 shadow-xl hover:shadow-[0_20px_50px_-15px_rgba(245,158,11,0.25)] transition-all duration-500 flex flex-col justify-between overflow-hidden`}
              >
                {/* Gold Glow Aura */}
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-700" />

                {/* Subtle Huge Watermark #01 */}
                <div className="absolute right-4 top-2 text-8xl font-black text-amber-500/5 select-none pointer-events-none font-mono">
                  #01
                </div>

                <div className="relative z-10 space-y-5">
                  {/* Top Rank Badge & Wishlist */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                        <Crown size={14} className="fill-white" />
                        #1 TOP CHAMPION
                      </span>
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-xs font-medium">
                        Pilihan Terlaris
                      </span>
                    </div>

                    <button
                      onClick={() => toggleWishlist(championProduct.id)}
                      aria-label={`Wishlist ${championProduct.name}`}
                      className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-all border border-neutral-200/60 dark:border-white/10 group/btn"
                    >
                      <Heart
                        size={18}
                        className={`transition-colors ${
                          isInWishlist(championProduct.id)
                            ? 'fill-rose-500 text-rose-500'
                            : 'text-neutral-500 dark:text-slate-400 group-hover/btn:text-rose-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Image Frame */}
                  <div className="relative aspect-4/5 w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100 dark:bg-slate-800 border border-neutral-200/60 dark:border-white/10">
                    <Link href={`/products/${championProduct.slug}`} className="block w-full h-full relative">
                      <Image
                        src={formatImageUrl(championProduct.imageUrl || championProduct.img || '')}
                        alt={championProduct.name || 'Produk Juara Trending'}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        loading="lazy"
                        quality={70}
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-106"
                      />
                    </Link>

                    {/* Live Social Proof Floating Pill */}
                    <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-neutral-200/60 dark:border-white/10 flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-400">
                      <Flame size={14} className="fill-current" />
                      <span>1.9k+ Terjual Bulan Ini</span>
                    </div>

                    {/* Live Viewers Floating Tag */}
                    <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg text-white flex items-center gap-1.5 text-[11px] font-bold">
                      <Users size={12} className="text-cyan-400" />
                      <span>Sedang dilihat 24 orang</span>
                    </div>
                  </div>

                  {/* Details & Action */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-slate-400">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13} className="fill-amber-400" />
                          ))}
                        </div>
                        <span className="font-extrabold text-neutral-800 dark:text-white">4.9</span>
                        <span>(540+ Review Pembeli)</span>
                      </div>

                      <Link href={`/products/${championProduct.slug}`}>
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {championProduct.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-slate-400">
                          Harga Terbaik
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                          Rp {(championProduct.price || 149000).toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${championProduct.slug}`}
                          aria-label={`Lihat detail ${championProduct.name}`}
                          className="p-3 rounded-2xl bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-800 dark:text-white transition-all flex items-center justify-center"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          onClick={() => handleOpenCart(championProduct)}
                          aria-label={`+ Keranjang ${championProduct.name}`}
                          className="px-5 py-3 rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                          <ShoppingBag size={15} />
                          <span>+ Keranjang</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. RANKED LEADERBOARD TILES (#2 to #5 - Right Column Col Span 7) */}
            {rankedFollowers.length > 0 && (
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {rankedFollowers.map((product, idx) => {
                const rankInfo = getRankBadge(idx + 1);
                const isWish = isInWishlist(product.id);

                return (
                  <div
                    key={product.id || idx}
                    className="trending-card group relative bg-white dark:bg-slate-900 rounded-4xl p-4 sm:p-5 border border-neutral-200/70 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-500/40 shadow-md hover:shadow-xl transition-all duration-400 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5"
                  >
                    {/* Subtle Rank Watermark in Tile */}
                    <div className="absolute right-3 top-2 text-7xl font-black text-neutral-900/5 dark:text-white/5 select-none pointer-events-none font-mono">
                      {rankInfo.watermark}
                    </div>

                    {/* Top Row: Rank Badge & Wishlist */}
                    <div className="flex items-center justify-between mb-3 z-10">
                      <span className={`px-2.5 py-1 ${rankInfo.bg} text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-sm`}>
                        {rankInfo.label}
                      </span>

                      <button
                        onClick={() => toggleWishlist(product.id)}
                        aria-label={`Simpan ke wishlist ${product.name}`}
                        className="w-8 h-8 rounded-full bg-neutral-100/90 dark:bg-slate-800/90 hover:bg-rose-50 flex items-center justify-center transition-all"
                      >
                        <Heart
                          size={14}
                          className={isWish ? 'fill-rose-500 text-rose-500' : 'text-neutral-500 dark:text-slate-400'}
                        />
                      </button>
                    </div>

                    {/* Product Image */}
                    <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-slate-800/60 mb-4">
                      <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
                        <Image
                          src={formatImageUrl(product.imageUrl || product.img || '')}
                          alt={product.name || 'Produk Populer'}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          loading="lazy"
                          quality={70}
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
                        />
                      </Link>

                      {/* Floating Sales Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                        <Flame size={11} className="text-orange-400" />
                        <span>{rankInfo.sold}</span>
                      </div>

                      {/* Quick Buy Bar on Hover */}
                      <button
                        onClick={() => handleOpenCart(product)}
                        aria-label={`+ Keranjang ${product.name}`}
                        className="absolute bottom-2.5 left-2.5 right-2.5 py-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-neutral-900 dark:text-white font-semibold text-xs shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-cyan-600 hover:text-white flex items-center justify-center gap-1.5 backdrop-blur-md"
                      >
                        <ShoppingBag size={14} />
                        <span>+ Keranjang</span>
                      </button>
                    </div>

                    {/* Content & Price */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 dark:text-slate-400">
                        <div className="flex items-center gap-1 text-amber-600">
                          <Star size={12} className="fill-amber-400" />
                          <span>4.9</span>
                        </div>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Ready Stock</span>
                      </div>

                      <Link href={`/products/${product.slug}`}>
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                      </Link>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                          Rp {(product.price || 129000).toLocaleString('id-ID')}
                        </span>

                        <button
                          onClick={() => handleOpenCart(product)}
                          aria-label={`+ Beli ${product.name}`}
                          className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 text-xs font-semibold hover:underline"
                        >
                          + Beli
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        )}

        {/* Pagination Section with Page Numbers */}
        {totalPages > 1 && (
          <div className="mt-12 pt-6 border-t border-neutral-200/70 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Summary Info */}
            <p className="text-xs font-semibold text-neutral-500 dark:text-slate-400">
              Halaman <strong className="text-neutral-900 dark:text-white">{currentPage + 1}</strong> dari{' '}
              <strong className="text-neutral-900 dark:text-white">{totalPages}</strong> (Total {totalElements} Produk Populer)
            </p>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || isLoading}
                aria-label="Prev"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-slate-300 hover:text-cyan-600 hover:border-cyan-300 disabled:opacity-40 shadow-sm transition-all"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {getPageNumbers().map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs font-semibold text-neutral-400 select-none">
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
                    disabled={isLoading}
                    aria-label={`Go to page ${pageNum + 1}`}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                      isActive
                        ? 'bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/25 scale-105'
                        : 'bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-slate-300 hover:border-cyan-300 hover:text-cyan-600 shadow-sm'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || isLoading}
                aria-label="Next"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-slate-300 hover:text-cyan-600 hover:border-cyan-300 disabled:opacity-40 shadow-sm transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {selectedProductForCart && (
        <AddToCartModal
          isOpen={isCartModalOpen}
          onClose={() => {
            setIsCartModalOpen(false);
            setSelectedProductForCart(null);
          }}
          product={selectedProductForCart}
        />
      )}
    </section>
  );
}
