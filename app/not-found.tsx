import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Home, ShoppingBag, Sparkles, RefreshCw } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-white dark:bg-slate-950 text-neutral-900 dark:text-slate-100 transition-colors">
      <div className="max-w-xl mx-auto w-full flex flex-col items-center">
        {/* Brand Logo */}
        <Link href="/" className="inline-block mb-8 transition-transform hover:scale-105">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
            <Image
              src="/logo.png"
              alt="Zelvira Store"
              width={160}
              height={50}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Error 404 • Halaman Tidak Ditemukan</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-neutral-900 dark:text-white">
          Ups! Halaman Tidak Tersedia
        </h1>

        {/* Description */}
        <p className="text-neutral-500 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          Produk, artikel, atau halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau tautan yang Anda masukkan salah ketik.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-pink-600 via-rose-600 to-purple-600 hover:opacity-95 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-pink-500/20 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Katalog Produk</span>
          </Link>
        </div>

        {/* Quick Help */}
        <p className="text-xs text-neutral-400 dark:text-slate-500 mt-10">
          Perlu bantuan belanja?{' '}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Zelvira,%20saya%20butuh%20bantuan%20di%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
          >
            Hubungi Customer Service WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
