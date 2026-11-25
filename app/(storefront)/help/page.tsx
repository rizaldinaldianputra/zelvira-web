'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Truck, 
  RefreshCcw, 
  ShieldCheck, 
  Mail,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { HelpService, HelpArticle } from '@/services/help.service';
import { useOrganization } from '@/hooks/use-organization';

const HELP_CATEGORIES = [
  {
    title: 'Pertanyaan Umum (FAQ)',
    description: 'Temukan jawaban cepat untuk pertanyaan umum seputar pemesanan, pembayaran, dan akun.',
    icon: HelpCircle,
    href: '/faq',
    color: 'bg-indigo-500',
  },
  {
    title: 'Hubungi Kami',
    description: 'Hubungi tim layanan pelanggan kami melalui WhatsApp, telepon, atau pesan langsung.',
    icon: MessageCircle,
    href: '/contact',
    color: 'bg-emerald-500',
  },
  {
    title: 'Informasi Pengiriman',
    description: 'Pelajari metode ekspedisi, estimasi waktu antar, dan tarif ongkos kirim.',
    icon: Truck,
    href: '/shipping',
    color: 'bg-amber-500',
  },
  {
    title: 'Retur & Pengembalian',
    description: 'Panduan lengkap cara retur barang dan ketentuan pengembalian dana 7 hari.',
    icon: RefreshCcw,
    href: '/returns',
    color: 'bg-rose-500',
  },
  {
    title: 'Kebijakan Privasi',
    description: 'Pahami bagaimana kami melindungi, menyimpan, dan mengamankan data pribadi Anda.',
    icon: ShieldCheck,
    href: '/privacy',
    color: 'bg-blue-500',
  },
  {
    title: 'Syarat & Ketentuan',
    description: 'Ketentuan hukum dan aturan transaksi berbelanja resmi di platform kami.',
    icon: FileText,
    href: '/terms',
    color: 'bg-violet-500',
  },
];

export default function HelpCenterPage() {
  const { organization } = useOrganization();
  const orgName = organization?.name || 'Zelvira';

  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        const res = await HelpService.getActive();
        const items = Array.isArray(res) ? res : (res as any)?.content || [];
        if (isMounted) setArticles(items);
      } catch (err) {
        console.error('Failed to load help articles:', err);
      } finally {
        if (isMounted) setLoadingArticles(false);
      }
    };
    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="text-center mb-16 space-y-4">
        <div className="flex items-center justify-center gap-2 text-pink-500 mb-2">
          <Sparkles size={20} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Pusat Informasi & Dukungan</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-neutral-900 uppercase tracking-tight">
          Ada yang Bisa Kami Bantu?
        </h1>
        <p className="text-neutral-500 max-w-2xl mx-auto font-medium">
          Semua hal yang perlu Anda ketahui tentang berbelanja di {orgName}. 
          Pilih topik bantuan di bawah atau hubungi tim customer care kami.
        </p>
      </div>

      {/* Main Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {HELP_CATEGORIES.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Link href={category.href}>
              <Card className="h-full overflow-hidden border border-neutral-100 bg-white shadow-xl shadow-neutral-100/50 rounded-[2.5rem] transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-pink-500/10 p-8 sm:p-10">
                <div className={`w-14 h-14 ${category.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
                  <category.icon size={28} />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight group-hover:text-pink-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-neutral-500 font-medium text-sm leading-relaxed">
                    {category.description}
                  </p>
                  <div className="pt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 group-hover:text-pink-600 transition-colors">
                    Pelajari Selengkapnya <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Live Articles from Backend if available */}
      {articles.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center gap-2 text-pink-500 mb-2">
            <BookOpen size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Artikel Panduan Resmi</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 mb-8">
            Panduan & Informasi Terkini
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item) => (
              <div 
                key={item.id} 
                className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 space-y-3 hover:bg-white hover:border-pink-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
                    {item.category || 'Panduan'}
                  </span>
                  {item.subtitle && (
                    <span className="text-xs text-neutral-400 font-medium">
                      {item.subtitle}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-base text-neutral-900">{item.title}</h4>
                <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA Support Card */}
      <div className="mt-20 p-10 md:p-14 rounded-[3rem] bg-neutral-950 text-white relative overflow-hidden text-center">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4">
            Masih Memerlukan Bantuan?
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto font-normal text-sm md:text-base mb-8">
            Tim customer support {orgName} siap membantu Anda setiap hari pukul 08.00–22.00 WIB.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {organization?.phoneNumber && (
              <a 
                href={`https://wa.me/${organization.phoneNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-emerald-600 text-white px-7 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30"
              >
                <MessageCircle size={16} /> WhatsApp Kami
              </a>
            )}
            {organization?.email && (
              <a 
                href={`mailto:${organization.email}`} 
                className="flex items-center gap-2.5 bg-white text-neutral-900 px-7 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-pink-500 hover:text-white transition-all shadow-lg"
              >
                <Mail size={16} /> Email Dukungan
              </a>
            )}
            <Link 
              href="/contact" 
              className="flex items-center gap-2.5 bg-neutral-800 text-neutral-200 px-7 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-neutral-700 hover:text-white transition-all"
            >
              Halaman Kontak Lengkap <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}
