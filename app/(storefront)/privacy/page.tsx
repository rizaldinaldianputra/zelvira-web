'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Server, 
  ArrowLeft, 
  Bell, 
  Loader2, 
  Calendar, 
  FileCheck 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PrivacyPolicyService, PrivacyPolicy } from '@/services/privacy.service';
import { useOrganization } from '@/hooks/use-organization';

export default function PrivacyPolicyPage() {
  const { organization } = useOrganization();
  const orgName = organization?.name || 'Zelvira';

  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchActivePolicy = async () => {
      try {
        const data = await PrivacyPolicyService.getActive();
        if (isMounted && data) {
          setPolicy(data);
        }
      } catch (err) {
        console.error('Failed to load privacy policy from API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActivePolicy();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '24 Oktober 2026';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="mb-12">
        <Link href="/help">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full group text-neutral-400 hover:text-pink-500">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Pusat Bantuan
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-pink-500 mb-2">
          <ShieldCheck size={20} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Perlindungan Data & Privasi</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-neutral-900 uppercase tracking-tight mb-4">
          {policy?.title || 'Kebijakan Privasi'}
        </h1>
        <p className="text-neutral-500 font-medium leading-relaxed">
          Privasi Anda adalah prioritas utama kami. Kebijakan ini menjelaskan bagaimana {orgName} mengumpulkan, menggunakan, melindungi, dan menghormati data pribadi Anda.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-pink-500" size={36} />
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
            Memuat Kebijakan Privasi Resmi...
          </p>
        </div>
      ) : policy?.content ? (
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 border-b border-neutral-100 pb-4">
            <Calendar size={15} className="text-pink-500" />
            <span>Terakhir diperbarui: {formatDate(policy.updatedAt)}</span>
          </div>

          <div
            className="prose prose-neutral max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-neutral-900 prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-neutral-600 prose-p:leading-relaxed prose-li:text-neutral-600 prose-a:text-pink-600 prose-a:font-bold prose-strong:text-neutral-900 bg-white p-8 md:p-12 rounded-[2.5rem] border border-neutral-100 shadow-sm"
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />

          <div className="rounded-2xl bg-neutral-50 p-6 border border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck size={20} className="text-emerald-500" />
              <span className="text-xs font-bold text-neutral-700">Kebijakan Privasi Aktif Terverifikasi</span>
            </div>
            <Link href="/delete-account" className="text-xs font-bold text-pink-600 hover:underline">
              Panduan Hapus Akun & Data →
            </Link>
          </div>
        </div>
      ) : (
        /* Fallback Structured View if API content is empty */
        <div className="space-y-10 text-neutral-700 text-sm leading-relaxed">
          <section className="bg-neutral-50 p-8 md:p-10 rounded-[2.5rem] border border-neutral-100">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-neutral-900 flex items-center gap-3">
              <Eye size={20} className="text-pink-500" /> 1. Data yang Kami Kumpulkan
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Kami mengumpulkan informasi yang Anda berikan saat mendaftar akun, melakukan transaksi, atau menghubungi layanan pelanggan, mencakup nama lengkap, nomor telepon, alamat email, alamat pengiriman, dan riwayat pesanan.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">2. Penggunaan Data Pribadi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Server, title: 'Pemrosesan Pesanan', desc: 'Memproses pembayaran, pengemasan, dan pengiriman produk pesanan Anda.' },
                { icon: Bell, title: 'Pemberitahuan Status', desc: 'Mengirim informasi resi pelacakan, promo, dan konfirmasi transaksi.' },
                { icon: ShieldCheck, title: 'Keamanan Transaksi', desc: 'Mencegah penipuan, transaksi tidak sah, dan penyalahgunaan akun.' },
                { icon: Lock, title: 'Peningkatan Layanan', desc: 'Mengoptimalkan performa aplikasi dan pengalaman berbelanja Anda.' },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-3xl border border-neutral-100 bg-white shadow-sm hover:border-pink-200 transition-colors">
                  <item.icon size={20} className="text-pink-500 mb-3" />
                  <h4 className="font-black uppercase tracking-tight text-neutral-900 text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-neutral-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-neutral-900 text-white p-8 md:p-12 rounded-[3rem] shadow-xl space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">3. Kerahasiaan Data & Pihak Ketiga</h2>
            <p className="text-neutral-400 font-medium leading-relaxed">
              {orgName} tidak pernah menjual informasi pribadi Anda kepada pihak manapun. Data hanya dibagikan kepada mitra operasional resmi (gerbang pembayaran dan kurir logistik) untuk kebutuhan penyelesaian transaksi Anda.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 m-0">4. Hak Anda atas Data Pribadi</h2>
            <p className="text-neutral-600 font-medium leading-relaxed">
              Anda berhak memperbarui data profil, meminta riwayat data, maupun menghapus akun secara permanen melalui menu profil atau halaman{' '}
              <Link href="/delete-account" className="text-pink-600 font-bold underline">Penghapusan Akun</Link>.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
