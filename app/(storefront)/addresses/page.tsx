'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, MapPin, Phone, User, Home, 
  Briefcase, Edit2, Trash2, 
  CheckCircle2, ArrowLeft, Globe
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Address } from '@/types/address';
import { authService } from '@/services/auth.service';
import { AddressService } from '@/services/address.service';
import { toast } from 'sonner';

export default function AddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.push('/login?redirect=/addresses');
      return;
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redir = params.get('redirect');
      if (redir) setRedirectUrl(redir);

      if (params.get('action') === 'add') {
        router.replace(redir ? `/addresses/add?redirect=${redir}` : '/addresses/add');
        return;
      }
    }

    loadAddresses();
  }, [router]);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await AddressService.getAll();
      setAddresses(data || []);
    } catch (error) {
      toast.error('Gagal memuat daftar alamat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
    try {
      await AddressService.delete(id);
      toast.success('Alamat berhasil dihapus');
      loadAddresses();
    } catch (error) {
      toast.error('Gagal menghapus alamat');
    }
  };

  const handleSetDefault = async (id: number | string) => {
    try {
      await AddressService.setDefault(id);
      toast.success('Alamat utama berhasil diubah');
      loadAddresses();
    } catch (error) {
      toast.error('Gagal mengatur alamat utama');
    }
  };

  const addAddressHref = redirectUrl ? `/addresses/add?redirect=${redirectUrl}` : '/addresses/add';
  const backHref = redirectUrl || '/profile';
  const backLabel = redirectUrl === '/checkout' ? 'Kembali ke Checkout' : 'Back to Profile';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-neutral-400 font-bold text-xs uppercase tracking-widest mb-3 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft size={14} /> {backLabel}
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight">
            Alamat <span className="text-pink-500 italic">Pengiriman</span>
          </h1>
          <p className="text-neutral-500 text-xs mt-1">
            Kelola alamat tujuan pengiriman untuk belanja online di Zelvira.
          </p>
        </div>

        <Link
          href={addAddressHref}
          className="px-8 py-4 bg-neutral-900 hover:bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus size={18} /> Tambah Alamat Baru
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-neutral-50 rounded-[3rem] p-16 sm:p-20 text-center border-2 border-dashed border-neutral-200 space-y-4">
          <MapPin size={48} className="mx-auto text-neutral-300" />
          <h3 className="text-2xl font-black text-neutral-900">Belum Ada Alamat Pengiriman</h3>
          <p className="text-neutral-500 text-xs max-w-sm mx-auto">
            Tambahkan alamat pengiriman pertama Anda untuk menghitung ongkir resmi dan melanjutkan checkout.
          </p>
          <Link
            href={addAddressHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-200 transition-all mt-2"
          >
            <Plus size={16} /> Buat Alamat Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {addresses.map((addr) => {
            const editHref = redirectUrl
              ? `/addresses/add?id=${addr.id}&redirect=${redirectUrl}`
              : `/addresses/add?id=${addr.id}`;

            return (
              <motion.div 
                key={addr.id}
                layout
                className={`relative group bg-white p-8 sm:p-10 rounded-[3rem] border-2 transition-all flex flex-col justify-between ${
                  addr.isDefault
                    ? 'border-neutral-900 shadow-2xl shadow-black/5'
                    : 'border-neutral-100 hover:border-neutral-300 shadow-sm'
                }`}
              >
                {addr.isDefault && (
                  <div className="absolute -top-3 left-10 px-4 py-1.5 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                    <CheckCircle2 size={12} className="text-pink-400" /> Alamat Utama
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        addr.label?.toLowerCase() === 'kantor' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                      }`}>
                        {addr.label?.toLowerCase() === 'kantor' ? <Briefcase size={22} /> : <Home size={22} />}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-neutral-900">{addr.label || 'Rumah'}</h3>
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <Globe size={11} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{addr.cityName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Link
                        href={editHref}
                        className="p-2.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors"
                        title="Edit Alamat"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="p-2.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Hapus Alamat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3.5">
                      <User size={16} className="text-neutral-300 mt-1 shrink-0" />
                      <div>
                        <p className="text-sm font-black text-neutral-900">{addr.recipientName}</p>
                        <p className="text-xs text-neutral-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} className="text-neutral-400" /> {addr.phoneNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <MapPin size={16} className="text-pink-500 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-neutral-700 leading-relaxed mb-1">
                          {addr.addressLine}
                        </p>
                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider leading-relaxed">
                          {[addr.districtName, addr.cityName, addr.provinceName, addr.postalCode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
                  {!addr.isDefault ? (
                    <button 
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-pink-500 transition-colors"
                    >
                      Jadikan Alamat Utama
                    </button>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      ✓ Default Shipping
                    </span>
                  )}
                  <div className="ml-auto w-8 h-1 rounded-full bg-neutral-100 group-hover:bg-pink-200 transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
