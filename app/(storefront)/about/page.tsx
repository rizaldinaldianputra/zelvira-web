'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Truck,
  Award,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useOrganization } from '@/hooks/use-organization';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';

const StorefrontMap = dynamic(() => import('@/components/storefront/StorefrontMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full animate-pulse items-center justify-center rounded-3xl border border-neutral-100 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
      Memuat peta butik...
    </div>
  ),
});

const BRAND_PILLARS = [
  {
    icon: Award,
    title: 'Kualitas Premium',
    desc: 'Setiap helai busana dirancang menggunakan material kain pilihan dengan jahitan presisi untuk kenyamanan sepanjang hari.',
    color: 'bg-rose-500/10 text-rose-500',
  },
  {
    icon: Sparkles,
    title: 'Desain Kontemporer',
    desc: 'Menggabungkan keanggunan modest fashion dengan sentuhan tren modern yang elegan dan selalu relevan.',
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    icon: ShieldCheck,
    title: '100% Produk Original',
    desc: 'Semua produk dijamin keasliannya dan melewati kontrol mutu ketat sebelum dikemas dan dikirimkan.',
    color: 'bg-indigo-500/10 text-indigo-500',
  },
  {
    icon: Truck,
    title: 'Pengiriman Aman & Cepat',
    desc: 'Bekerja sama dengan mitra ekspedisi terpercaya di seluruh Indonesia untuk memastikan pesanan Anda tiba tepat waktu.',
    color: 'bg-amber-500/10 text-amber-500',
  },
];

const STATS = [
  { value: '10.000+', label: 'Pelanggan Setia' },
  { value: '500+', label: 'Koleksi Busana' },
  { value: '99.8%', label: 'Kepuasan Pembeli' },
  { value: '7 Hari', label: 'Garansi Pengembalian' },
];

export default function AboutUsPage() {
  const { organization } = useOrganization();
  const orgName = organization?.name || 'Zelvira';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-28 lg:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-pink-500/20 blur-[120px]" />
          <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-rose-500/15 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-pink-300">
              <Sparkles size={14} className="fill-current" />
              Cerita & Filosofi Kami
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Keanggunan yang Menemani Setiap Langkah Anda
            </h1>

            <p className="mx-auto max-w-2xl text-base font-normal leading-relaxed text-neutral-300 sm:text-lg">
              {orgName} lahir dari cinta terhadap keindahan modest fashion modern. 
              Kami hadir untuk memberikan sentuhan keanggunan, rasa percaya diri, dan kenyamanan terbaik bagi setiap wanita.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pink-600">
              <Heart size={16} className="fill-pink-500" />
              Tentang Kami
            </div>

            <h2 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              Menghadirkan Koleksi Modest dengan Sentuhan Mewah yang Terjangkau
            </h2>

            <div className="space-y-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
              <p>
                Didirikan dengan visi mengangkat estetika busana kontemporer, <strong>{orgName}</strong> mendedikasikan setiap karyanya untuk kesempurnaan detail. Mulai dari pemilihan bahan kain berstandar tinggi yang sejuk dan jatuh anggun, hingga pola rancangan yang disesuaikan dengan kebutuhan aktivitas harian maupun acara spesial.
              </p>
              <p>
                Kami percaya bahwa berbusana sopan dan elegan tidak harus rumit ataupun mahal. Melalui inovasi desain yang berkelanjutan dan layanan pelanggan yang hangat, {orgName} senantiasa menjadi sahabat setia bagi penampilan Anda yang berkelas.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/products">
                <Button className="h-12 rounded-xl bg-neutral-900 px-6 font-bold text-white shadow-lg transition-transform hover:bg-pink-600 active:scale-95">
                  <ShoppingBag size={18} className="mr-2" />
                  Jelajahi Koleksi Kami
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-gradient-to-br from-pink-50 via-rose-50/50 to-neutral-50 p-8 shadow-xl">
              <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900">
                Komitmen & Misi Kami
              </h3>

              <ul className="mt-6 space-y-4 text-sm text-neutral-600">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500 text-xs font-black text-white">
                    ✓
                  </div>
                  <span>
                    <strong>Desain Berkarakter:</strong> Setiap rancangan memiliki narasi visual keanggunan yang unik dan memikat.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500 text-xs font-black text-white">
                    ✓
                  </div>
                  <span>
                    <strong>Material Nyaman:</strong> Pemilihan bahan yang lembut di kulit, ramah untuk iklim tropis, serta awet tahan lama.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500 text-xs font-black text-white">
                    ✓
                  </div>
                  <span>
                    <strong>Pelayanan Sepenuh Hati:</strong> Memberikan kemudahan berbelanja online, mulai dari kemudahan pembayaran hingga garansi retur.
                  </span>
                </li>
              </ul>

              <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs italic text-neutral-500">
                  &ldquo;Busana terbaik adalah busana yang membuat Anda merasa percaya diri, anggun, dan bersinar dalam versi terbaik diri Anda.&rdquo;
                </p>
                <p className="mt-2 text-right text-xs font-bold text-pink-600">
                  — Tim Kreatif {orgName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-y border-neutral-100 bg-neutral-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="p-4">
                <div className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-neutral-500 sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-14 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
            Standar Kami
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
            Mengapa Memilih {orgName}?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-500 sm:text-base">
            Kami menjaga komitmen kami terhadap kualitas dan kepuasan pelanggan dalam setiap helai pakaian.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BRAND_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group rounded-3xl border border-neutral-100 bg-white p-7 shadow-lg shadow-neutral-100/60 transition-all duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${pillar.color} mb-5 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon size={26} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">{pillar.title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-neutral-500">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Store Location & Official Organization Info */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-6 lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
                Kunjungi Kami
              </span>
              <h2 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                Butik & Kantor Resmi {orgName}
              </h2>
              <p className="text-sm text-neutral-600">
                Silakan datang atau hubungi layanan pelanggan kami untuk konsultasi gaya busana, pembelian partai, atau bantuan pesanan.
              </p>

              <div className="space-y-4 pt-2 text-sm">
                {organization?.address && (
                  <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <MapPin className="mt-0.5 shrink-0 text-pink-500" size={18} />
                    <span className="text-neutral-700">{organization.address}</span>
                  </div>
                )}

                {organization?.phoneNumber && (
                  <a
                    href={`https://wa.me/${organization.phoneNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-colors hover:bg-pink-50/50"
                  >
                    <Phone className="shrink-0 text-pink-500" size={18} />
                    <span className="font-semibold text-neutral-800">
                      {organization.phoneNumber}
                    </span>
                    <ExternalLink size={14} className="ml-auto text-neutral-400" />
                  </a>
                )}

                {organization?.email && (
                  <a
                    href={`mailto:${organization.email}`}
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-colors hover:bg-pink-50/50"
                  >
                    <Mail className="shrink-0 text-pink-500" size={18} />
                    <span className="text-neutral-700">{organization.email}</span>
                  </a>
                )}

                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <Clock className="shrink-0 text-pink-500" size={18} />
                  <span className="text-neutral-700">Setiap hari, 08.00–22.00 WIB</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/contact">
                  <Button variant="outline" className="w-full rounded-xl border-neutral-200 font-bold hover:border-pink-500 hover:text-pink-600">
                    Buka Halaman Kontak Lengkap
                  </Button>
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-3 shadow-xl lg:col-span-7">
              {organization?.latitude != null && organization?.longitude != null ? (
                <div className="h-[360px] w-full overflow-hidden rounded-2xl sm:h-[420px]">
                  <StorefrontMap
                    lat={organization.latitude}
                    lng={organization.longitude}
                    name={orgName}
                  />
                </div>
              ) : (
                <div className="flex h-[360px] flex-col items-center justify-center rounded-2xl bg-neutral-100 text-center text-neutral-400">
                  <MapPin size={40} className="mb-2 text-pink-500" />
                  <p className="font-bold text-neutral-700">{orgName}</p>
                  <p className="text-xs">Indonesia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
