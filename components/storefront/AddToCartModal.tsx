'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Product, ProductVariant, AddToCartModalProps } from '@/types/product';
import { ProductService } from '@/services/product.service';
import { toast } from 'sonner';
import { formatImageUrl } from '@/lib/url-utils';

export default function AddToCartModal({ isOpen, onClose, product }: AddToCartModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { addToCart } = useCart();
  const [loadedProduct, setLoadedProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const activeProduct = loadedProduct || product;
  const variants: ProductVariant[] = useMemo(() => {
    return activeProduct?.variants || [];
  }, [activeProduct]);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // When modal opens or product changes, sync options or fetch full product details if variants are missing
  useEffect(() => {
    if (!isOpen || !product) {
      setLoadedProduct(null);
      return;
    }

    setIsSuccess(false);
    setQuantity(1);

    if (product.variants && product.variants.length > 0) {
      setLoadedProduct(product);
      const first = product.variants[0];
      setSelectedColor(first.color || undefined);
      setSelectedSize(first.size || undefined);
    } else if (product.id) {
      setIsLoadingProduct(true);
      ProductService.getById(product.id)
        .then((full) => {
          if (full) {
            setLoadedProduct(full);
            if (full.variants && full.variants.length > 0) {
              const first = full.variants[0];
              setSelectedColor(first.color || undefined);
              setSelectedSize(first.size || undefined);
            }
          }
        })
        .catch((err) => {
          console.warn('[AddToCartModal] Failed to fetch product details:', err);
          setLoadedProduct(product);
        })
        .finally(() => {
          setIsLoadingProduct(false);
        });
    } else {
      setLoadedProduct(product);
    }
  }, [isOpen, product]);

  // Extract unique styles, colors, and sizes
  const uniqueGroups = useMemo(() => {
    return Array.from(new Set(variants.map((v) => v.groupName).filter(Boolean))) as string[];
  }, [variants]);

  // Find current selection group
  const currentVariant = useMemo(() => {
    if (!variants || variants.length === 0) return undefined;

    // 1. Exact match on both color and size
    const exact = variants.find(
      (v) => (v.color || undefined) === selectedColor && (v.size || undefined) === selectedSize
    );
    if (exact) return exact;

    // 2. Color match if selected
    if (selectedColor) {
      const colorMatch = variants.find((v) => (v.color || undefined) === selectedColor);
      if (colorMatch) return colorMatch;
    }

    // 3. Fallback to first available variant
    return variants[0];
  }, [variants, selectedColor, selectedSize]);

  const currentGroupName = currentVariant?.groupName || uniqueGroups[0] || '';

  const availableColors = useMemo(() => {
    const groupVariants = currentGroupName ? variants.filter((v) => v.groupName === currentGroupName) : variants;
    const uniqueColors = new Set(groupVariants.map((v) => v.color).filter(Boolean));
    return Array.from(uniqueColors) as string[];
  }, [variants, currentGroupName]);

  const availableSizes = useMemo(() => {
    const groupVariants = currentGroupName ? variants.filter((v) => v.groupName === currentGroupName) : variants;
    const colorVariants = selectedColor ? groupVariants.filter((v) => v.color === selectedColor) : groupVariants;
    const uniqueSizes = new Set(colorVariants.map((v) => v.size).filter(Boolean));
    return Array.from(uniqueSizes) as string[];
  }, [variants, currentGroupName, selectedColor]);

  // Update selected variant price
  const displayPrice = currentVariant?.price || activeProduct?.price || 0;

  const handleConfirm = async () => {
    if (!currentVariant) {
      toast.error('Varian yang dipilih tidak tersedia');
      return;
    }

    setIsSubmitting(true);
    try {
      await addToCart({
        productVariantId: currentVariant.id,
        quantity: quantity
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch {
      // Error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-950/70 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-neutral-200/80 dark:border-white/10"
        >
          {isSuccess ? (
            <div className="p-16 text-center flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20"
              >
                <CheckCircle2 size={40} className="text-white" />
              </motion.div>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Berhasil Masuk Keranjang!</h3>
              <p className="text-neutral-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Siap untuk checkout</p>
            </div>
          ) : (
            <>
              <button 
                onClick={onClose} 
                aria-label="Tutup"
                className="absolute top-6 right-6 p-2.5 rounded-2xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 transition-all z-20 group"
              >
                <X size={18} className="text-neutral-500 dark:text-slate-400 group-hover:text-neutral-900 dark:group-hover:text-white" />
              </button>

              <div className="flex flex-col md:flex-row h-full">
                {/* Image Section */}
                <div className="w-full md:w-5/12 aspect-square p-6">
                  <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-neutral-100 dark:bg-slate-800 shadow-inner">
                    <img 
                      src={formatImageUrl(currentVariant?.imageUrl || activeProduct.imageUrl || (activeProduct as any).img)} 
                      alt={activeProduct.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                </div>
  
                {/* Details Section */}
                <div className="w-full md:w-7/12 p-6 md:pl-2 overflow-y-auto max-h-[80vh] flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight leading-snug mb-1.5">{activeProduct.name}</h2>
                    <p className="text-2xl font-black text-pink-600 dark:text-pink-400">Rp {displayPrice.toLocaleString('id-ID')}</p>
                  </div>

                  <div className="space-y-6 flex-1">
                    {isLoadingProduct ? (
                      <div className="py-8 flex items-center justify-center gap-2 text-xs font-bold text-neutral-500">
                        <Loader2 size={16} className="animate-spin text-pink-500" />
                        <span>Memuat pilihan varian produk...</span>
                      </div>
                    ) : (
                      <>
                        {/* Styles */}
                        {uniqueGroups.length > 1 && (
                          <div>
                            <p className="text-[10px] font-black uppercase text-neutral-400 dark:text-slate-500 tracking-[0.2em] mb-3">Pilihan Model / Gaya</p>
                            <div className="flex flex-wrap gap-2">
                              {uniqueGroups.map((group) => (
                                <button
                                  key={group}
                                  onClick={() => {
                                    const firstInGroup = variants.find((v) => v.groupName === group);
                                    if (firstInGroup) {
                                      setSelectedColor(firstInGroup.color || undefined);
                                      setSelectedSize(firstInGroup.size || undefined);
                                    }
                                  }}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                                    currentGroupName === group 
                                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-pink-500 dark:bg-pink-600 shadow-sm' 
                                      : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-slate-400 hover:border-neutral-300'
                                  }`}
                                >
                                  {group}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
      
                        {/* Colors */}
                        {availableColors.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black uppercase text-neutral-400 dark:text-slate-500 tracking-[0.2em] mb-3">
                              Warna: <span className="text-pink-600 dark:text-pink-400 font-bold">{selectedColor || availableColors[0]}</span>
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                              {availableColors.map((color) => {
                                const variant = variants.find((v) => v.color === color && v.groupName === currentGroupName);
                                return (
                                  <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-9 h-9 rounded-full border-2 p-0.5 transition-all flex items-center justify-center ${
                                      selectedColor === color 
                                        ? 'border-pink-500 shadow-md shadow-pink-500/20 scale-105' 
                                        : 'border-transparent hover:border-neutral-300 dark:hover:border-white/20'
                                    }`}
                                  >
                                    {variant?.hexColor ? (
                                      <div 
                                        className="w-full h-full rounded-full border border-neutral-200 dark:border-white/20" 
                                        style={{ backgroundColor: variant.hexColor }} 
                                        title={color}
                                      />
                                    ) : (
                                      <div className="w-full h-full rounded-full bg-neutral-200 dark:bg-slate-700" title={color} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
      
                        {/* Sizes */}
                        {availableSizes.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black uppercase text-neutral-400 dark:text-slate-500 tracking-[0.2em] mb-3">
                              Ukuran: <span className="text-pink-600 dark:text-pink-400 font-bold">{selectedSize || availableSizes[0]}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {availableSizes.map((size) => (
                                <button
                                  key={size}
                                  onClick={() => setSelectedSize(size)}
                                  className={`min-w-[3.2rem] h-10 px-3 flex items-center justify-center rounded-xl text-xs font-black border transition-all ${
                                    selectedSize === size 
                                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-pink-500 dark:bg-pink-600' 
                                      : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-slate-400 hover:border-neutral-300'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
  
                  {/* Quantity & Add */}
                  <div className="flex flex-col gap-4 pt-6 mt-4 border-t border-neutral-100 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-neutral-400 dark:text-slate-500 tracking-[0.2em]">Jumlah</p>
                      <div className="flex items-center gap-4 bg-neutral-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-2xl border border-neutral-200/50 dark:border-white/5">
                        <button 
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))} 
                          className="p-1 hover:text-pink-500 transition-colors disabled:opacity-20 text-neutral-700 dark:text-slate-300" 
                          disabled={quantity <= 1}
                        >
                          <Minus size={15} />
                        </button>
                        <span className="text-sm font-black text-neutral-900 dark:text-white tabular-nums">{quantity}</span>
                        <button 
                          onClick={() => setQuantity((q) => q + 1)} 
                          className="p-1 hover:text-pink-500 transition-colors text-neutral-700 dark:text-slate-300"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
  
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      disabled={isSubmitting || isLoadingProduct || !currentVariant}
                      onClick={handleConfirm}
                      className={`w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all ${
                        isSubmitting 
                          ? 'bg-neutral-200 dark:bg-slate-800 text-neutral-400' 
                          : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/20'
                      } disabled:opacity-50 uppercase tracking-wider`}
                    >
                      {isSubmitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={18} />
                      )} 
                      {isSubmitting 
                        ? 'Memproses...' 
                        : isLoadingProduct 
                        ? 'Memuat Varian...' 
                        : !currentVariant 
                        ? 'Varian Tidak Tersedia' 
                        : 'Tambahkan ke Keranjang'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
