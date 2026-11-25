'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, X, ArrowUpDown, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import { ProductService } from '@/services/product.service';
import { CategoryService } from '@/services/category.service';
import { Product } from '@/types/product';
import { Category } from '@/types/category';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Terbaru', desc: 'Produk rilis paling akhir' },
  { value: 'popular', label: 'Terlaris', desc: 'Paling banyak diminati & ulasan terbaik' },
  { value: 'price-asc', label: 'Harga: Termurah', desc: 'Harga paling hemat ke tinggi' },
  { value: 'price-desc', label: 'Harga: Termahal', desc: 'Harga premium ke hemat' },
  { value: 'name-asc', label: 'Nama: A - Z', desc: 'Urutan abjad awal ke akhir' },
  { value: 'name-desc', label: 'Nama: Z - A', desc: 'Urutan abjad akhir ke awal' },
];

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string>('Semua Produk');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('latest');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await CategoryService.getAll();
        setCategories(catRes.content || (Array.isArray(catRes) ? catRes : []));
      } catch (e) {
        console.warn('Failed to fetch categories', e);
      }
    };
    fetchCategories();
  }, []);

  // Sync with URL search params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchTerm(q);
    }

    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat);
    } else {
      setActiveCategory(null);
      setActiveCategoryName('Semua Produk');
    }

    const sort = searchParams.get('sort');
    if (sort) {
      if (sort === 'new') setSortBy('latest');
      else setSortBy(sort);
    }
  }, [searchParams]);

  // Sync active category name
  useEffect(() => {
    if (activeCategory === null) {
      setActiveCategoryName('Semua Produk');
    } else {
      const cat = categories.find((c) => String(c.id) === String(activeCategory));
      if (cat) {
        setActiveCategoryName(cat.name);
      }
    }
  }, [categories, activeCategory]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Products based on search term & category filter
  useEffect(() => {
    let isCancelled = false;

    const loadProducts = async () => {
      setIsSearching(true);
      try {
        let response;
        if (debouncedSearchTerm !== '') {
          response = await ProductService.getAll(0, 40, debouncedSearchTerm, activeCategory || undefined);
        } else {
          response = await ProductService.getAll(0, 40, '', activeCategory || undefined);
        }

        if (!isCancelled) {
          const list = response?.content || (Array.isArray(response) ? response : []);
          setProducts(list);
        }
      } catch (e) {
        console.error('Failed to load products', e);
        if (!isCancelled) setProducts([]);
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchTerm, activeCategory]);

  // Real-time Sort By sorting logic (A-Z, Z-A, terbaru, terlaris, termurah, termahal)
  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name, 'id', { sensitivity: 'base' }));
      case 'price-asc':
        return list.sort((a, b) => {
          const priceA = a.price || a.variants?.[0]?.price || 0;
          const priceB = b.price || b.variants?.[0]?.price || 0;
          return priceA - priceB;
        });
      case 'price-desc':
        return list.sort((a, b) => {
          const priceA = a.price || a.variants?.[0]?.price || 0;
          const priceB = b.price || b.variants?.[0]?.price || 0;
          return priceB - priceA;
        });
      case 'popular':
        return list.sort((a, b) => {
          const ratingA = (a as any).rating || 4.5;
          const ratingB = (b as any).rating || 4.5;
          return ratingB - ratingA;
        });
      case 'latest':
      default:
        return list.sort((a, b) => {
          const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : a.id || 0;
          const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : b.id || 0;
          return timeB - timeA;
        });
    }
  }, [products, sortBy]);

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-neutral-900 dark:text-slate-100">
      {/* Page Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200/50 dark:border-pink-800/40 mb-3">
          <Sparkles size={11} className="fill-pink-500 text-pink-500" />
          Katalog Busana &amp; Gaya Hidup
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3">
          Eksplorasi <span className="bg-linear-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent italic">Koleksi Zelvira</span>
        </h1>
        <p className="text-neutral-500 dark:text-slate-400 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
          Temukan ragam busana muslim, gamis modern, hijab premium, dan aksesoris eksklusif yang dirancang untuk kesempurnaan gaya Anda.
        </p>
      </div>

      {/* Toolbar: Search & Sort By Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-20 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md py-4 px-4 sm:px-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400 group-focus-within:text-pink-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Cari dress, hijab, blouse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-neutral-100/80 dark:bg-slate-800/80 border-none rounded-2xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-pink-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Action Buttons: Sort Dropdown & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          {/* Quick Sort Selector (Desktop & Tablet) */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-2 bg-neutral-100/80 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl text-xs font-bold text-neutral-700 dark:text-slate-300 border border-neutral-200/50 dark:border-white/5">
              <ArrowUpDown size={14} className="text-pink-500 shrink-0" />
              <span className="hidden sm:inline text-neutral-400">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-neutral-900 dark:text-white focus:outline-none cursor-pointer pr-1"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-neutral-900 dark:text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-neutral-100/80 dark:bg-slate-800/80 rounded-2xl text-xs font-bold text-neutral-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 transition-colors border border-neutral-200/50 dark:border-white/5"
          >
            <Filter size={14} />
            <span>Kategori</span>
            {activeCategory && (
              <span className="w-2 h-2 rounded-full bg-pink-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content: Sidebar Categories + Products Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Category Sidebar Filter (Desktop) */}
        <aside className={`w-full lg:w-64 space-y-6 shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-slate-500 mb-3">
              Pilihan Kategori
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex items-center justify-between w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${activeCategory === null
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-900/40'
                    : 'text-neutral-600 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                  }`}
              >
                <span>Semua Produk</span>
                {activeCategory === null && <Check size={14} className="text-pink-500" />}
              </button>
              {categories.map((cat) => {
                const isSelected = String(activeCategory) === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(String(cat.id))}
                    className={`flex items-center justify-between w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${isSelected
                        ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-900/40'
                        : 'text-neutral-600 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <Check size={14} className="text-pink-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By Interactive Radio Selector in Sidebar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 shadow-sm space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-slate-500 mb-3 flex items-center justify-between">
              <span>Urutkan Hasil (Sort By)</span>
              <ArrowUpDown size={12} className="text-pink-500" />
            </h3>
            <div className="space-y-1.5">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`flex items-center justify-between w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${isSelected
                        ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-900/40 shadow-xs'
                        : 'text-neutral-600 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <div>
                      <span className="block font-bold">{opt.label}</span>
                      <span className="block text-[10px] text-neutral-400 dark:text-slate-500 font-medium">{opt.desc}</span>
                    </div>
                    {isSelected && <CheckCircle2 size={15} className="text-pink-500 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          {/* Active Filters Summary Header */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-200/60 dark:border-white/10">
            <div className="text-xs font-semibold text-neutral-500 dark:text-slate-400">
              Kategori: <strong className="text-neutral-900 dark:text-white font-bold">{activeCategoryName}</strong>
              {debouncedSearchTerm && (
                <> • Hasil pencarian: &quot;<strong className="text-pink-600 dark:text-pink-400 font-bold">{debouncedSearchTerm}</strong>&quot;</>
              )}
            </div>
            <div className="text-xs font-bold text-neutral-700 dark:text-slate-300">
              Total {sortedProducts.length} Produk
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-neutral-100 dark:bg-slate-800/60 rounded-[2rem] border border-neutral-200/60 dark:border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {sortedProducts.map((p) => (
                    <motion.div
                      key={`${p.id}-${sortBy}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {sortedProducts.length === 0 && (
                <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-neutral-200/80 dark:border-white/10 shadow-sm p-8">
                  <div className="w-20 h-20 bg-pink-50 dark:bg-pink-950/30 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Produk Tidak Ditemukan</h3>
                  <p className="text-neutral-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto">
                    {debouncedSearchTerm
                      ? `Tidak ada hasil untuk kata kunci "${debouncedSearchTerm}". Coba kata kunci lain atau reset filter.`
                      : 'Belum ada produk untuk kategori yang dipilih.'}
                  </p>
                  {(debouncedSearchTerm || activeCategory) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setActiveCategory(null);
                      }}
                      className="mt-6 px-6 py-2.5 bg-neutral-900 dark:bg-pink-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:opacity-90"
                    >
                      Reset Semua Filter
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
