import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsService } from '@/services/news.service';
import { formatImageUrl } from '@/lib/url-utils';
import { Calendar, Clock, ArrowLeft, ChevronRight, User } from 'lucide-react';
import SeoScript from '@/components/storefront/SeoScript';
import ShareButton from '@/components/storefront/ShareButton';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_ARTICLES: Record<string, any> = {};

function formatDate(dateVal?: string): string {
  if (!dateVal) return 'Baru saja';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Baru saja';
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Baru saja';
  }
}

/**
 * Converts raw markdown or plain text to semantic HTML if not already HTML
 */
function formatContent(rawContent?: any): string {
  if (!rawContent) return '';
  const contentStr = typeof rawContent === 'string' ? rawContent : String(rawContent);

  // If it already contains HTML tags like <p>, <div>, <h1>, return as is
  if (/<[a-z][\s\S]*>/i.test(contentStr)) {
    return contentStr;
  }

  // Convert Markdown to clean HTML
  let html = contentStr
    .replace(/\r\n/g, '\n')
    // Headings
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black text-neutral-900 dark:text-white mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-neutral-900 dark:text-white mt-8 mb-4">$1</h1>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Bullet points
    .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-neutral-700 dark:text-slate-300">$1</li>');

  // Wrap consecutive <li> into <ul>
  html = html.replace(/(<li[\s\S]*?<\/li>)+/g, '<ul class="my-4 space-y-1.5">$&</ul>');

  // Wrap double line breaks as paragraphs
  const paragraphs = html.split(/\n\s*\n/).map((p) => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) {
      return trimmed;
    }
    return `<p class="text-neutral-700 dark:text-slate-300 leading-relaxed text-base mb-4">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  return paragraphs.filter(Boolean).join('');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let slug = '';
  try {
    const resolved = await params;
    slug = resolved?.slug || '';
  } catch {
    slug = '';
  }

  let articleTitle = 'Artikel Fashion | Zelvira';
  let articleDesc = 'Inspirasi dan wawasan fashion eksklusif dari Zelvira.';

  if (slug) {
    try {
      const news = await NewsService.getBySlug(slug);
      if (news && news.title) {
        articleTitle = `${news.title} | Zelvira Journal`;
        articleDesc = typeof news.content === 'string'
          ? news.content.replace(/<[^>]*>?/gm, '').slice(0, 160)
          : articleDesc;
      }
    } catch {
      if (FALLBACK_ARTICLES[slug]) {
        articleTitle = `${FALLBACK_ARTICLES[slug].title} | Zelvira Journal`;
        articleDesc = FALLBACK_ARTICLES[slug].summary;
      }
    }
  }

  return {
    title: articleTitle,
    description: articleDesc,
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  let slug = '';
  try {
    const resolved = await params;
    slug = resolved?.slug || '';
  } catch {
    slug = '';
  }

  let article: any = null;

  if (slug) {
    try {
      const fetched = await NewsService.getBySlug(slug);
      if (fetched && fetched.title) {
        article = {
          id: fetched.id,
          title: fetched.title,
          slug: fetched.slug,
          content: fetched.content,
          thumbnail: formatImageUrl(fetched.imageUrl || (fetched as any).thumbnail || (fetched as any).banner || ''),
          createdAt: fetched.createdAt || fetched.publishedAt,
          category: (fetched as any).category || 'Fashion Journal',
          readingTime: '4 min read',
          author: 'Tim Editorial Zelvira',
        };
      }
    } catch {
      // If not found by direct slug, try fallback search
      try {
        if (!isNaN(Number(slug))) {
          const byId = await NewsService.getById(Number(slug));
          if (byId && byId.title) {
            article = {
              id: byId.id,
              title: byId.title,
              slug: byId.slug,
              content: byId.content,
              thumbnail: formatImageUrl(byId.imageUrl || (byId as any).thumbnail || (byId as any).banner || ''),
              createdAt: byId.createdAt || byId.publishedAt,
              category: (byId as any).category || 'Fashion Journal',
              readingTime: '4 min read',
              author: 'Tim Editorial Zelvira',
            };
          }
        }

        if (!article) {
          // Try searching in list of all news
          const res = await NewsService.getAll();
          const data = Array.isArray(res) ? res : (res as any)?.content || [];
          const found = data.find((n: any) => n.slug === slug || String(n.id) === slug);
          if (found && found.title) {
            article = {
              id: found.id,
              title: found.title,
              slug: found.slug,
              content: found.content,
              thumbnail: formatImageUrl(found.imageUrl || (found as any).thumbnail || (found as any).banner || ''),
              createdAt: found.createdAt || found.publishedAt,
              category: (found as any).category || 'Fashion Journal',
              readingTime: '4 min read',
              author: 'Tim Editorial Zelvira',
            };
          }
        }
      } catch { }
    }

    // If still not found, check fallback articles
    if (!article && FALLBACK_ARTICLES[slug]) {
      article = FALLBACK_ARTICLES[slug];
    }
  }

  // If completely not found, redirect to 404
  if (!article) {
    notFound();
  }

  const formattedHtml = formatContent(article.content || article.summary || '');

  return (
    <article className="min-h-screen bg-white dark:bg-slate-950 text-neutral-900 dark:text-slate-100">
      <SeoScript pageName="ARTICLE" />

      {/* Header & Navigation */}
      <div className="border-b border-neutral-100 dark:border-white/10 bg-neutral-50/50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Semua Artikel</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold">
            <span>Zelvira Journal</span>
            <ChevronRight size={13} />
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{article.category}</span>
          </div>
        </div>
      </div>

      {/* Article Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Category & Date */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
            {article.category}
          </span>
          <span className="text-neutral-300 dark:text-white/20">•</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-slate-400">
            <Calendar size={13} className="text-indigo-500" />
            {formatDate(article.createdAt)}
          </span>
          <span className="text-neutral-300 dark:text-white/20">•</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-slate-400">
            <Clock size={13} className="text-indigo-500" />
            {article.readingTime || '4 min read'}
          </span>
        </div>

        {/* Article Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.18] mb-6">
          {article.title}
        </h1>

        {/* Author Byline & Safe Client Share Button */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-neutral-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">{article.author || 'Tim Redaksi Zelvira'}</p>
              <p className="text-[11px] text-neutral-400 font-medium">Official Fashion Curator</p>
            </div>
          </div>

          <ShareButton title={article.title} />
        </div>

        {/* Featured Hero Image */}
        {article.thumbnail && (
          <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden mb-12 shadow-xl border border-neutral-200/60 dark:border-white/10 bg-neutral-100 dark:bg-slate-900">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-neutral-900 dark:prose-headings:text-white prose-p:text-neutral-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base prose-strong:text-neutral-900 dark:prose-strong:text-white prose-img:rounded-3xl"
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />

        {/* Bottom CTA Box */}
        <div className="mt-16 p-8 rounded-[2.5rem] bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/20 border border-indigo-100 dark:border-indigo-900/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Temukan Busana Favorit Anda
            </span>
            <h3 className="text-xl font-black text-neutral-900 dark:text-white mt-1">
              Ingin tampil menawan seperti ulasan di atas?
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 max-w-md">
              Kunjungi katalog resmi Zelvira untuk melihat koleksi terbaru dengan garansi original dan bebas retur.
            </p>
          </div>
          <Link
            href="/products"
            className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all shrink-0"
          >
            Lihat Koleksi Produk
          </Link>
        </div>
      </div>
    </article>
  );
}
