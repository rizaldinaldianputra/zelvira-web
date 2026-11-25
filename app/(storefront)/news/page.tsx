import { Metadata } from 'next';
import Link from 'next/link';
import { NewsService } from '@/services/news.service';
import { News } from '@/types/news';
import { formatImageUrl } from '@/lib/url-utils';
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import SeoScript from '@/components/storefront/SeoScript';

export const metadata: Metadata = {
  title: 'Kabar & Tren Fashion | Zelvira Journal',
  description: 'Inspirasi gaya, rilis koleksi musiman, dan tips berpakaian eksklusif dari Zelvira Official.',
};

export default async function NewsListingPage() {
  let newsList: any[] = [];

  try {
    const res = await NewsService.getAll();
    const data = Array.isArray(res) ? res : (res as any)?.content || [];
    if (data.length > 0) {
      newsList = data.map((n: News) => ({
        id: n.id,
        slug: n.slug || String(n.id),
        title: n.title,
        summary: (n as any).summary || n.content?.replace(/<[^>]*>?/gm, '').slice(0, 140) + '...',
        thumbnail: formatImageUrl(n.imageUrl || (n as any).thumbnail || (n as any).banner || ''),
        createdAt: n.createdAt,
        readingTime: '3 min read',
        category: 'Fashion Update',
      }));
    } else {
      newsList = [];
    }
  } catch (err) {
    newsList = [];
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-slate-950 text-neutral-900 dark:text-slate-100">
      <SeoScript pageName="ARTICLE" />

      {/* Header Banner */}
      <section className="py-16 md:py-20 bg-linear-to-b from-indigo-50/70 via-white to-neutral-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-neutral-200/70 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-4">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Beranda</Link>
            <ChevronRight size={14} />
            <span className="text-indigo-600 dark:text-indigo-400">Journal &amp; News</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-200/50 dark:border-indigo-800/50">
                <Sparkles size={11} className="fill-indigo-500 text-indigo-500" />
                Zelvira Editorial
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                KABAR &amp; TREN FASHION
              </h1>
              <p className="text-neutral-500 dark:text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
                Temukan inspirasi padu padan busana muslim, laporan tren runway, serta panduan eksklusif dari tim desainer Zelvira.
              </p>
            </div>

            <div className="shrink-0 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200/70 dark:border-white/10 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Publikasi</p>
                <p className="text-xl font-black text-neutral-900 dark:text-white">{newsList.length} Artikel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {newsList.length === 0 ? (
            <div className="text-center py-24 text-neutral-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold">Belum ada artikel berita yang dipublikasikan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsList.map((item, i) => (
                <article
                  key={item.id || i}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-neutral-200/80 dark:border-white/10 p-6 transition-all duration-300 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/40"
                >
                  {/* Thumbnail */}
                  <Link href={`/news/${item.slug}`} className="block relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-slate-800 mb-5">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-neutral-200/60 dark:border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-neutral-800 dark:text-slate-200 shadow-sm">
                      {item.category}
                    </div>
                  </Link>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-neutral-400 dark:text-slate-500 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-indigo-500" />
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
                      <Clock size={13} className="text-indigo-500" />
                      {item.readingTime}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <Link href={`/news/${item.slug}`}>
                    <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-2.5">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="text-neutral-500 dark:text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6 grow">
                    {item.summary}
                  </p>

                  {/* Footer Link */}
                  <div className="pt-4 border-t border-neutral-100 dark:border-white/10 mt-auto flex items-center justify-between">
                    <Link
                      href={`/news/${item.slug}`}
                      className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 text-indigo-500" />
                    </Link>
                    <span className="text-[10px] font-black tracking-widest uppercase text-neutral-400">
                      Zelvira
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
