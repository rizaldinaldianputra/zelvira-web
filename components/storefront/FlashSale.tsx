'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { Zap, Clock, Flame } from 'lucide-react';
import { ContentItem } from '@/types/content';
import { Product } from '@/types/product';
import { ProductService } from '@/services/product.service';
import { formatImageUrl } from '@/lib/url-utils';
import { FlashSale as FlashSaleSession } from '@/types/flash-sale';
import { useGsapSectionReveal } from '@/hooks/useGsapSectionReveal';

interface FlashSaleProps {
  section?: any;
  items?: ContentItem[];
  session?: FlashSaleSession;
}

export default function FlashSale({ section, items, session }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [status, setStatus] = useState<'UPCOMING' | 'ACTIVE' | 'FINISHED'>('ACTIVE');
  const [products, setProducts] = useState<any[]>(() => {
    if (session && session.items && session.items.length > 0) {
      return session.items.map((item) => ({
        id: item.productId,
        name: item.productName || '',
        price: item.discountPrice || item.originalPrice || 0,
        originalPrice: item.originalPrice,
        slug: '',
        imageUrl: formatImageUrl(item.productImageUrl || ''),
        image: formatImageUrl(item.productImageUrl || ''),
        stock: item.flashStock || 10,
        variants: [],
        isActive: true,
        badgeText: 'FLASH SALE',
      }));
    }
    if (items && items.length > 0) {
      return items.filter((i) => i.product || i.imageUrl).map((item) => ({
        id: item.productId || item.product?.id || item.id,
        name: item.product?.name || item.title || '',
        price: item.price || item.product?.price || 0,
        originalPrice: item.product?.originalPrice,
        slug: item.product?.slug || '',
        imageUrl: formatImageUrl(item.imageUrl || item.product?.imageUrl || ''),
        image: formatImageUrl(item.imageUrl || item.product?.imageUrl || ''),
        stock: item.quantity || item.product?.qty || 10,
        variants: item.product?.variants || [],
        isActive: true,
        badgeText: item.badgeText || 'FLASH SALE',
      }));
    }
    return [];
  });
  const [isLoaded, setIsLoaded] = useState(Boolean((session?.items && session.items.length > 0) || (items && items.length > 0)));
  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger Section Transition
  useGsapSectionReveal(sectionRef, {
    headerSelector: '.flash-sale-header',
    itemSelector: '.flash-sale-card',
  });

  useEffect(() => {
    let isCancelled = false;

    const loadFlashProducts = async () => {
      try {
        if (session && session.items && session.items.length > 0) {
          const productIds = session.items
            .map((i) => i.productId)
            .filter((id): id is number => typeof id === 'number' && id > 0);

          let fullProducts: Product[] = [];
          if (productIds.length > 0) {
            try {
              fullProducts = await ProductService.getByIds(productIds);
            } catch (err) {
              console.warn('[FlashSale] Could not batch load products:', err);
            }
          }

          const productMap = new Map(fullProducts.map((p) => [p.id, p]));

          const mapped = session.items.map((item) => {
            const fullP = productMap.get(item.productId);
            const baseVariants = fullP?.variants || [];

            // Build rich variants with flash sale price
            let flashVariants = baseVariants.map((v) => ({
              ...v,
              price: item.discountPrice || v.price,
            }));

            // Fallback: If no variants exist in database, create a default variant so Add to Cart works
            if (flashVariants.length === 0) {
              flashVariants = [
                {
                  id: item.productId,
                  productId: item.productId,
                  sku: `FLASH-${item.productId}`,
                  price: item.discountPrice || item.originalPrice || 0,
                  stock: item.flashStock || 10,
                  color: 'Standard',
                  size: 'All Size',
                  groupName: 'Flash Sale',
                } as any,
              ];
            }

            return {
              id: item.productId,
              name: item.productName || fullP?.name || '',
              price: item.discountPrice || item.originalPrice || fullP?.price || 0,
              originalPrice: item.originalPrice || fullP?.price,
              slug: fullP?.slug || '',
              imageUrl: formatImageUrl(item.productImageUrl || fullP?.imageUrl || ''),
              image: formatImageUrl(item.productImageUrl || fullP?.imageUrl || ''),
              stock: item.flashStock || fullP?.qty || 10,
              variants: flashVariants,
              isActive: true,
              badgeText: 'FLASH SALE',
            };
          });

          if (!isCancelled) {
            setProducts(mapped);
            setIsLoaded(true);
          }
        } else if (items && items.length > 0) {
          const productIds = items
            .map((item) => item.product?.id || item.productId)
            .filter((id): id is number => typeof id === 'number' && id > 0);

          let fullProducts: Product[] = [];
          if (productIds.length > 0) {
            try {
              fullProducts = await ProductService.getByIds(productIds);
            } catch (err) {
              console.warn('[FlashSale] Could not batch load products:', err);
            }
          }

          const productMap = new Map(fullProducts.map((p) => [p.id, p]));

          const mapped = items.map((item) => {
            const pId = item.product?.id || item.productId;
            const fullP = pId ? productMap.get(pId) : null;
            const p = item.product || fullP;

            const originalPrice = p?.price || p?.variants?.[0]?.price || item.price || 0;
            let flashPrice = item.price;
            if (!flashPrice && item.discountValue) {
              if (item.discountType === 'PERCENT') {
                flashPrice = originalPrice * (1 - item.discountValue / 100);
              } else if (item.discountType === 'FIXED_AMOUNT') {
                flashPrice = Math.max(0, originalPrice - item.discountValue);
              } else {
                flashPrice = item.discountValue;
              }
            }
            if (!flashPrice) flashPrice = originalPrice;

            const baseVariants = p?.variants || fullP?.variants || [];
            let flashVariants = baseVariants.map((v) => ({
              ...v,
              price: flashPrice || v.price,
            }));

            // Fallback: If no variants exist, create default so Add to Cart works
            const targetId = p?.id || pId || item.id || 0;
            if (flashVariants.length === 0 && targetId > 0) {
              flashVariants = [
                {
                  id: targetId,
                  productId: targetId,
                  sku: `FLASH-${targetId}`,
                  price: flashPrice,
                  stock: item.quantity || p?.qty || 10,
                  color: 'Standard',
                  size: 'All Size',
                  groupName: 'Flash Sale',
                } as any,
              ];
            }

            return {
              id: targetId,
              name: p?.name || item.title || '',
              price: flashPrice,
              originalPrice: originalPrice,
              slug: p?.slug || fullP?.slug || item.linkUrl?.split('/').pop() || '',
              imageUrl: formatImageUrl(p?.imageUrl || item.imageUrl || ''),
              image: formatImageUrl(p?.imageUrl || item.imageUrl || ''),
              stock: item.quantity || p?.qty || 10,
              variants: flashVariants,
              isActive: true,
              badgeText: item.badgeText || 'FLASH SALE',
            };
          });

          if (!isCancelled) {
            setProducts(mapped);
            setIsLoaded(true);
          }
        } else {
          if (!isCancelled) setIsLoaded(true);
        }
      } catch (err) {
        console.error('[FlashSale] Error preparing flash sale products:', err);
        if (!isCancelled) setIsLoaded(true);
      }
    };

    loadFlashProducts();

    return () => {
      isCancelled = true;
    };
  }, [items, session]);

  useEffect(() => {
    const parseDate = (d?: string) => {
      if (!d) return 0;
      return new Date(d.includes(' ') && !d.includes('T') ? d.replace(' ', 'T') : d).getTime();
    };

    const calculateStatusAndTime = () => {
      const now = new Date().getTime();
      const start = parseDate(session?.startTime);
      const end = parseDate(session?.endTime || section?.endDate || items?.[0]?.endDate);

      if (!end) return { status: 'ACTIVE', time: { hours: 2, minutes: 0, seconds: 0 } };

      if (start > now) {
        const diff = start - now;
        return {
          status: 'UPCOMING',
          time: {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          }
        };
      }

      if (end > now) {
        const diff = end - now;
        return {
          status: 'ACTIVE',
          time: {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          }
        };
      }

      return { status: 'FINISHED', time: { hours: 0, minutes: 0, seconds: 0 } };
    };

    const initial = calculateStatusAndTime();
    setStatus(initial.status as any);
    setTimeLeft(initial.time);

    const timer = setInterval(() => {
      const { status, time } = calculateStatusAndTime();
      setStatus(status as any);
      setTimeLeft(time);
    }, 1000);

    return () => clearInterval(timer);
  }, [session, section, items]);

  const hasItems = (session?.items && session.items.length > 0) || (items && items.length > 0);
  if (!hasItems || (isLoaded && products.length === 0)) return null;
  if (status === 'FINISHED' && isLoaded) return null;

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 relative bg-gradient-to-b from-white via-neutral-50/70 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 text-neutral-900 dark:text-slate-100 overflow-hidden border-b border-neutral-100 dark:border-white/10"
      style={{
        backgroundImage: 'radial-gradient(circle at top right, rgba(245,158,11,0.08) 0%, transparent 450px), radial-gradient(circle at bottom left, rgba(244,63,94,0.06) 0%, transparent 450px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Flash Sale Header: Kiri Title, Kanan Waktu Saja (No Banner) */}
        <div className="flash-sale-header flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 sm:mb-14">
          {/* KIRI: Title */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
            <div className="w-13 h-13 sm:w-15 sm:h-15 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
              <Zap size={28} className="text-white fill-white animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${status === 'UPCOMING'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                    }`}
                >
                  <Flame
                    size={12}
                    className={status === 'UPCOMING' ? 'text-blue-600 fill-blue-600' : 'text-orange-500 fill-orange-500'}
                  />
                  {status === 'UPCOMING' ? 'Starting Soon' : 'Limited Time'}
                </span>
                {session?.name && (
                  <span className="text-xs font-semibold text-neutral-500 dark:text-slate-400 truncate max-w-[220px]">
                    {session.name}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
                FLASH SALE {session?.name ? `- ${session.name}` : (section?.title || items?.[0]?.title ? `- ${section?.title || items?.[0]?.title}` : '')}
              </h2>
              <p className="text-neutral-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-1 line-clamp-1">
                {section?.subtitle || items?.[0]?.subtitle || "Serbu diskon heboh terbatas sebelum kehabisan!"}
              </p>
            </div>
          </div>

          {/* KANAN: Waktu Saja (No Banner) */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <div className="flex flex-col items-start md:items-end">
              <div className="inline-flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 shadow-xs">
                <Clock size={13} className="text-amber-500 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  {status === 'UPCOMING' ? 'Starts In' : 'Ends In'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[
                  { value: timeLeft.hours, label: 'HRS' },
                  { value: timeLeft.minutes, label: 'MIN' },
                  { value: timeLeft.seconds, label: 'SEC' },
                ].map((unit, i) => (
                  <div key={unit.label} className="flex items-center gap-1.5 sm:gap-2">
                    <div className="text-center">
                      <div className="w-13 h-13 sm:w-15 sm:h-15 bg-white dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-neutral-200/80 dark:border-white/10 shadow-sm">
                        <span className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white tabular-nums leading-none">
                          {unit.value.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-[9px] font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                        {unit.label}
                      </p>
                    </div>
                    {i < 2 && (
                      <span className="text-neutral-300 dark:text-slate-700 font-bold text-xl pb-3 select-none">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          {status === 'UPCOMING' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 dark:bg-slate-950/70 backdrop-blur-[2px] rounded-3xl border border-neutral-200/80 dark:border-white/10 pointer-events-none">
              <div className="bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 px-8 py-4 rounded-3xl shadow-xl flex flex-col items-center gap-2">
                <Clock className="text-blue-500 h-6 w-6 animate-pulse" />
                <span className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Sesi Akan Segera Dibuka
                </span>
              </div>
            </div>
          )}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 ${status === 'UPCOMING' ? 'opacity-50 grayscale-[0.5]' : ''
              }`}
          >
            {products.map((product: any) => (
              <div
                key={product.id}
                className="flash-sale-card relative group"
              >
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-neutral-200/80 dark:border-white/10 group-hover:border-amber-300 shadow-sm group-hover:shadow-lg transition-all duration-300">
                  <ProductCard product={product} />
                  {/* Stock Bar */}
                  <div className="px-5 pb-5 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-semibold text-neutral-600 dark:text-slate-400 uppercase tracking-wider">
                        Available
                      </span>
                      <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
                        {product.stock} Left
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min((product.stock / 15) * 100, 100)}%` }}
                        className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
