import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  Flame,
  Clock,
  Sparkles,
  Tag,
  ArrowRight,
  ShoppingBag,
  Heart,
  Eye,
  Check,
  Copy,
  Search,
  X,
  TrendingDown,
  ShieldCheck,
  Star,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Product, ProductVariant } from '@/types/product';
import { ContentItem } from '@/types/content';
import { formatImageUrl } from '@/lib/url-utils';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { useGsapSectionReveal } from '@/hooks/useGsapSectionReveal';

const AddToCartModal = dynamic(() => import('./AddToCartModal'), {
  ssr: false,
});

interface PromoSaleSectionProps {
  cmsItems?: ContentItem[];
  allCatalogProducts?: Product[];
}

type FilterTab = 'ALL' | 'BIG_DISCOUNT' | 'BEST_VALUE' | 'TRENDING';

export default function PromoSaleSection({
  cmsItems = [],
  allCatalogProducts = [],
}: PromoSaleSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Internal catalog fallback in case parent catalog products take time to arrive
  const [internalCatalog, setInternalCatalog] = useState<Product[]>([]);

  useEffect(() => {
    if (allCatalogProducts.length === 0) {
      import('@/services/product.service').then(({ ProductService }) => {
        ProductService.getAll(0, 15)
          .then((res) => {
            const list = res?.content || (Array.isArray(res) ? res : []);
            setInternalCatalog(list);
          })
          .catch(() => { });
      });
    }
  }, [allCatalogProducts.length]);

  // GSAP Scroll reveal only on header to prevent cards being stuck at opacity: 0
  useGsapSectionReveal({
    targetRef: sectionRef,
    selector: '.promo-header',
    stagger: 0.1,
  });

  // State
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [spotlightVariantIdx, setSpotlightVariantIdx] = useState(0);

  // Live Countdown Timer (Simulated end of day flash countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Voucher Copy Action
  const handleCopyVoucher = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('ZELVIRASALE');
      setCopiedVoucher(true);
      toast.success('Kode voucher "ZELVIRASALE" berhasil disalin! Dapatkan ekstra diskon 15%');
      setTimeout(() => setCopiedVoucher(false), 3000);
    }
  };

  // 1. Process & extract Sale products
  const saleProducts = useMemo(() => {
    const normalize = (val?: string) => (val || '').toUpperCase().replace(/[\s-]+/g, '_').trim();
    const effectiveCatalog = allCatalogProducts.length > 0 ? allCatalogProducts : internalCatalog;

    // From CMS items with tag SALE or PROMO
    const matchedCms = cmsItems
      .filter((item) => (normalize(item.tag) === 'SALE' || normalize(item.tag) === 'PROMO') && item.product)
      .map((item, idx) => {
        const prod = item.product!;
        const price = prod.price || 149000;
        const originalPrice =
          prod.originalPrice && prod.originalPrice > price
            ? prod.originalPrice
            : Math.round(price * (1.35 + (idx % 3) * 0.1));
        const discountPct = Math.round(((originalPrice - price) / originalPrice) * 100);

        return {
          ...prod,
          price,
          originalPrice,
          badgeText: item.badgeText || `${discountPct}% OFF`,
          variants: prod.variants || [],
          imageUrl: item.imageUrl || prod.imageUrl,
        };
      });

    let baseList: Product[] = [...matchedCms];

    // Fallback: Pick catalog products if CMS has NO items
    if (baseList.length === 0 && effectiveCatalog.length > 0) {
      const candidates = effectiveCatalog;
      const discounted = candidates.filter(
        (p) => p.originalPrice && p.price && p.originalPrice > p.price
      );

      const itemsToAdd = (discounted.length >= 4 ? discounted : candidates).slice(0, 5).map((p, idx) => {
        const price = p.price || 149000;
        const originalPrice =
          p.originalPrice && p.originalPrice > price
            ? p.originalPrice
            : Math.round(price * (1.3 + (idx % 4) * 0.15));

        const discountPct = Math.round(((originalPrice - price) / originalPrice) * 100);

        return {
          ...p,
          price,
          originalPrice,
          badgeText: `${discountPct}% OFF`,
          variants: p.variants || [],
          imageUrl: p.imageUrl,
        };
      });

      baseList = itemsToAdd;
    }

    return baseList;
  }, [cmsItems, allCatalogProducts, internalCatalog]);

  // 2. Filter products based on active tab and search query
  const filteredProducts = useMemo(() => {
    let list = [...saleProducts];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }

    // Tab filter
    if (activeTab === 'BIG_DISCOUNT') {
      const filtered = list.filter((p) => {
        if (!p.originalPrice || !p.price) return false;
        const pct = ((p.originalPrice - p.price) / p.originalPrice) * 100;
        return pct >= 30;
      });
      return filtered.length > 0 ? filtered : list;
    } else if (activeTab === 'BEST_VALUE') {
      const filtered = list.filter((p) => (p.price || 0) <= 250000);
      return filtered.length > 0 ? filtered : list;
    } else if (activeTab === 'TRENDING') {
      return [...list].reverse();
    }

    return list;
  }, [saleProducts, activeTab, searchQuery]);

  // Spotlight Product (Top high-discount product)
  const spotlightProduct = filteredProducts[0] || saleProducts[0];
  const companionProducts = filteredProducts.slice(1, 5);

  const calculateDiscountPercent = (orig?: number, curr?: number) => {
    if (!orig || !curr || orig <= curr) return 35;
    return Math.round(((orig - curr) / orig) * 100);
  };

  const spotlightDiscount = calculateDiscountPercent(
    spotlightProduct?.originalPrice,
    spotlightProduct?.price
  );

  const handleOpenCart = (product: Product) => {
    setSelectedProductForCart(product);
    setIsCartModalOpen(true);
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 relative bg-linear-to-b from-neutral-50 via-pink-50/20 to-white dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 border-b border-neutral-200/80 dark:border-white/10 overflow-hidden"
    >
      {/* Dynamic Background Mesh & Glowing Orbs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-linear-to-br from-amber-400/10 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-125 h-125 bg-linear-to-tr from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Header & Banner Area */}
        <div className="promo-header flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-white/10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                <Flame size={14} className="fill-white" />
                Special Offers &amp; Promo
              </span>

              {/* Live Ticking Countdown Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-xs font-semibold text-neutral-800 dark:text-slate-200 shadow-sm">
                <Clock size={13} className="text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Berakhir dalam:</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              PROMO SALE &amp; SPECIAL OFFERS
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl font-medium">
              Koleksi diskon eksklusif hingga 70% dengan stok terbatas. Dapatkan busana favorit Anda dengan harga hemat hari ini!
            </p>
          </div>

          {/* Interactive Coupon Box */}
          <div className="bg-linear-to-br from-amber-500/10 via-rose-500/10 to-purple-500/10 dark:from-amber-900/20 dark:to-purple-900/20 p-4 sm:p-5 rounded-3xl border border-amber-300/40 dark:border-amber-700/40 backdrop-blur-md shadow-lg max-w-md w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <Sparkles size={14} />
                <span>Kupon Spesial Hari Ini</span>
              </div>
              <div className="text-base font-bold tracking-wider text-neutral-900 dark:text-white font-mono">
                ZELVIRASALE
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-slate-400">
                Diskon ekstra 15% tanpa minimum order
              </div>
            </div>

            <button
              onClick={handleCopyVoucher}
              aria-label="Salin Kode voucher ZELVIRASALE"
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95"
            >
              {copiedVoucher ? (
                <>
                  <Check size={14} className="stroke-3" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-100/80 dark:bg-slate-900/80 rounded-2xl border border-neutral-200/60 dark:border-white/10 backdrop-blur-md">
            {[
              { id: 'ALL', label: '🔥 Semua Promo' },
              { id: 'BIG_DISCOUNT', label: '⚡ Diskon > 50%' },
              { id: 'BEST_VALUE', label: '💎 Super Hemat (<200k)' },
              { id: 'TRENDING', label: '✨ Paling Diminati' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FilterTab)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                      ? 'bg-linear-to-r from-rose-500 to-pink-600 text-white shadow-md'
                      : 'text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari promo produk..."
              className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm transition-all text-neutral-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian promo"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ─── UNIQUE ASYMMETRIC BENTO GRID ──────────────────────────────── */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-neutral-200/60 dark:border-white/10 p-8 shadow-sm">
            <Zap size={44} className="mx-auto text-amber-400 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Tidak ada promo yang cocok</h3>
            <p className="text-neutral-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Coba ganti filter atau kata kunci pencarian Anda untuk melihat produk sale lainnya.
            </p>
            <button
              onClick={() => {
                setActiveTab('ALL');
                setSearchQuery('');
              }}
              className="mt-5 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all"
            >
              Tampilkan Semua Promo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* 1. SPOTLIGHT HERO CARD (Col Span 7) */}
            {spotlightProduct && (
              <div
                className={`${companionProducts.length === 0 ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-7'} promo-spotlight group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-neutral-200/80 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-500/40 shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(244,63,94,0.25)] transition-all duration-300 flex flex-col justify-between overflow-hidden`}
              >
                {/* Glowing Aura on Hover */}
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/25 transition-all duration-700" />

                <div className="relative z-10 space-y-6">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 bg-linear-to-r from-rose-500 to-pink-600 text-white rounded-full text-xs font-semibold shadow-sm flex items-center gap-1.5 animate-pulse">
                        <Flame size={13} className="fill-white" />
                        MEGA DEAL OF THE DAY
                      </span>
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold">
                        -{spotlightDiscount}% DISKON
                      </span>
                    </div>

                    <button
                      onClick={() => toggleWishlist(spotlightProduct.id)}
                      aria-label="Wishlist deal"
                      className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-all border border-neutral-200/60 dark:border-white/10 group/btn"
                    >
                      <Heart
                        size={18}
                        className={`transition-colors ${isInWishlist(spotlightProduct.id)
                            ? 'fill-rose-500 text-rose-500'
                            : 'text-neutral-500 dark:text-slate-400 group-hover/btn:text-rose-500'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Spotlight Image & Visual Preview */}
                  <div className="relative aspect-16/10 sm:aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100 dark:bg-slate-800 border border-neutral-200/60 dark:border-white/10">
                    <Link href={`/products/${spotlightProduct.slug}`} className="block w-full h-full relative">
                      <Image
                        src={formatImageUrl(spotlightProduct.imageUrl || spotlightProduct.img || '')}
                        alt={spotlightProduct.name || 'Promo Deal of the Day'}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        loading="lazy"
                        quality={70}
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                    </Link>

                    {/* Savings Tag Floating Overlay */}
                    <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-neutral-200/60 dark:border-white/10 flex items-center gap-2">
                      <TrendingDown size={16} className="text-emerald-600" />
                      <div className="text-xs font-semibold text-neutral-800 dark:text-white">
                        Hemat Rp {((spotlightProduct.originalPrice || 250000) - (spotlightProduct.price || 120000)).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Product Info & Stock Urgency */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-slate-400">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span>4.9 (1.2k+ Ulasan Puas)</span>
                        <span>•</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Ready Stock</span>
                      </div>

                      <Link href={`/products/${spotlightProduct.slug}`}>
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                          {spotlightProduct.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Stock Urgency Progress Bar */}
                    <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/20 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1">
                          <Flame size={14} />
                          Hampir Habis! Tersisa 4 item promo
                        </span>
                        <span className="text-neutral-700 dark:text-slate-300">Terjual 84%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-amber-500 via-rose-500 to-pink-600 rounded-full w-[84%]" />
                      </div>
                    </div>

                    {/* Price Breakdown & Quick Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-600 dark:text-slate-400 line-through">
                            Rp {(spotlightProduct.originalPrice || 299000).toLocaleString('id-ID')}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-md">
                            Save {spotlightDiscount}%
                          </span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
                          Rp {(spotlightProduct.price || 99000).toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/products/${spotlightProduct.slug}`}
                          aria-label={`Detail ${spotlightProduct.name}`}
                          className="px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-800 dark:text-white font-semibold text-xs transition-all flex items-center gap-1.5"
                        >
                          <Eye size={15} />
                          <span>Detail</span>
                        </Link>

                        <button
                          onClick={() => handleOpenCart(spotlightProduct)}
                          aria-label={`Klaim Promo Ini - ${spotlightProduct.name}`}
                          className="px-6 py-3 rounded-2xl bg-linear-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                          <ShoppingBag size={16} />
                          <span>Klaim Promo Ini</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. COMPANION BENTO CARDS (Col Span 5 - 2x2 Grid) */}
            {companionProducts.length > 0 && (
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {companionProducts.map((product, idx) => {
                  const discount = calculateDiscountPercent(product.originalPrice, product.price);
                  const isWish = isInWishlist(product.id);

                  return (
                    <div
                      key={product.id || idx}
                      className="promo-companion-card group relative bg-white dark:bg-slate-900 rounded-4xl p-4 sm:p-5 border border-neutral-200/70 dark:border-white/10 hover:border-pink-300 dark:hover:border-pink-500/40 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Badge & Wishlist */}
                      <div className="flex items-center justify-between mb-3 z-10">
                        <span className="px-2.5 py-1 bg-linear-to-r from-rose-500 to-amber-500 text-white text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-sm">
                          -{discount}%
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

                      {/* Image */}
                      <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-slate-800/60 mb-4">
                        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
                          <Image
                            src={formatImageUrl(product.imageUrl || product.img || '')}
                            alt={product.name || 'Produk Promo'}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            loading="lazy"
                            quality={70}
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
                          />
                        </Link>

                        {/* Quick Buy Button on Hover */}
                        <button
                          onClick={() => handleOpenCart(product)}
                          aria-label={`+ Keranjang ${product.name}`}
                          className="absolute bottom-2.5 left-2.5 right-2.5 py-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-neutral-900 dark:text-white font-semibold text-xs shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-rose-500 hover:text-white flex items-center justify-center gap-1.5 backdrop-blur-md"
                        >
                          <ShoppingBag size={14} />
                          <span>+ Keranjang</span>
                        </button>
                      </div>

                      {/* Content & Pricing */}
                      <div className="space-y-2">
                        <Link href={`/products/${product.slug}`}>
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                        </Link>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            {product.originalPrice && product.originalPrice > (product.price || 0) && (
                              <span className="text-[10px] font-medium text-neutral-600 dark:text-slate-400 line-through">
                                Rp {product.originalPrice.toLocaleString('id-ID')}
                              </span>
                            )}
                            <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                              Rp {(product.price || 0).toLocaleString('id-ID')}
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenCart(product)}
                            aria-label={`+ Beli ${product.name}`}
                            className="text-rose-600 dark:text-rose-400 hover:text-rose-700 text-xs font-semibold hover:underline"
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

        {/* Bottom Banner & Explore Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-200/70 dark:border-white/10">
          <div className="flex items-center gap-3 text-xs font-semibold text-neutral-500 dark:text-slate-400">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Semua produk promo dijamin 100% Original &amp; Garansi Retur 7 Hari</span>
          </div>

          <Link
            href="/deals"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-800 dark:text-white hover:text-rose-600 border border-neutral-200/80 dark:border-white/10 text-xs font-semibold shadow-sm transition-all group"
          >
            <span>Lihat Semua Promo &amp; Deals ({saleProducts.length} Produk)</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
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
