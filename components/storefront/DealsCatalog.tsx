'use client';

import { useState, useMemo } from 'react';
import { Tag, Sparkles, Flame, Percent, Zap, Search, X, Check, Copy, ArrowRight, ShieldCheck } from 'lucide-react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { toast } from 'sonner';

interface DealsCatalogProps {
  products: Product[];
}

type FilterTab = 'ALL' | 'BIG_DISCOUNT' | 'BEST_VALUE' | 'POPULAR';

export default function DealsCatalog({ products = [] }: DealsCatalogProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyVoucher = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('ZELVIRADEALS');
      setCopied(true);
      toast.success('Kode voucher "ZELVIRADEALS" berhasil disalin! Dapatkan ekstra diskon 20%');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Process & Filter Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }

    // Tab filter
    if (activeTab === 'BIG_DISCOUNT') {
      list = list.filter((p) => {
        if (!p.originalPrice || !p.price) return false;
        const discountPct = ((p.originalPrice - p.price) / p.originalPrice) * 100;
        return discountPct >= 40;
      });
    } else if (activeTab === 'BEST_VALUE') {
      list = list.filter((p) => (p.price || 0) <= 200000);
    } else if (activeTab === 'POPULAR') {
      list = list.slice(0, 12);
    }

    return list;
  }, [products, activeTab, searchQuery]);

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Interactive Voucher Card */}
      <div className="bg-linear-to-r from-purple-900/90 via-pink-900/80 to-slate-900 rounded-[2.5rem] p-6 sm:p-8 text-white border border-purple-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[11px] font-semibold text-pink-300 border border-white/10">
            <Sparkles size={13} className="text-pink-400 fill-pink-400" />
            <span>Kupon Diskon Ekstra 20%</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Gunakan Kode Voucher Spesial Deals
          </h3>
          <p className="text-sm text-white/70 font-medium">
            Salin kode kupon di bawah ini dan terapkan pada saat checkout untuk mendapatkan potongan harga langsung tanpa minimum belanja.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-white/10 dark:bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/20 shrink-0">
          <div className="px-4 py-2 font-mono font-bold text-base sm:text-lg tracking-wider text-pink-300">
            ZELVIRADEALS
          </div>
          <button
            onClick={handleCopyVoucher}
            className="px-5 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            {copied ? (
              <>
                <Check size={14} className="stroke-[3]" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Salin Kupon</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-white/10">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-100/80 dark:bg-slate-900/80 rounded-2xl border border-neutral-200/60 dark:border-white/10">
          {[
            { id: 'ALL', label: '🔥 Semua Promo', count: products.length },
            { id: 'BIG_DISCOUNT', label: '⚡ Diskon > 40%' },
            { id: 'BEST_VALUE', label: '💎 Super Hemat (<200rb)' },
            { id: 'POPULAR', label: '✨ Terpopuler' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                    ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari promo deals..."
            className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500/20 shadow-sm transition-all text-neutral-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-neutral-200/60 dark:border-white/10 p-8 shadow-sm">
          <Tag size={44} className="mx-auto text-purple-400 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Tidak ada produk deals yang cocok</h3>
          <p className="text-neutral-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Coba pilih filter lain atau gunakan kata kunci pencarian yang berbeda untuk menemukan produk diskon lainnya.
          </p>
          <button
            onClick={() => {
              setActiveTab('ALL');
              setSearchQuery('');
            }}
            className="mt-5 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-all"
          >
            Tampilkan Semua Deals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={`deals-${product.id}`} product={product} />
          ))}
        </div>
      )}

      {/* Assurance Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-100 dark:border-white/10 text-neutral-500 dark:text-slate-400 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Produk Promo 100% Original &amp; Bergaransi Resmi Zelvira</span>
        </div>
        <span>Total {filteredProducts.length} Produk Deals Tersedia</span>
      </div>
    </section>
  );
}
