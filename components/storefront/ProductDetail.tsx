'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, 
  ShieldCheck, Truck, RotateCcw, Minus, Plus, Box, Layers, Palette 
} from 'lucide-react';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { formatImageUrl } from '@/lib/url-utils';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useCart();

  // Process images: banners first (multi slide banner in product detail), then images, then thumbnail
  const images = useMemo(() => {
    const list: string[] = [];
    if (product.banners && product.banners.length > 0) {
      list.push(...product.banners);
    } else if (product.images && product.images.length > 0) {
      list.push(...product.images);
    }

    const thumb = product.thumbnailUrl || product.imageUrl;
    if (thumb && !list.includes(thumb)) {
      list.unshift(thumb);
    }

    // Also include any unique variant images in the gallery if not already present
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.imageUrl && !list.includes(v.imageUrl)) {
          list.push(v.imageUrl);
        }
      });
    }

    if (list.length === 0) {
      list.push('/placeholder.png');
    }

    return list.map(img => formatImageUrl(img));
  }, [product.banners, product.images, product.thumbnailUrl, product.imageUrl, product.variants]);

  // Find the first valid selection
  const defaultVariant = product.variants?.[0];

  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color || '');
  const [selectedSize, setSelectedSize] = useState(defaultVariant?.size || '');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Derived: Current Selection Info
  const currentVariant = useMemo(() => {
    return product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
  }, [product.variants, selectedColor, selectedSize]);

  const currentGroupName = useMemo(() => {
    return currentVariant?.groupName || product.variants?.[0]?.groupName || '';
  }, [currentVariant, product.variants]);

  // Derived: Filtered Options based on Style Group
  const colors = useMemo(() => {
    const groupVariants = product.variants?.filter(v => v.groupName === currentGroupName);
    const uniqueColors = new Set(groupVariants?.map(v => v.color).filter(Boolean));
    return Array.from(uniqueColors);
  }, [product.variants, currentGroupName]);

  const sizes = useMemo(() => {
    const groupVariants = product.variants?.filter(v => v.groupName === currentGroupName);
    // Only show sizes available for the current Group
    const uniqueSizes = new Set(groupVariants?.map(v => v.size).filter(Boolean));
    return Array.from(uniqueSizes);
  }, [product.variants, currentGroupName]);

  const price = useMemo(() => currentVariant?.price || product.price || 0, [currentVariant, product.price]);

  const handleAddToCart = async () => {
    if (!currentVariant?.id) {
      toast.error('Please select a valid combination.');
      return;
    }
    setIsAdding(true);
    try {
      await addToCart({
        productVariantId: currentVariant.id,
        quantity: quantity
      });
    } catch (error) {
      console.error("Failed to add to cart", error);
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-neutral-100 group shadow-2xl shadow-neutral-200">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={images[selectedImage]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-6 right-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Heart size={28} className={isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-neutral-300'} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${selectedImage === idx ? 'border-pink-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4" />

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 leading-snug">{product.name}</h1>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900">Rp {price.toLocaleString()}</span>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 inline-flex items-center gap-2 border border-neutral-100">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
              </div>
              <span className="text-sm font-semibold text-neutral-700">Premium Quality</span>
            </div>
          </div>

          <p className="text-neutral-500 text-base sm:text-lg leading-relaxed mb-10">{product.description || 'No description available for this premium product.'}</p>

          {/* Variants */}
          <div className="space-y-8 mb-12">
            {/* Style Groups (if applicable) */}
            {(() => {
              const uniqueGroups = Array.from(new Set(product.variants?.map(v => v.groupName).filter(Boolean)));
              if (uniqueGroups.length <= 1) return null;

              const currentGroup = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize)?.groupName || uniqueGroups[0];

              return (
                <div>
                  <p className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers size={14} className="text-pink-500" /> Style: <span className="text-pink-500">{currentGroup}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {uniqueGroups.map(group => (
                      <button
                        key={group}
                        onClick={() => {
                          const firstInGroup = product.variants?.find(v => v.groupName === group);
                          if (firstInGroup) {
                            setSelectedColor(firstInGroup.color || '');
                            setSelectedSize(firstInGroup.size || '');
                          }
                        }}
                        className={`px-5 h-11 rounded-xl border font-semibold text-sm transition-all ${currentGroup === group ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {colors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Palette size={14} className="text-pink-500" /> Color: <span className="text-pink-500">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => {
                    const variant = product.variants?.find(v => v.color === color && v.groupName === currentGroupName);
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color || '');
                          if (variant?.imageUrl) {
                            const formattedVariantImg = formatImageUrl(variant.imageUrl);
                            const foundIdx = images.indexOf(formattedVariantImg);
                            if (foundIdx >= 0) {
                              setSelectedImage(foundIdx);
                            }
                          }
                        }}
                        className={`group relative h-12 px-4 rounded-xl border font-semibold text-sm transition-all flex items-center gap-2.5 ${selectedColor === color ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                      >
                        {variant?.imageUrl ? (
                          <img
                            src={formatImageUrl(variant.imageUrl)}
                            alt={color}
                            className="w-6 h-6 rounded-lg object-cover border border-neutral-200 shadow-2xs group-hover:scale-105 transition-transform"
                          />
                        ) : variant?.hexColor ? (
                          <div
                            className="w-4 h-4 rounded-full border border-neutral-200 shadow-inner group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: variant.hexColor }}
                          />
                        ) : null}
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                    <Box size={14} className="text-pink-500" /> Size: <span className="text-pink-500">{selectedSize}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {sizes.map(size => {
                    const isAvailable = product.variants?.some(v =>
                      v.size === size &&
                      v.groupName === currentGroupName &&
                      (selectedColor ? v.color === selectedColor : true)
                    );
                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size || '')}
                        className={`min-w-[3.75rem] h-12 rounded-xl text-sm font-semibold border transition-all ${!isAvailable ? 'opacity-20 cursor-not-allowed grayscale' : ''} ${selectedSize === size ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-12">
            <div className="w-36 h-14 bg-neutral-100 rounded-2xl flex items-center justify-between px-5">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity(q => q - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:text-pink-500 disabled:opacity-30 transition-all shadow-sm"
              >
                <Minus size={18} />
              </button>
              <span className="font-bold text-lg text-neutral-900 tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:text-pink-500 transition-all shadow-sm"
              >
                <Plus size={18} />
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              className={`flex-1 h-14 rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl transition-all ${isAdding ? 'bg-emerald-500 shadow-emerald-200' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'} text-white tracking-wide`}
            >
              <ShoppingCart size={20} />
              {isAdding ? 'Added to Bag' : 'Add to Bag'}
            </motion.button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-neutral-100">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shadow-sm"><Truck size={20} /></div>
              <p className="text-[11px] font-semibold text-neutral-500 leading-snug">Fast & Free<br />Shipping</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shadow-sm"><RotateCcw size={20} /></div>
              <p className="text-[11px] font-semibold text-neutral-500 leading-snug">Easy 30-Day<br />Returns</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shadow-sm"><ShieldCheck size={20} /></div>
              <p className="text-[11px] font-semibold text-neutral-500 leading-snug">Secure<br />Checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
