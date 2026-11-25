'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Clock
} from 'lucide-react';
import { useOrganization } from '@/hooks/use-organization';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

// Import map dynamically
const StorefrontMap = dynamic(() => import('@/components/storefront/StorefrontMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-100 animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
      Memuat Peta...
    </div>
  )
});

export default function ContactPage() {
  const { organization } = useOrganization();
  const orgName = organization?.name || 'Zelvira';
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate inquiry dispatch
    await new Promise(resolve => setTimeout(resolve, 1200));
    toast.success("Pesan Anda telah terkirim! Tim kami akan segera menghubungi Anda.");
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  };

  const cleanPhone = organization?.phoneNumber?.replace(/\D/g, '') || '6281380244442';

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="mb-14">
        <Link href="/help">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full group text-neutral-400 hover:text-pink-500">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali ke Pusat Bantuan
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-pink-500 mb-2">
          <MessageCircle size={20} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Layanan Pelanggan Resmi</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 uppercase tracking-tight mb-4">
          Hubungi Kami
        </h1>
        <p className="text-neutral-500 max-w-2xl font-medium">
          Punya pertanyaan seputar produk, ukuran, pengiriman, atau kemitraan dengan {orgName}? Tim kami siap membantu Anda setiap hari.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Contact Form */}
        <div className="space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-neutral-100 shadow-xl shadow-neutral-100/50">
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 mb-6">
              Kirim Pesan Langsung
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">
                    Nama Lengkap
                  </Label>
                  <Input
                    required
                    placeholder="Contoh: Siti Rahmawati"
                    className="h-14 rounded-2xl bg-neutral-50 border-neutral-100 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">
                    Alamat Email
                  </Label>
                  <Input
                    required
                    type="email"
                    placeholder="nama@email.com"
                    className="h-14 rounded-2xl bg-neutral-50 border-neutral-100 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">
                  Subjek / Topik Bantuan
                </Label>
                <Input
                  required
                  placeholder="Contoh: Tanya status pesanan / Cek stok ukuran"
                  className="h-14 rounded-2xl bg-neutral-50 border-neutral-100 focus:bg-white transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">
                  Pesan Lengkap
                </Label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tuliskan detail pertanyaan atau keluhan Anda di sini..."
                  className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:bg-white focus:border-pink-500/20 focus:ring-4 focus:ring-pink-500/5 transition-all outline-none text-sm font-medium resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-neutral-900 hover:bg-pink-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-neutral-200 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                Kirim Pesan
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Info & Map */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* WhatsApp Card */}
            <a
              href={`https://wa.me/${cleanPhone}?text=Halo%20Zelvira,%20saya%20ingin%20bertanya%20seputar%20produk`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group block"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">
                WhatsApp Resmi
              </p>
              <p className="text-sm font-black text-neutral-900 mb-1 flex items-center gap-1.5">
                {organization?.phoneNumber || '0813-8024-4442'}
                <ExternalLink size={13} className="text-neutral-400 group-hover:text-emerald-700" />
              </p>
              <p className="text-[10px] font-medium text-emerald-700">Chat Instan CS (Respons Cepat)</p>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${organization?.email || 'info@zelvira.com'}`}
              className="p-8 rounded-[2.5rem] bg-neutral-50 border border-neutral-100 hover:bg-pink-50/40 transition-all group block"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                Email Dukungan
              </p>
              <p className="text-sm font-black text-neutral-900 mb-1">
                {organization?.email || 'info@zelvira.com'}
              </p>
              <p className="text-[10px] font-medium text-neutral-400">Respons dalam 24 Jam Kerja</p>
            </a>
          </div>

          {/* Operational Hours */}
          <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-neutral-800">
                Jam Operasional Layanan
              </p>
              <p className="text-xs text-neutral-500 font-medium">
                Senin – Minggu: 08.00 – 22.00 WIB (Termasuk Hari Libur Nasional)
              </p>
            </div>
          </div>

          {/* Store Location Map */}
          <div className="rounded-[3rem] overflow-hidden border border-neutral-100 shadow-xl shadow-neutral-100/50 h-[300px] relative group">
            <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-neutral-100 group-hover:scale-105 transition-transform max-w-[280px]">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-pink-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-neutral-900">
                    Butik & Kantor Resmi {orgName}
                  </p>
                  <p className="text-[10px] font-medium text-neutral-500 leading-snug">
                    {organization?.address || 'Jalan Kebon Kebon Kelapa Kota Bogor Tengah'}
                  </p>
                </div>
              </div>
            </div>
            {organization?.latitude && organization?.longitude ? (
              <StorefrontMap
                lat={organization.latitude}
                lng={organization.longitude}
                name={orgName}
              />
            ) : (
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                Peta sedang dimuat...
              </div>
            )}
          </div>

          {organization?.instagramUrl && (
            <a
              href={organization.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 rounded-[2rem] bg-linear-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/20 hover:scale-[1.01] transition-transform"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/30">
                <Sparkles size={24} className="fill-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                  Ikuti Kami di Media Sosial
                </p>
                <p className="text-sm font-black tracking-tight">
                  Bergabung bersama komunitas {orgName} di Instagram 🌸
                </p>
              </div>
              <ExternalLink size={16} className="ml-auto opacity-70" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
