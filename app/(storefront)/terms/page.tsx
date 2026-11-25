'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  RefreshCcw,
  AlertCircle,
  Scale,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/hooks/use-organization';

export default function TermsAndConditionsPage() {
  const { organization } = useOrganization();
  const orgName = organization?.name || 'Zelvira';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="mb-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full group text-neutral-400 hover:text-pink-500">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-pink-500 mb-2">
          <FileText size={20} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ketentuan Legal</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-neutral-900 uppercase tracking-tight mb-4">
          Syarat & Ketentuan Layanan
        </h1>
        <p className="text-neutral-500 font-medium leading-relaxed">
          Selamat datang di platform e-commerce <strong>{orgName}</strong>. Syarat dan Ketentuan berikut mengatur penggunaan Anda atas website, aplikasi mobile, dan seluruh layanan yang disediakan oleh {orgName}. Dengan mengakses atau bertransaksi di platform kami, Anda menyetujui ketentuan di bawah ini.
        </p>
      </div>

      <div className="space-y-10 text-neutral-700 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="bg-neutral-50 p-8 md:p-10 rounded-[2.5rem] border border-neutral-100">
          <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-neutral-900 flex items-center gap-3">
            <ShieldCheck size={22} className="text-pink-500 shrink-0" /> 1. Ketentuan Umum & Definisi
          </h2>
          <div className="space-y-3">
            <p>
              Dalam Syarat dan Ketentuan ini, yang dimaksud dengan:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600">
              <li><strong>Platform:</strong> Mengacu pada situs web resmi (zelvira.my.id / zelvira.com) dan aplikasi mobile Zelvira.</li>
              <li><strong>Pengguna / Anda:</strong> Setiap pihak atau individu yang mengakses, mendaftar, atau melakukan pembelian produk melalui platform {orgName}.</li>
              <li><strong>Produk:</strong> Segala busana, aksesoris, voucher, dan produk gaya hidup yang ditawarkan untuk dijual di platform kami.</li>
              <li><strong>Layanan:</strong> Seluruh fitur, transaksi online, katalog produk, dan dukungan pelanggan yang disediakan oleh {orgName}.</li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-3">
            <AlertCircle size={22} className="text-pink-500 shrink-0" /> 2. Akun & Keamanan Pengguna
          </h2>
          <p>
            Untuk menikmati pengalaman berbelanja penuh, Anda dapat mendaftarkan akun menggunakan nomor telepon atau email yang valid.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-neutral-600">
            <li>Anda bertanggung jawab penuh atas kerahasiaan kata sandi (password) serta seluruh aktivitas yang terjadi di bawah akun Anda.</li>
            <li>Anda wajib memberikan informasi data diri yang akurat, terkini, dan lengkap saat pendaftaran atau proses checkout.</li>
            <li>{orgName} berhak membatasi, menangguhkan, atau menonaktifkan akun pengguna apabila terindikasi melakukan penipuan, pelanggaran sistem, atau pelanggaran ketentuan hukum.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-3">
            <CreditCard size={22} className="text-pink-500 shrink-0" /> 3. Harga, Pemesanan & Pembayaran
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-neutral-600">
            <li>Semua harga produk tercantum dalam mata uang <strong>Rupiah (IDR)</strong> dan belum termasuk biaya pengiriman kecuali dinyatakan dalam promo tertentu.</li>
            <li>{orgName} berhak sewaktu-waktu memperbarui harga, diskon, atau promo produk tanpa pemberitahuan sebelumnya.</li>
            <li>Pembayaran dapat dilakukan melalui metode resmi yang tersedia di checkout: Virtual Account Bank (BCA, Mandiri, BNI, BRI, Permata), QRIS, E-Wallet (GoPay, ShopeePay), Kartu Kredit, atau Saldo Dompet Zelvira.</li>
            <li>Pesanan yang belum diselesaikan pembayarannya dalam batas waktu pembayaran otomatis akan dibatalkan oleh sistem.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-3">
            <Truck size={22} className="text-pink-500 shrink-0" /> 4. Pengiriman & Penerimaan Pesanan
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-neutral-600">
            <li>Pesanan akan diproses dan diserahkan kepada kurir mitra (JNE, J&T, SiCepat, Anteraja, GoSend/Grab) dalam waktu 1-2 hari kerja setelah pembayaran terkonfirmasi.</li>
            <li>Estimasi waktu sampai bergantung pada wilayah pengiriman dan jenis layanan kurir yang Anda pilih pada saat checkout.</li>
            <li>Resi pelacakan resmi akan diupdate dan dapat dipantau langsung pada menu <strong>Pesanan Saya</strong>.</li>
            <li>Pastikan alamat pengiriman dan nomor telepon penerima yang Anda cantumkan tepat dan aktif untuk mempermudah kurir logistik.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-3">
            <RefreshCcw size={22} className="text-pink-500 shrink-0" /> 5. Pengembalian Produk (Retur) & Refund
          </h2>
          <p>
            Kami memberikan garansi pengembalian produk selama <strong>7 (tujuh) hari kalender</strong> sejak pesanan diterima, sesuai dengan <Link href="/returns" className="text-pink-600 font-bold underline hover:text-pink-700">Kebijakan Pengembalian</Link> kami.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-neutral-600">
            <li>Produk harus dalam kondisi baru, belum dicuci, belum dipakai, serta tag dan kemasan aslinya masih utuh.</li>
            <li>Pengembalian berlaku apabila produk cacat produksi, ukuran/warna salah kirim, atau barang tidak sesuai deskripsi.</li>
            <li>Pengembalian dana (refund) akan diproses ke rekening asal atau saldo dompet pengguna setelah verifikasi barang retur selesai.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-3">
            <Scale size={22} className="text-pink-500 shrink-0" /> 6. Hak Kekayaan Intelektual
          </h2>
          <p>
            Seluruh konten yang terdapat di platform {orgName}, termasuk namun tidak terbatas pada logo, merek dagang, teks, foto produk, video, desain busana, dan tata letak web adalah milik sah dari {orgName} dan dilindungi oleh Undang-Undang Hak Cipta Republik Indonesia. Dilarang menduplikasi, memodifikasi, atau menggunakan konten tanpa izin tertulis dari manajemen {orgName}.
          </p>
        </section>

        {/* Section 7 */}
        <section className="bg-neutral-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-xl space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
            <HelpCircle size={22} className="text-pink-400 shrink-0" /> 7. Hukum yang Berlaku & Bantuan
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul akan diupayakan untuk diselesaikan secara musyawarah dan kekeluargaan terlebih dahulu.
          </p>
          <p className="text-neutral-400 text-xs">
            Jika Anda memiliki pertanyaan seputar ketentuan ini, silakan hubungi tim kami melalui halaman <Link href="/contact" className="text-pink-400 font-bold underline">Hubungi Kami</Link> atau email resmi di <strong>{organization?.email || 'info@zelvira.com'}</strong>.
          </p>
        </section>

        <div className="pt-8 border-t border-neutral-100 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            Terakhir diperbarui: 24 Oktober 2026 • © {new Date().getFullYear()} {orgName}
          </p>
        </div>
      </div>
    </div>
  );
}
