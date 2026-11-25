'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/contexts/WishlistContext';
import { Product, ProductCardProps } from '@/types/product';
import { formatImageUrl } from '@/lib/url-utils';

const AddToCartModal = dynamic(() => import('./AddToCartModal'), {
  ssr: false,
});

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  return (
    <>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        className="group relative bg-white dark:bg-slate-900/90 rounded-[2rem] overflow-hidden border border-neutral-100 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-500/40 transition-all duration-500 shadow-sm hover:shadow-[0_20px_60px_-10px_rgba(236,72,153,0.25)]"
      >
        {/* IMAGE */}
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800/60">
          <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
            {(product.thumbnailUrl || product.thumbnail || product.imageUrl || product.img) ? (
              <Image
                src={formatImageUrl(product.thumbnailUrl || product.thumbnail || product.imageUrl || product.img)}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={70}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                <ShoppingBag size={40} className="opacity-30" />
              </div>
            )}
          </Link>

          {/* GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

          {/* BADGES */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {(product as any).badgeText && (
              <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide bg-linear-to-r from-pink-500 to-rose-600 text-white rounded-full shadow-md shadow-pink-500/20">
                {(product as any).badgeText}
              </span>
            )}
            {product.isActive && !(product as any).badgeText && (
              <span className="px-3 py-1 text-[10px] font-semibold bg-white/95 dark:bg-slate-900/95 text-neutral-800 dark:text-white backdrop-blur rounded-full border border-neutral-200/60 dark:border-white/10">
                ACTIVE
              </span>
            )}
          </div>

          {/* WISHLIST */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            aria-label="Wishlist"
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition border border-neutral-200/50 dark:border-white/10"
          >
            <Heart
              size={18}
              className={`transition ${isWishlisted
                  ? 'fill-pink-500 text-pink-500'
                  : 'text-neutral-500 dark:text-slate-400'
                }`}
            />
          </button>

          {/* QUICK ACTION */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                setIsCartModalOpen(true);
              }}
              className="flex-1 py-3 bg-white dark:bg-slate-800 text-neutral-900 dark:text-white rounded-xl font-semibold text-xs sm:text-sm shadow-lg hover:bg-pink-500 hover:text-white dark:hover:bg-pink-500 transition border border-neutral-200/60 dark:border-white/10"
            >
              Add to Cart
            </motion.button>

            <Link
              href={`/products/${product.slug}`}
              aria-label={`Quick View ${product.name}`}
              className="w-12 h-12 bg-white dark:bg-slate-800 text-neutral-900 dark:text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-neutral-900 hover:text-white dark:hover:bg-pink-500 transition border border-neutral-200/60 dark:border-white/10"
            >
              <Eye size={18} />
            </Link>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-3">
          {/* TITLE */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-slate-100 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {product.variants && product.variants.length > 1 ? (
                <>
                  <span className="text-[11px] font-medium text-neutral-600 dark:text-slate-400">Mulai dari</span>
                  <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                    Rp {Math.min(...product.variants.map((v) => v.price)).toLocaleString('id-ID')}
                  </span>
                </>
              ) : (
                <div className="flex flex-col">
                  {product.originalPrice && product.price && product.originalPrice > product.price && (
                    <span className="text-[10px] font-medium text-neutral-600 dark:text-slate-400 line-through">
                      Rp {product.originalPrice.toLocaleString('id-ID')}
                    </span>
                  )}
                  <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                    Rp {(product.price || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCartModalOpen(true)}
              aria-label={`+ Beli ${product.name}`}
              className="text-pink-700 dark:text-pink-400 text-xs font-semibold hover:text-pink-800 dark:hover:text-pink-300 hover:underline"
            >
              + Beli
            </button>
          </div>

          {/* COLORS */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {product.variants?.reduce((acc: any[], v) => {
              if (v.hexColor && !acc.some((a) => a.hexColor === v.hexColor)) {
                acc.push(v);
              }
              return acc;
            }, []).slice(0, 5).map((v, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-full border border-neutral-200 dark:border-white/20 shadow-sm"
                style={{ backgroundColor: v.hexColor }}
                title={v.color}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {isCartModalOpen && (
        <AddToCartModal
          isOpen={isCartModalOpen}
          onClose={() => setIsCartModalOpen(false)}
          product={product}
        />
      )}
    </>
  );
}