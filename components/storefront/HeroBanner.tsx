'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { ContentItem, Slide } from '@/types/content';
import { slugify } from '@/lib/utils/slug';
import { formatImageUrl } from '@/lib/url-utils';

import { ContentService } from '@/services/content.service';

function mapItemsToSlides(items?: ContentItem[]): Slide[] {
  if (!items || items.length === 0) {
    return [];
  }

  // Sort by displayOrder ascending, then by createdAt descending
  const sorted = [...items].sort((a, b) => {
    const orderA = a.displayOrder != null ? a.displayOrder : 999;
    const orderB = b.displayOrder != null ? b.displayOrder : 999;
    if (orderA !== orderB) return orderA - orderB;
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return (b.id ?? 0) - (a.id ?? 0);
  });

  return sorted.map((item) => {
    let ctaLink = item.linkUrl || '';
    if (!ctaLink && item.productId) {
      ctaLink = `/products/${item.productId}`;
    } else if (!ctaLink && item.title) {
      ctaLink = `/products/${slugify(item.title)}`;
    } else if (!ctaLink) {
      ctaLink = '/products';
    }

    return {
      id: item.id || 0,
      tag: item.tag || '',
      title: item.title || '',
      subtitle: item.subtitle || '',
      cta: item.ctaText || 'Belanja Sekarang',
      ctaLink: ctaLink,
      bgFrom: '',
      bgTo: '',
      accent: item.styleConfig || '',
      image: formatImageUrl(item.imageUrl || item.bannerUrl || item.product?.imageUrl || ''),
      badge: item.badgeText || '',
    };
  });
}

interface SlideTheme {
  name: string;
  bgGradient: string;
  darkBgGradient: string;
  buttonGradient: string;
  buttonShadow: string;
  textAccentGradient: string;
  activeDot: string;
}

const THEME_PRESETS: Record<string, SlideTheme> = {
  pink: {
    name: 'Pink Rose',
    bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #ffe4e6 50%, #fce7f3 100%)',
    darkBgGradient: 'linear-gradient(135deg, #3d0a20 0%, #1e112a 50%, #0f172a 100%)',
    buttonGradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    buttonShadow: 'rgba(244, 63, 94, 0.4)',
    textAccentGradient: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
    activeDot: '#f43f5e',
  },
  blue: {
    name: 'Ocean Indigo',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #dbeafe 100%)',
    darkBgGradient: 'linear-gradient(135deg, #172554 0%, #1e1b4b 50%, #0f172a 100%)',
    buttonGradient: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
    buttonShadow: 'rgba(59, 130, 246, 0.4)',
    textAccentGradient: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
    activeDot: '#3b82f6',
  },
  amber: {
    name: 'Sunset Amber',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #ffedd5 50%, #fef3c7 100%)',
    darkBgGradient: 'linear-gradient(135deg, #451a03 0%, #2e1065 50%, #0f172a 100%)',
    buttonGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    buttonShadow: 'rgba(245, 158, 11, 0.4)',
    textAccentGradient: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
    activeDot: '#f59e0b',
  },
  purple: {
    name: 'Violet Luxury',
    bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)',
    darkBgGradient: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 50%, #0f172a 100%)',
    buttonGradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
    buttonShadow: 'rgba(168, 85, 247, 0.4)',
    textAccentGradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
    activeDot: '#a855f7',
  },
  emerald: {
    name: 'Emerald Mint',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #ccfbf1 50%, #d1fae5 100%)',
    darkBgGradient: 'linear-gradient(135deg, #022c22 0%, #042f2e 50%, #0f172a 100%)',
    buttonGradient: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
    buttonShadow: 'rgba(16, 185, 129, 0.4)',
    textAccentGradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
    activeDot: '#10b981',
  },
};

function resolveTheme(styleConfig?: string): SlideTheme {
  if (!styleConfig) return THEME_PRESETS.pink;

  const lower = styleConfig.toLowerCase();
  if (lower.includes('blue') || lower.includes('indigo')) return THEME_PRESETS.blue;
  if (lower.includes('amber') || lower.includes('orange')) return THEME_PRESETS.amber;
  if (lower.includes('purple') || lower.includes('violet')) return THEME_PRESETS.purple;
  if (lower.includes('emerald') || lower.includes('teal') || lower.includes('mint')) return THEME_PRESETS.emerald;
  if (lower.includes('pink') || lower.includes('rose')) return THEME_PRESETS.pink;

  // Check JSON format
  try {
    const json = JSON.parse(styleConfig);
    if (json.bgFrom && json.bgTo) {
      return {
        name: 'Custom',
        bgGradient: `linear-gradient(135deg, ${json.bgFrom}15 0%, ${json.bgTo}25 100%)`,
        darkBgGradient: `linear-gradient(135deg, ${json.bgFrom}60 0%, #0f172a 100%)`,
        buttonGradient: `linear-gradient(135deg, ${json.bgFrom} 0%, ${json.bgTo} 100%)`,
        buttonShadow: `${json.bgFrom}55`,
        textAccentGradient: `linear-gradient(90deg, ${json.bgFrom} 0%, ${json.bgTo} 100%)`,
        activeDot: json.bgFrom,
      };
    }
  } catch { }

  return THEME_PRESETS.pink;
}

interface HeroBannerProps {
  items?: ContentItem[];
}

export default function HeroBanner({ items }: HeroBannerProps) {
  const [slides, setSlides] = useState<Slide[]>(() => (items && items.length > 0 ? mapItemsToSlides(items) : []));
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoaded, setIsLoaded] = useState(Boolean(items && items.length > 0));
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const onInteract = () => setHasInteracted(true);
    window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true, passive: true });
    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('scroll', onInteract);
    };
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      setSlides(mapItemsToSlides(items));
      setIsLoaded(true);
      return;
    }

    // Direct API call to CMS for Web Hero Carousel items
    let isMounted = true;
    ContentService.getItemsByType('HERO_CAROUSEL', 'WEB', true)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setSlides(mapItemsToSlides(data));
        } else {
          setSlides([]);
        }
      })
      .catch((err) => {
        console.warn('[HeroBanner] Failed to fetch hero items from API:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, [items]);

  useEffect(() => {
    if (slides.length <= 1 || isHovered || !hasInteracted) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isHovered, hasInteracted]);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const slide = slides[current];
  const currentTheme = useMemo(() => resolveTheme(slide?.accent), [slide?.accent]);
  const hasImage = Boolean(slide?.image);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45) {
      goTo((current + 1) % slides.length);
    } else if (diff < -45) {
      goTo((current - 1 + slides.length) % slides.length);
    }
    setTouchStart(null);
  };

  if (isLoaded && slides.length === 0) {
    return null;
  }

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden w-full aspect-[16/9] sm:aspect-[2/1] md:aspect-[21/9] lg:aspect-auto lg:h-[480px] xl:h-[520px] 2xl:h-[560px] select-none border-b border-neutral-100 dark:border-white/10 bg-neutral-900"
    >
      {!isLoaded || !slide ? (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-slate-900 flex items-center justify-center">
          <Zap size={40} className="text-pink-300 animate-pulse" />
        </div>
      ) : (
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial={current === 0 ? "center" : "enter"}
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full flex items-center"
          >
            {/* 1. BACKGROUND: Proportional Image with object-cover, NEVER object-fill (NO GEPENG) */}
            {hasImage ? (
              <>
                <Image
                  src={slide.image}
                  alt={slide.title || 'Hero Banner'}
                  fill
                  priority={current === 0}
                  fetchPriority={current === 0 ? 'high' : 'auto'}
                  sizes="100vw"
                  quality={65}
                  className="object-cover object-center z-0"
                />
                {/* Contrast overlay: Soft localized gradient so true banner colors stay bright and text stays readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent sm:bg-linear-to-r sm:from-black/75 sm:via-black/35 sm:to-transparent z-[1]" />
              </>
            ) : (
              <>
                {/* Full Gradient Background (Theme based) */}
                <div
                  className="absolute inset-0 z-0 transition-colors duration-700 dark:hidden"
                  style={{ background: currentTheme.bgGradient }}
                />
                <div
                  className="absolute inset-0 z-0 transition-colors duration-700 hidden dark:block"
                  style={{ background: currentTheme.darkBgGradient }}
                />
                {/* Subtle artistic light effect */}
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/40 dark:bg-white/5 blur-3xl pointer-events-none z-0" />
              </>
            )}

            {/* 2. FLOATING CONTENT: Title, Subtitle, and CTA Button (Melayang) */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 w-full pointer-events-none">
              <motion.div
                initial={current === 0 ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-[78%] sm:max-w-xl lg:max-w-2xl text-left pointer-events-auto"
              >
                {/* Tag / Badge */}
                {slide.tag && (
                  <motion.div
                    initial={current === 0 ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide mb-1.5 sm:mb-4 shadow-sm border ${hasImage
                      ? 'bg-white/20 text-white border-white/30 backdrop-blur-md'
                      : 'bg-white dark:bg-white/10 text-neutral-800 dark:text-white border-neutral-200 dark:border-white/10'
                      }`}
                  >
                    <Sparkles size={11} className="text-pink-400 fill-pink-400" />
                    <span>{slide.tag}</span>
                  </motion.div>
                )}

                {/* Main Title (Melayang) */}
                <h1
                  className={`text-base sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.18] sm:leading-[1.15] mb-1.5 sm:mb-4 ${hasImage
                    ? 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                    : 'text-neutral-900 dark:text-white'
                    }`}
                >
                  {slide.title.split('\n').map((line: string, i: number) => {
                    const isAccentLine = i === 1 || (slide.title.split('\n').length === 1 && line.includes('&'));
                    return (
                      <span key={i} className="block">
                        {isAccentLine && !hasImage ? (
                          <span
                            style={{
                              background: currentTheme.textAccentGradient,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {line}
                          </span>
                        ) : (
                          line
                        )}
                      </span>
                    );
                  })}
                </h1>

                {/* Subtitle */}
                {slide.subtitle && (
                  <p
                    className={`text-[11px] sm:text-sm lg:text-lg font-medium leading-relaxed mb-2.5 sm:mb-6 max-w-xl line-clamp-2 sm:line-clamp-3 ${hasImage
                      ? 'text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
                      : 'text-neutral-600 dark:text-slate-300'
                      }`}
                  >
                    {slide.subtitle}
                  </p>
                )}

                {/* CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <Link
                    href={slide.ctaLink}
                    style={{
                      background: currentTheme.buttonGradient,
                      boxShadow: `0 8px 20px -3px ${currentTheme.buttonShadow}`,
                    }}
                    className="group text-white px-3.5 py-1.5 sm:px-7 sm:py-3.5 rounded-full font-semibold text-[11px] sm:text-sm tracking-wide uppercase inline-flex items-center gap-1.5 sm:gap-2.5 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    <span>{slide.cta}</span>
                    <ArrowRight size={14} className="sm:w-[17px] sm:h-[17px] transition-transform group-hover:translate-x-1" />
                  </Link>

                  {slide.badge && (
                    <span
                      className={`hidden sm:inline-block text-xs font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border shadow-sm ${hasImage
                        ? 'text-white/90 bg-white/10 border-white/20 backdrop-blur-md'
                        : 'text-neutral-700 dark:text-slate-300 bg-white/80 dark:bg-white/10 border-neutral-200 dark:border-white/10'
                        }`}
                    >
                      {slide.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Prev / Next Slide Controls (Desktop / Tablet only, touch gesture on mobile) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            aria-label="Previous Slide"
            className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/25 hover:bg-black/55 text-white rounded-full backdrop-blur-md items-center justify-center transition-all duration-200 shadow-md hover:scale-105 border border-white/20"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => goTo((current + 1) % slides.length)}
            aria-label="Next Slide"
            className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/25 hover:bg-black/55 text-white rounded-full backdrop-blur-md items-center justify-center transition-all duration-200 shadow-md hover:scale-105 border border-white/20"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 bg-black/35 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/15">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className="p-1 sm:p-2 min-w-[20px] sm:min-w-[28px] min-h-[20px] sm:min-h-[28px] flex items-center justify-center focus:outline-none"
              >
                <span
                  style={{
                    backgroundColor: i === current ? currentTheme.activeDot : 'rgba(255, 255, 255, 0.4)',
                  }}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 block ${i === current ? 'w-4 sm:w-6' : 'w-1.5 sm:w-2 hover:bg-white/70'
                    }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
