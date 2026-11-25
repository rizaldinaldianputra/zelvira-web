'use client';

import React from 'react';
import { Trash2, AlertTriangle, CheckCircle2, Mail, ShieldAlert, ArrowLeft, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DeleteAccountPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="mb-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full group text-neutral-400 hover:text-pink-500">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-rose-500 mb-2">
          <Trash2 size={20} className="stroke-[2.5]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Manajemen Data Pengguna</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-neutral-900 uppercase tracking-tight mb-4">
          Penghapusan Akun & Data Pengguna Zelvira
        </h1>
        <p className="text-neutral-500 font-medium leading-relaxed">
          Zelvira menghormati hak privasi dan kendali penuh Anda atas data pribadi. Panduan ini menjelaskan bagaimana pengguna aplikasi mobile maupun website Zelvira dapat meminta penghapusan akun dan data pribadi terkait.
        </p>
      </div>

      <div className="space-y-10">
        {/* Step-by-Step Instructions */}
        <section className="bg-neutral-50 p-8 md:p-10 rounded-[2.5rem] border border-neutral-100">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6 text-neutral-900 flex items-center gap-3">
            <CheckCircle2 size={22} className="text-pink-500" /> Cara Meminta Penghapusan Akun
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200">
              <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-black rounded-full uppercase tracking-wider mb-3">
                Metode 1: Langsung Melalui Aplikasi Mobile Zelvira (Instan)
              </span>
              <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600 font-medium">
                <li>Buka aplikasi mobile <strong>Zelvira</strong> di smartphone Anda dan pastikan telah login.</li>
                <li>Masuk ke menu tab <strong>Akun / Profil</strong> di navigasi bawah.</li>
                <li>Pilih menu <strong>Pengaturan (Settings)</strong>.</li>
                <li>Gulir ke bawah dan ketuk opsi <strong>Hapus Akun (Delete Account)</strong>.</li>
                <li>Konfirmasikan permintaan penghapusan akun Anda pada dialog pop-up. Akun akan segera diproses.</li>
              </ol>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200">
              <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-black rounded-full uppercase tracking-wider mb-3">
                Metode 2: Melalui Email Dukungan (Tanpa Perlu Memasang Aplikasi)
              </span>
              <p className="text-sm text-neutral-600 font-medium mb-3">
                Jika Anda telah menghapus aplikasi Zelvira atau tidak memiliki akses login, Anda dapat mengirimkan permohonan melalui email resmi kami:
              </p>
              <ul className="space-y-2 text-sm text-neutral-600 font-medium list-disc list-inside">
                <li>Kirim email ke: <strong className="text-pink-600">privacy@zelvira.id</strong> atau <strong className="text-pink-600">support@zelvira.id</strong></li>
                <li>Subjek: <strong>Permohonan Penghapusan Akun dan Data Zelvira</strong></li>
                <li>Sertakan: Alamat email terdaftar dan nomor telepon yang terkait dengan akun Zelvira Anda.</li>
                <li>Tim keamanan kami akan melakukan verifikasi kepemilikan akun dan memproses penghapusan dalam waktu maksimal <strong>7 hari kerja</strong>.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Types Deleted */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-rose-50/50 p-8 rounded-[2rem] border border-rose-100">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <Trash2 size={22} />
              <h3 className="text-lg font-black uppercase tracking-tight">Data yang Akan Dihapus</h3>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700 font-medium list-disc list-inside">
              <li>Informasi profil pengguna (Nama lengkap, foto profil, email, nomor HP).</li>
              <li>Kredensial otentikasi (Password terenkripsi, token login, OAuth session).</li>
              <li>Daftar alamat pengiriman yang tersimpan di buku alamat.</li>
              <li>Daftar keinginan (Wishlist) dan riwayat pencarian produk.</li>
              <li>Token perangkat FCM untuk notifikasi push.</li>
            </ul>
          </div>

          <div className="bg-amber-50/50 p-8 rounded-[2rem] border border-amber-100">
            <div className="flex items-center gap-3 text-amber-700 mb-4">
              <Clock size={22} />
              <h3 className="text-lg font-black uppercase tracking-tight">Data yang Dipertahankan & Retensi</h3>
            </div>
            <p className="text-sm text-neutral-700 font-medium leading-relaxed mb-3">
              Berdasarkan peraturan perundang-undangan perpajakan dan transaksi komersial elektronik yang berlaku di Republik Indonesia:
            </p>
            <ul className="space-y-2 text-sm text-neutral-700 font-medium list-disc list-inside">
              <li><strong>Riwayat Transaksi Keuangan & Faktur Pembayaran:</strong> Dipertahankan selama periode retensi hukum (hingga 5 tahun) untuk audit perpajakan dan pelaporan finansial wajib, dengan identitas akun dianonimkan.</li>
              <li>Data penanganan komplain atau sengketa transaksi yang sedang aktif hingga kasus diselesaikan.</li>
            </ul>
          </div>
        </section>

        {/* Partial Deletion */}
        <section className="bg-neutral-900 text-white p-8 md:p-10 rounded-[2.5rem]">
          <div className="flex items-center gap-3 text-pink-400 mb-4">
            <FileText size={22} />
            <h3 className="text-lg font-black uppercase tracking-tight">Permintaan Penghapusan Sebagian Data</h3>
          </div>
          <p className="text-sm text-neutral-300 font-medium leading-relaxed mb-4">
            Pengguna tidak diwajibkan menghapus keseluruhan akun jika hanya ingin menghapus data tertentu. Anda dapat secara mandiri:
          </p>
          <ul className="space-y-2 text-sm text-neutral-300 font-medium list-disc list-inside">
            <li>Menghapus atau mengubah alamat tersimpan melalui menu <strong>Alamat Saya</strong>.</li>
            <li>Menghapus item di <strong>Wishlist</strong> atau <strong>Keranjang Belanja</strong>.</li>
            <li>Mengubah nama atau foto profil di menu <strong>Edit Profil</strong>.</li>
            <li>Berhenti berlangganan email marketing (Newsletter) dengan mengeklik tautan <em>Unsubscribe</em> di bagian bawah email promosi.</li>
          </ul>
        </section>

        {/* Contact Support */}
        <div className="p-8 bg-neutral-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-black text-neutral-900 uppercase text-sm mb-1">Butuh bantuan lebih lanjut?</h4>
            <p className="text-xs text-neutral-500 font-medium">Hubungi tim perlindungan data dan privasi kami kapan saja.</p>
          </div>
          <a href="mailto:privacy@zelvira.id">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6 font-bold text-xs uppercase tracking-wider">
              <Mail className="w-4 h-4 mr-2" /> Hubungi privacy@zelvira.id
            </Button>
          </a>
        </div>

        <div className="pt-6 border-t border-neutral-100 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
            Zelvira E-Commerce Platform • Terakhir Diperbarui: 21 Oktober 2026
          </p>
        </div>
      </div>
    </div>
  );
}
