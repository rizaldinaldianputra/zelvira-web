'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Layers,
  Check,
  Star,
  Shirt,
  Compass,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Product } from '@/types/product';
import { ContentItem } from '@/types/content';
import { formatImageUrl } from '@/lib/url-utils';
import { useWishlist } from '@/contexts/WishlistContext';

const AddToCartModal = dynamic(() => import('./AddToCartModal'), {
  ssr: false,
});

interface NewArrivalsSectionProps {
  cmsItems?: ContentItem[];
  allCatalogProducts?: Product[];
}

type CategoryTab = 'ALL' | 'DRESS' | 'TOPS' | 'HIJAB' | 'OUTER';

export default function NewArrivalsSection({
  cmsItems = [],
  allCatalogProducts = [],
}: NewArrivalsSectionProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  // State
  const [activeTab, setActiveTab] = useState<CategoryTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [activeColorIdx, setActiveColorIdx] = useState<number>(0);

  const sectionRef = useRef<HTMLDivElement>(null);

  // 1. Process & extract New Arrival products
  const newProducts = useMemo(() => {
    const normalize = (val?: string) => (val || '').toUpperCase().replace(/[\s-]+/g, '_').trim();

    // From CMS items with tag NEW_ARRIVAL or NEW
    const matchedCms = cmsItems
      .filter((item) => (normalize(item.tag) === 'NEW_ARRIVAL' || normalize(item.tag) === 'NEW') && item.product)
      .map((item) => ({
        ...item.product!,
        badgeText: item.badgeText || 'New Arrival',
        variants: item.product!.variants || [],
        imageUrl: item.imageUrl || item.product!.imageUrl,
      }));

    let baseList: Product[] = [...matchedCms];

    // Fallback: Pick catalog products ONLY if CMS has NO items
    if (baseList.length === 0 && allCatalogProducts.length > 0) {
      const candidates = [...allCatalogProducts].reverse();

      const itemsToAdd = candidates.slice(0, 5).map((p) => ({
        ...p,
        badgeText: 'New Season',
        variants: p.variants || [],
        imageUrl: p.imageUrl,
      }));

      baseList = itemsToAdd;
    }

    return baseList;
  }, [cmsItems, allCatalogProducts]);

  // 2. Filter products based on search and category tab
  const filteredProducts = useMemo(() => {
    let list = [...newProducts];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }

    // Category filter
    if (activeTab === 'DRESS') {
      list = list.filter((p) => {
        const name = p.name?.toLowerCase() || '';
        return name.includes('dress') || name.includes('gamis') || name.includes('abaya') || name.includes('kaftan');
      });
    } else if (activeTab === 'TOPS') {
      list = list.filter((p) => {
        const name = p.name?.toLowerCase() || '';
        return name.includes('blouse') || name.includes('tunik') || name.includes('kemeja') || name.includes('top');
      });
    } else if (activeTab === 'HIJAB') {
      list = list.filter((p) => {
        const name = p.name?.toLowerCase() || '';
        return name.includes('hijab') || name.includes('pashmina') || name.includes('scarf') || name.includes('kerudung');
      });
    } else if (activeTab === 'OUTER') {
      list = list.filter((p) => {
        const name = p.name?.toLowerCase() || '';
        return name.includes('outer') || name.includes('cardigan') || name.includes('blazer') || name.includes('jacket');
      });
    }

    return list;
  }, [newProducts, activeTab, searchQuery]);

  // 5 items per page for the 3+2 Atelier Lookbook layout
  const pageSize = 5;
  const totalElements = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const startIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);

  const displayedProducts = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  // Split into Row 1 (3 Vertical Editorial Cards) and Row 2 (2 Wide Horizontal Capsule Cards)
  const trioProducts = displayedProducts.slice(0, 3);
  const duoWideProducts = displayedProducts.slice(3, 5);

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

  // Extract real variants (colors & sizes) from the first product
  const card1Product = trioProducts[0];
  const heroColors = useMemo(() => {
    if (!card1Product?.variants || card1Product.variants.length === 0) {
      return [
        { name: 'Rose Petal', hex: '#FDA4AF' },
        { name: 'Oatmeal Beige', hex: '#E2D9C8' },
        { name: 'Midnight Navy', hex: '#1E293B' },
        { name: 'Sage Green', hex: '#A7F3D0' },
      ];
    }
    const map = new Map<string, string>();
    for (const v of card1Product.variants) {
      if (v.color) {
        map.set(v.color, v.hexColor || '#E2E8F0');
      }
    }
    const extracted = Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
    return extracted.length > 0 ? extracted : [{ name: 'Standar', hex: '#6366F1' }];
  }, [card1Product]);

  const availableSizes = useMemo(() => {
    if (!card1Product?.variants || card1Product.variants.length === 0) {
      return ['S', 'M', 'L', 'XL'];
    }
    const set = new Set<string>();
    for (const v of card1Product.variants) {
      if (v.size) set.add(v.size);
    }
    const extracted = Array.from(set);
    return extracted.length > 0 ? extracted : ['All Size'];
  }, [card1Product]);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 relative bg-linear-to-b from-white via-indigo-50/20 to-white dark:from-slate-950 dark:via-indigo-950/15 dark:to-slate-950 border-b border-neutral-200/80 dark:border-white/10 overflow-hidden scroll-mt-20"
    >
      {/* Ambient Lighting Accents */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-125 h-125 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Atelier Stripe Lines */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 40px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Header & Editorial Lookbook Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-white/10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-sm">
                <Sparkles size={14} className="fill-white" />
                Runway Atelier • SS 2026
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                Fresh Drop Minggu Ini
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              NEW ARRIVALS - RILISAN TERBARU
            </h2>
            <p className="text-neutral-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl font-medium">
              Eksplorasi kreasi busana muslim &amp; gaya modern terbaru dengan material airy-breathable premium dan siluet kontemporer.
            </p>
          </div>

          {/* Search Box & Summary Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
                placeholder="Cari rilisan terbaru..."
                className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all text-neutral-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>
                Menampilkan <strong>{startIndex}-{endIndex}</strong> dari <strong>{totalElements}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Category Pills Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'ALL', label: '✨ Semua Rilisan' },
            { id: 'DRESS', label: '👗 Gamis & Dress' },
            { id: 'TOPS', label: '👚 Atasan & Tunik' },
            { id: 'HIJAB', label: '🧕 Hijab & Scarf' },
            { id: 'OUTER', label: '🧥 Outer & Blazer' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as CategoryTab);
                  setCurrentPage(0);
                }}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-neutral-600 dark:text-slate-300 hover:border-indigo-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNewArrivalTab"
                    className="absolute inset-0 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── ATELIER LOOKBOOK (3 VERTICAL + 2 WIDE HORIZONTAL) ──────────── */}
        {displayedProducts.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-neutral-200/60 dark:border-white/10 p-8 shadow-sm">
            <Sparkles size={40} className="mx-auto text-indigo-400 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Tidak ada rilisan baru yang cocok</h3>
            <p className="text-neutral-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Coba ganti filter kategori atau kata kunci pencarian Anda untuk melihat produk lainnya.
            </p>
            <button
              onClick={() => {
                setActiveTab('ALL');
                setSearchQuery('');
              }}
              className="mt-5 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all"
            >
              Tampilkan Semua Rilisan
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* ── ROW 1: TRIO LOOKBOOK EDITORIAL (Vertical Portrait Cards) ── */}
            <div className={`grid grid-cols-1 ${trioProducts.length === 1 ? 'max-w-md mx-auto w-full' : trioProducts.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-6 sm:gap-8 items-stretch`}>
              {trioProducts.map((product, idx) => {
                const isFirst = idx === 0;
                const isWish = isInWishlist(product.id);

                return (
                  <div
                    key={product.id || idx}
                    className={`group relative bg-white dark:bg-slate-900 rounded-[2.2rem] p-5 sm:p-6 border transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl ${
                      isFirst
                        ? 'border-indigo-400/80 dark:border-indigo-500/50 hover:border-indigo-500'
                        : 'border-neutral-200/80 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40'
                    }`}
                  >
                    {/* Glow aura on hover */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

                    <div className="relative z-10 space-y-4">
                      {/* Top Header Tags */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-full text-[10px] font-semibold shadow-sm flex items-center gap-1">
                            <Sparkles size={11} className="fill-white" />
                            {isFirst ? 'Signature Look' : `Look 0${idx + 1}`}
                          </span>
                          <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-semibold border border-indigo-200/50">
                            Atelier Edit
                          </span>
                        </div>

                        <button
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={`Wishlist ${product.name}`}
                          className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-all border border-neutral-200/60 dark:border-white/10 group/btn"
                        >
                          <Heart
                            size={16}
                            className={`transition-colors ${
                              isWish
                                ? 'fill-rose-500 text-rose-500'
                                : 'text-neutral-500 dark:text-slate-400 group-hover/btn:text-rose-500'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Portrait Image Frame */}
                      <div className="relative aspect-3/4 w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-slate-800 border border-neutral-200/60 dark:border-white/10">
                        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
                          <Image
                            src={formatImageUrl(product.imageUrl || product.img || '')}
                            alt={product.name || 'Signature New Arrival'}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            loading="lazy"
                            quality={70}
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-106"
                          />
                        </Link>

                        {/* Floating Material Tag */}
                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-neutral-200/60 dark:border-white/10 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-800 dark:text-white">
                          <Shirt size={12} className="text-indigo-600 dark:text-indigo-400" />
                          <span>{product.material || 'Siluet Premium'}</span>
                        </div>

                        {/* Quick View Button on Image */}
                        <Link
                          href={`/products/${product.slug}`}
                          aria-label={`Lihat detail ${product.name}`}
                          className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-neutral-800 dark:text-white shadow-md hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Eye size={15} />
                        </Link>
                      </div>

                      {/* Details Area */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 dark:text-slate-400">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span>Koleksi Eksklusif Baru Rilis</span>
                          </div>
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        {/* Interactive Feature for Card #1: Color and Size Swatches */}
                        {isFirst ? (
                          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/30 space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-slate-400">
                              <span>Warna: {heroColors[activeColorIdx]?.name || heroColors[0]?.name || '-'}</span>
                              <div className="flex items-center gap-1.5">
                                {heroColors.map((c, i) => (
                                  <button
                                    key={c.name}
                                    onClick={() => setActiveColorIdx(i)}
                                    aria-label={`Pilih ${c.name}`}
                                    className={`w-4 h-4 rounded-full border transition-all ${
                                      activeColorIdx === i ? 'scale-125 border-indigo-600 shadow-sm' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-slate-400">
                              <span>Ukuran</span>
                              <div className="flex items-center gap-1">
                                {availableSizes.map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => setSelectedSize(s)}
                                    className={`w-5 h-5 rounded text-[10px] font-semibold transition-all ${
                                      selectedSize === s
                                        ? 'bg-neutral-900 text-white dark:bg-indigo-600'
                                        : 'bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 dark:text-slate-400">
                            <Compass size={13} className="text-indigo-500" />
                            <span>Potongan jahitan tailor-made rapi</span>
                          </div>
                        )}

                        {/* Price & Action */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                            Rp {(product.price || 179000).toLocaleString('id-ID')}
                          </div>

                          <button
                            onClick={() => handleOpenCart(product)}
                            aria-label={`+ Keranjang ${product.name}`}
                            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <ShoppingBag size={14} />
                            <span>+ Keranjang</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── ROW 2: CAPSULE COLLECTION DUO (2 Wide Horizontal Feature Cards) ── */}
            {duoWideProducts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {duoWideProducts.map((product, idx) => {
                  const isWish = isInWishlist(product.id);

                  return (
                    <div
                      key={product.id || idx}
                      className="group relative bg-white dark:bg-slate-900 rounded-[2.2rem] p-5 sm:p-6 border border-neutral-200/80 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-400 flex flex-col sm:flex-row gap-5 items-center overflow-hidden"
                    >
                      {/* Left: Aspect Square Image Frame */}
                      <div className="relative w-full sm:w-5/12 aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-slate-800 border border-neutral-200/60 dark:border-white/10 shrink-0">
                        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
                          <Image
                            src={formatImageUrl(product.imageUrl || product.img || '')}
                            alt={product.name || 'Capsule Collection'}
                            fill
                            sizes="(max-width: 640px) 100vw, 25vw"
                            loading="lazy"
                            quality={70}
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
                          />
                        </Link>

                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-linear-to-r from-purple-600 to-pink-600 text-[10px] font-semibold uppercase text-white shadow-sm">
                          Capsule Edit
                        </div>

                        <button
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={`Wishlist ${product.name}`}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-rose-50 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Heart
                            size={14}
                            className={isWish ? 'fill-rose-500 text-rose-500' : 'text-neutral-500 dark:text-slate-400'}
                          />
                        </button>
                      </div>

                      {/* Right: Content & Action */}
                      <div className="w-full sm:w-7/12 space-y-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-600 dark:text-slate-400">
                          <Layers size={12} className="text-purple-600" />
                          <span>{product.material || 'Material Sutra & Katun Alami'}</span>
                        </div>

                        <Link href={`/products/${product.slug}`}>
                          <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                            {product.name}
                          </h4>
                        </Link>

                        <p className="text-xs text-neutral-600 dark:text-slate-400 line-clamp-2">
                          Siluet kontemporer dengan perpaduan warna lembut, cocok untuk aktivitas kasual maupun formal elegan.
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/5">
                          <div className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                            Rp {(product.price || 169000).toLocaleString('id-ID')}
                          </div>

                          <button
                            onClick={() => handleOpenCart(product)}
                            aria-label={`+ Beli ${product.name}`}
                            className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <ShoppingBag size={14} />
                            <span>+ Beli</span>
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

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-neutral-200/70 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-semibold text-neutral-500 dark:text-slate-400">
              Halaman <strong className="text-neutral-900 dark:text-white">{currentPage + 1}</strong> dari{' '}
              <strong className="text-neutral-900 dark:text-white">{totalPages}</strong> (Total {totalElements} Rilisan Baru)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                aria-label="Prev Rilisan Baru"
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 shadow-sm transition-all"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                aria-label="Next Rilisan Baru"
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 shadow-sm transition-all"
              >
                <span>Next</span>
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
