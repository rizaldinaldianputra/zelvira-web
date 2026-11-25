'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { NewsService } from '@/services/news.service';
import { News } from '@/types/news';
import { formatImageUrl } from '@/lib/url-utils';
import { useGsapSectionReveal } from '@/hooks/useGsapSectionReveal';

export default function NewsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // GSAP scroll-triggered reveal
  useGsapSectionReveal({
    targetRef: sectionRef,
    selector: '.news-header, .news-card',
    stagger: 0.12,
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await NewsService.getAll();
        const data = Array.isArray(res) ? res : (res as any)?.content || [];
        if (data.length > 0) {
          const mapped = data.slice(0, 3).map((n: News) => ({
            id: n.id,
            slug: n.slug || String(n.id),
            title: n.title,
            summary: (n as any).summary || n.content?.slice(0, 120) || 'Baca selengkapnya artikel fashion terbaru dari Zelvira.',
            thumbnail: formatImageUrl(n.imageUrl || (n as any).thumbnail || (n as any).banner || ''),
            createdAt: n.createdAt,
            readingTime: '3 min read',
            category: 'Fashion Update',
          }));
          setNews(mapped);
        } else {
          setNews([]);
        }
      } catch (err) {
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (!isLoading && news.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-24 relative bg-linear-to-b from-white via-neutral-50/70 to-white text-neutral-900 overflow-hidden border-b border-neutral-100"
      style={{
        backgroundImage: 'radial-gradient(circle at top right, rgba(99,102,241,0.08) 0%, transparent 450px), radial-gradient(circle at bottom left, rgba(244,63,94,0.07) 0%, transparent 450px)',
      }}
    >

      {/* 2. Delicate grid lines overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header (FlashSale inspired with logo icon & typography) */}
        <div className="news-header flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 sm:mb-16">
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25 shrink-0 transition-transform duration-300 hover:scale-105">
              <BookOpen size={30} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={13} className="text-indigo-600 fill-indigo-600" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                  Editorial &amp; Runway
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
                KABAR &amp; TREN FASHION
              </h2>
              <p className="text-neutral-500 font-medium text-xs sm:text-sm mt-1">
                Inspirasi gaya, rilis koleksi musiman, dan tips berpakaian eksklusif Zelvira
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-700 hover:text-indigo-800 transition-colors px-5 py-2.5 rounded-full bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 group shadow-sm"
            >
              <span>Semua Artikel</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-100 bg-neutral-100 border border-neutral-200/60 rounded-[2.5rem] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {news.map((item, i) => (
              <article
                key={item.id || i}
                className="news-card group flex flex-col bg-white hover:bg-neutral-50/70 rounded-[2.5rem] border border-neutral-200/80 hover:border-indigo-300 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)] relative overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-neutral-100 mb-5 border border-neutral-200/60">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                    quality={70}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-neutral-200/60 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide text-neutral-800 shadow-sm z-10">
                    {item.category}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs font-semibold text-neutral-600 mb-3 px-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-indigo-600" />
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Terbaru'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-indigo-600" />
                    {item.readingTime}
                  </span>
                </div>

                {/* Title & Summary */}
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-2.5 px-1">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-6 px-1 grow">
                  {item.summary}
                </p>

                {/* Footer Link */}
                <div className="pt-4 border-t border-neutral-100 mt-auto flex items-center justify-between px-1">
                  <Link
                    href={`/news/${item.slug}`}
                    className="text-xs font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 text-indigo-600" />
                  </Link>
                  <span className="text-[10px] font-medium tracking-wide uppercase text-neutral-600">
                    Zelvira Journal
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

