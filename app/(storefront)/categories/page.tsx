import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { CategoryService } from '@/services/category.service';
import { Category } from '@/types/category';
import { formatImageUrl } from '@/lib/url-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Kategori Produk | Zelvira Aesthetic Store',
  description: 'Jelajahi ragam kategori busana muslim, gamis modern, hijab premium, kecantikan, dan aksesoris eksklusif dari Zelvira.',
};

const CATEGORY_GRADIENTS = [
  'from-pink-500/10 via-rose-500/15 to-pink-500/5',
  'from-indigo-500/10 via-purple-500/15 to-indigo-500/5',
  'from-amber-500/10 via-orange-500/15 to-amber-500/5',
  'from-emerald-500/10 via-teal-500/15 to-emerald-500/5',
  'from-blue-500/10 via-cyan-500/15 to-blue-500/5',
];

export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const res = await CategoryService.getAll();
    categories = (res.content || (Array.isArray(res) ? res : [])).filter((c: Category) => c.isActive !== false);
  } catch (error) {
    console.error('[CategoriesPage] Failed to fetch categories:', error);
  }

  return (
    <div className="min-h-screen pb-24 pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-neutral-900 dark:text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/40 shadow-xs">
          <Sparkles size={13} className="fill-pink-500 text-pink-500" />
          Katalog Busana & Gaya Hidup
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Jelajahi Berdasarkan <span className="bg-linear-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent italic">Kategori</span>
        </h1>

        <p className="text-neutral-500 dark:text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
          Temukan koleksi pilihan busana muslim, gamis kontemporer, hijab premium, dan aksesoris esensial yang dirancang khusus untuk kesempurnaan penampilan Anda.
        </p>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat, idx) => {
            const gradient = CATEGORY_GRADIENTS[idx % CATEGORY_GRADIENTS.length];
            const hasImage = Boolean(cat.imageUrl);

            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 dark:hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/10"
              >
                {/* Decorative background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />

                <div>
                  {/* Category Image or Icon */}
                  <div className="relative mb-6 h-48 sm:h-52 w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-slate-800/80 border border-neutral-200/50 dark:border-white/5 flex items-center justify-center">
                    {hasImage ? (
                      <Image
                        src={formatImageUrl(cat.imageUrl!)}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-108"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-inner">
                        <LayoutGrid size={32} />
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm font-medium text-neutral-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description || `Koleksi produk pilihan terbaik dalam kategori ${cat.name} untuk melengkapi gaya berbusana Anda.`}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Lihat Produk</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>

                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-neutral-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <ShoppingBag size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-neutral-200/80 dark:border-white/10 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-pink-50 dark:bg-pink-950/30 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid size={28} />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Kategori Sedang Diperbarui</h3>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 mt-2">
            Kategori produk akan segera tampil. Silakan jelajahi seluruh koleksi melalui halaman katalog.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-pink-600 transition-colors"
          >
            <span>Buka Semua Produk</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
