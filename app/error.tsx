'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console/analytics
    console.error('Unhandled Web Application Error:', error);
  }, [error]);

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

        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Error 500 • Terjadi Gangguan Sistem</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-neutral-900 dark:text-white">
          Ups! Terjadi Kesalahan
        </h1>

        {/* Description */}
        <p className="text-neutral-500 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          Mohon maaf, sistem kami sedang mengalami sedikit kendala teknis saat memproses permintaan Anda. Silakan coba muat ulang atau kembali beberapa saat lagi.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-pink-600 via-rose-600 to-purple-600 hover:opacity-95 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-pink-500/20 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi Sekarang</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Error Digest Info for Debugging */}
        {error.digest && (
          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-600 mt-6 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-md">
            ID Referensi Error: {error.digest}
          </p>
        )}

        {/* Quick Help */}
        <p className="text-xs text-neutral-400 dark:text-slate-500 mt-10">
          Butuh bantuan mendesak?{' '}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Zelvira,%20website%20mengalami%20error"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 dark:text-pink-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5 inline" />
            Hubungi Customer Service WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}

