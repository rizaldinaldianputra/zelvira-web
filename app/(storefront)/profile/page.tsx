'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Wallet, Ticket, History, Package, Settings, Shield,
  Mail, Phone, Camera, Save, Edit2, Trash2, Plus, ChevronRight, LogOut,
  Check, Copy, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, Clock,
  Truck, Coins, ArrowUpRight, ArrowDownLeft, Loader2, X, Search, Sparkles,
  ExternalLink, RefreshCw, ShoppingBag, Bell, Globe, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { toast } from 'sonner';
import { authService, AuthUser } from '@/services/auth.service';
import { AddressService } from '@/services/address.service';
import { Address } from '@/types/address';
import { walletService, WalletInfo, WalletTransaction } from '@/services/wallet.service';
import { VoucherService } from '@/services/voucher.service';
import { Voucher } from '@/types/voucher';
import { OrderService } from '@/services/order.service';
import { Order, OrderStatus } from '@/types/order';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { ShippingService, LocationItem } from '@/services/shipping.service';
import { formatImageUrl } from '@/lib/url-utils';

declare global {
  interface Window {
    snap: any;
  }
}

type TabId = 'personal' | 'addresses' | 'wallet' | 'vouchers' | 'recently-viewed' | 'orders' | 'preferences' | 'security';

interface RecentlyViewedItem {
  id: number;
  name: string;
  slug?: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  viewedAt?: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Personal Info Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUpdatingPersonal, setIsUpdatingPersonal] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addrLabel, setAddrLabel] = useState('Rumah');
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine, setAddrLine] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [subdistricts, setSubdistricts] = useState<LocationItem[]>([]);
  const [selectedProv, setSelectedProv] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDist, setSelectedDist] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Wallet State
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<string>('100000');
  const [isProcessingTopup, setIsProcessingTopup] = useState(false);

  // Vouchers State
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [claimVoucherCode, setClaimVoucherCode] = useState('');
  const [isClaimingVoucher, setIsClaimingVoucher] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Recently Viewed State
  const [recentProducts, setRecentProducts] = useState<RecentlyViewedItem[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Preferences State
  const [prefWhatsApp, setPrefWhatsApp] = useState(true);
  const [prefPromos, setPrefPromos] = useState(true);
  const [prefNewsletter, setPrefNewsletter] = useState(false);
  const [prefLanguage, setPrefLanguage] = useState<'id' | 'en'>('id');
  const [prefCurrency, setPrefCurrency] = useState('IDR');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // 1. Initial Load: User data
  useEffect(() => {
    const cachedUser = authService.getUser();
    if (cachedUser) {
      setUser(cachedUser);
      setFullName(cachedUser.fullName || '');
      setPhoneNumber(cachedUser.phoneNumber || '');
    }

    if (authService.isLoggedIn()) {
      authService.fetchMe()
        .then((freshUser) => {
          setUser(freshUser);
          setFullName(freshUser.fullName || '');
          setPhoneNumber(freshUser.phoneNumber || '');
        })
        .catch(console.error)
        .finally(() => setIsLoadingUser(false));
    } else {
      setIsLoadingUser(false);
    }

    // Load saved preferences from localStorage
    try {
      const savedPrefs = localStorage.getItem('zelixa_user_preferences');
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.whatsApp !== undefined) setPrefWhatsApp(parsed.whatsApp);
        if (parsed.promos !== undefined) setPrefPromos(parsed.promos);
        if (parsed.newsletter !== undefined) setPrefNewsletter(parsed.newsletter);
        if (parsed.language) setPrefLanguage(parsed.language);
        if (parsed.currency) setPrefCurrency(parsed.currency);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // 2. Fetch specific tab data on activeTab change
  useEffect(() => {
    if (!authService.isLoggedIn()) return;

    if (activeTab === 'addresses') {
      loadAddresses();
      if (provinces.length === 0) {
        ShippingService.getProvinces().then(setProvinces).catch(() => { });
      }
    } else if (activeTab === 'wallet') {
      loadWallet();
    } else if (activeTab === 'vouchers') {
      loadVouchers();
    } else if (activeTab === 'recently-viewed') {
      loadRecentlyViewed();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  // Address Cascading Lookups
  useEffect(() => {
    if (selectedProv) {
      ShippingService.getCities(selectedProv).then(setCities).catch(() => { });
    } else {
      setCities([]);
    }
  }, [selectedProv]);

  useEffect(() => {
    if (selectedCity) {
      ShippingService.getDistricts(selectedCity).then(setDistricts).catch(() => { });
    } else {
      setDistricts([]);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedDist) {
      ShippingService.getSubdistricts(selectedDist).then(setSubdistricts).catch(() => { });
    } else {
      setSubdistricts([]);
    }
  }, [selectedDist]);

  // Tab Loaders
  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const data = await AddressService.getAll();
      setAddresses(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const loadWallet = async () => {
    setIsLoadingWallet(true);
    try {
      const data = await walletService.getWalletInfo();
      setWallet(data);

      // Check if there are any recent PENDING topup transactions and verify them with Midtrans
      const pendingTopup = data?.recentTransactions?.find(
        (tx: any) => tx.type === 'TOPUP' && (tx.status === 'PENDING' || tx.status === 'pending')
      );
      if (pendingTopup?.id) {
        try {
          const verifyRes = await walletService.verifyTopup(pendingTopup.id);
          if (verifyRes?.status === 'SUCCESS') {
            const updated = await walletService.getWalletInfo();
            setWallet(updated);
            authService.fetchMe().then(setUser).catch(() => { });
          }
        } catch (e) {
          console.warn('[loadWallet] Auto-verify topup error:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load wallet', err);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const loadVouchers = async () => {
    setIsLoadingVouchers(true);
    try {
      const [avail, claimed] = await Promise.allSettled([
        VoucherService.getAvailable(),
        VoucherService.getMyVouchers()
      ]);
      const list: Voucher[] = [];
      if (avail.status === 'fulfilled' && Array.isArray(avail.value)) {
        list.push(...avail.value);
      }
      if (claimed.status === 'fulfilled' && Array.isArray(claimed.value)) {
        claimed.value.forEach((c: any) => {
          if (c.voucher && !list.some(v => v.id === c.voucher.id)) {
            list.push(c.voucher);
          }
        });
      }
      setVouchers(list);
    } catch (err) {
      console.error('Failed to load vouchers', err);
    } finally {
      setIsLoadingVouchers(false);
    }
  };

  const loadRecentlyViewed = async () => {
    setIsLoadingRecent(true);
    try {
      const stored = localStorage.getItem('zelixa_recent_views');
      if (stored) {
        setRecentProducts(JSON.parse(stored));
      } else {
        setRecentProducts([]);
      }
      // Also fetch popular recommendations
      const rec = await ProductService.getAll(0, 4);
      const items = (rec as any)?.content || (rec as any)?.data?.content || (Array.isArray(rec) ? rec : []);
      setRecommendedProducts(items);
    } catch (err) {
      console.error('Failed to load recent products', err);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await OrderService.getMyOrders();
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setOrders(list.sort((a: Order, b: Order) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Actions
  const handleUpdatePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Nama lengkap tidak boleh kosong');
      return;
    }

    setIsUpdatingPersonal(true);
    try {
      const updated = await authService.updateProfile({ fullName, phoneNumber });
      setUser(updated);
      toast.success('Profil berhasil diperbarui!');
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui profil');
    } finally {
      setIsUpdatingPersonal(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Silakan unggah berkas gambar (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const updated = await authService.updateProfilePicture(file);
      setUser(updated);
      toast.success('Foto profil berhasil diubah!');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengunggah foto profil');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Address Modal Helpers
  const handleOpenAddressModal = (addr: Address | null = null) => {
    if (addr) {
      setEditingAddress(addr);
      setAddrLabel(addr.label || 'Rumah');
      setAddrRecipient(addr.recipientName || '');
      setAddrPhone(addr.phoneNumber || '');
      setAddrLine(addr.addressLine || '');
      setAddrPostal(addr.postalCode || '');
      setAddrIsDefault(Boolean(addr.isDefault));
      setSelectedProv(addr.provinceId || '');
      setTimeout(() => setSelectedCity(addr.cityId || ''), 400);
      setTimeout(() => setSelectedDist(addr.districtId || ''), 800);
      setTimeout(() => setSelectedSub(addr.subdistrictId || ''), 1200);
    } else {
      setEditingAddress(null);
      setAddrLabel('Rumah');
      setAddrRecipient(user?.fullName || '');
      setAddrPhone(user?.phoneNumber || '');
      setAddrLine('');
      setAddrPostal('');
      setAddrIsDefault(addresses.length === 0);
      setSelectedProv('');
      setSelectedCity('');
      setSelectedDist('');
      setSelectedSub('');
    }
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrRecipient.trim() || !addrPhone.trim() || !addrLine.trim()) {
      toast.error('Lengkapi nama penerima, nomor telepon, dan detail alamat.');
      return;
    }

    const provItem = provinces.find(p => String(p.id || p.province_id) === String(selectedProv));
    const provName = provItem?.name || provItem?.province || '';

    const cityItem = cities.find(c => String(c.id || c.city_id) === String(selectedCity));
    const cityName = cityItem ? `${cityItem.type || ''} ${cityItem.name || cityItem.city_name || cityItem.city || ''}`.trim() : '';

    const distItem = districts.find(d => String(d.id || d.district_id) === String(selectedDist));
    const distName = distItem?.name || distItem?.district_name || '';

    const subItem = subdistricts.find(s => String(s.id || s.subdistrict_id) === String(selectedSub));
    const subName = subItem?.name || subItem?.subdistrict_name || '';

    const payload: Partial<Address> = {
      label: addrLabel,
      recipientName: addrRecipient,
      phoneNumber: addrPhone,
      addressLine: addrLine,
      postalCode: addrPostal,
      isDefault: addrIsDefault,
      provinceId: selectedProv,
      provinceName: provName,
      cityId: selectedCity,
      cityName: cityName,
      districtId: selectedDist,
      districtName: distName,
      subdistrictId: selectedSub,
      subdistrictName: subName,
    };

    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        await AddressService.update(editingAddress.id, payload);
        toast.success('Alamat berhasil diperbarui!');
      } else {
        await AddressService.create(payload);
        toast.success('Alamat baru berhasil ditambahkan!');
      }
      setAddressModalOpen(false);
      loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan alamat');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (id: number | string) => {
    try {
      await AddressService.setDefault(id);
      toast.success('Alamat utama berhasil diubah!');
      loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengatur alamat utama');
    }
  };

  const handleDeleteAddress = async (id: number | string) => {
    if (!confirm('Yakin ingin menghapus alamat pengiriman ini?')) return;
    try {
      await AddressService.delete(id);
      toast.success('Alamat berhasil dihapus');
      loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus alamat');
    }
  };

  // Top Up Wallet Action
  const handleInitiateTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt < 10000) {
      toast.error('Nominal top up minimal Rp 10.000');
      return;
    }

    setIsProcessingTopup(true);
    try {
      const res = await walletService.initiateTopup(amt);
      const transactionId = res?.id || res?.transactionId;

      const verifyAndRefresh = async () => {
        if (transactionId) {
          try {
            const vRes = await walletService.verifyTopup(transactionId);
            if (vRes?.status === 'SUCCESS') {
              toast.success(vRes.message || 'Top up saldo berhasil ditambahkan!');
            }
          } catch (e) {
            console.warn('[verifyAndRefresh] topup verify:', e);
          }
        }
        await loadWallet();
        authService.fetchMe().then(setUser).catch(() => { });
      };

      if (res?.token && window.snap) {
        window.snap.pay(res.token, {
          onSuccess: async (result: any) => {
            setTopupModalOpen(false);
            await verifyAndRefresh();
          },
          onPending: async (result: any) => {
            toast.info('Instruksi pembayaran top up telah dibuat. Silakan selesaikan pembayaran.');
            setTopupModalOpen(false);
            await verifyAndRefresh();
          },
          onError: () => {
            toast.error('Top up dibatalkan atau terjadi kesalahan.');
          },
          onClose: async () => {
            await verifyAndRefresh();
          }
        });
      } else if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        toast.success('Permintaan top up diproses');
        setTopupModalOpen(false);
        await verifyAndRefresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses top up');
    } finally {
      setIsProcessingTopup(false);
    }
  };

  // Voucher Claim & Copy
  const handleClaimVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimVoucherCode.trim()) {
      toast.error('Masukkan kode voucher');
      return;
    }

    setIsClaimingVoucher(true);
    try {
      await VoucherService.claim(claimVoucherCode.trim().toUpperCase());
      toast.success(`Voucher ${claimVoucherCode.toUpperCase()} berhasil diklaim!`);
      setClaimVoucherCode('');
      loadVouchers();
    } catch (err: any) {
      toast.error(err.message || 'Kode voucher tidak valid atau sudah kedaluwarsa');
    } finally {
      setIsClaimingVoucher(false);
    }
  };

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Kode voucher ${code} berhasil disalin!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Orders Pay Now
  const handlePayOrder = (order: Order) => {
    if (order.paymentToken && window.snap) {
      window.snap.pay(order.paymentToken, {
        onSuccess: () => {
          toast.success('Pembayaran pesanan berhasil!');
          loadOrders();
        },
        onPending: () => {
          toast.info('Menunggu penyelesaian pembayaran pesanan.');
          loadOrders();
        },
        onError: () => {
          toast.error('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => {
          toast.info('Jendela pembayaran ditutup.');
        }
      });
    } else if (order.paymentUrl) {
      window.open(order.paymentUrl, '_blank');
    } else {
      toast.error('Token pembayaran tidak ditemukan. Buka halaman detail pesanan.');
    }
  };

  // Preferences Save
  const handleSavePreferences = () => {
    const prefs = {
      whatsApp: prefWhatsApp,
      promos: prefPromos,
      newsletter: prefNewsletter,
      language: prefLanguage,
      currency: prefCurrency
    };
    try {
      localStorage.setItem('zelixa_user_preferences', JSON.stringify(prefs));
      toast.success('Preferensi akun berhasil disimpan!');
    } catch (e) {
      toast.error('Gagal menyimpan preferensi');
    }
  };

  // Security: Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok');
      return;
    }

    setIsChangingPass(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password berhasil diperbarui! Gunakan password baru untuk login berikutnya.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah password');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Security: Delete Account
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await authService.deleteAccount();
      toast.success('Akun Anda telah dinonaktifkan.');
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus akun');
      setIsDeletingAccount(false);
    }
  };

  // Tab Definitions matching user request
  const tabs = [
    { id: 'personal' as TabId, label: 'Personal Info', icon: User, badge: null },
    { id: 'addresses' as TabId, label: 'Addresses', icon: MapPin, badge: addresses.length ? addresses.length : null },
    { id: 'wallet' as TabId, label: 'My Wallet', icon: Wallet, badge: user?.balance ? `Rp ${(user.balance / 1000).toFixed(0)}k` : null },
    { id: 'vouchers' as TabId, label: 'Vouchers', icon: Ticket, badge: vouchers.length ? vouchers.length : null },
    { id: 'recently-viewed' as TabId, label: 'Recently Viewed', icon: History, badge: recentProducts.length ? recentProducts.length : null },
    { id: 'orders' as TabId, label: 'Orders', icon: Package, badge: orders.filter(o => o.status === 'PENDING').length ? `${orders.filter(o => o.status === 'PENDING').length} Unpaid` : null },
    { id: 'preferences' as TabId, label: 'Preferences', icon: Settings, badge: null },
    { id: 'security' as TabId, label: 'Security', icon: Shield, badge: null },
  ];

  if (!user && !isLoadingUser) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center bg-neutral-50">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <User size={40} className="text-pink-500" />
        </div>
        <h2 className="text-3xl font-black text-neutral-900 tracking-tight mb-3">Silakan Masuk ke Akun Anda</h2>
        <p className="text-neutral-500 max-w-sm mb-8 font-medium">Akses informasi profil, pesanan aktif, voucher eksklusif, dan saldo dompet Zelvira.</p>
        <Link
          href="/login?redirect=/profile"
          className="px-10 py-4 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-pink-600 transition-all active:scale-95"
        >
          Masuk / Daftar
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Midtrans Snap Integration */}
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js'}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="bg-neutral-50/60 min-h-screen pt-8 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* ===================== SIDEBAR ===================== */}
          <aside className="w-full lg:w-84 shrink-0">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 p-6 sm:p-8 border border-neutral-100 sticky top-28">

              {/* VIP Profile Card Header */}
              <div className="text-center pb-6 border-b border-neutral-100">
                <div className="relative inline-block group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-linear-to-tr from-pink-100 to-rose-200 relative mx-auto">
                    {user?.profilePicture ? (
                      <img
                        src={formatImageUrl(user.profilePicture)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-pink-500 to-rose-600 text-white text-3xl font-black">
                        {(user?.fullName || 'Z').charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Camera Upload Overlay */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white cursor-pointer"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <>
                          <Camera size={22} className="mb-1" />
                          <span className="text-[9px] font-black uppercase tracking-wider">Ubah Foto</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-9 h-9 bg-neutral-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-pink-500 transition-colors border-2 border-white"
                    title="Ganti Foto Profil"
                  >
                    <Edit2 size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mt-4 tracking-tight leading-snug">
                  {user?.fullName || 'Pengguna Zelvira'}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-linear-to-r from-amber-500/10 to-yellow-500/15 border border-amber-300/40 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                    <Sparkles size={11} className="text-amber-500" /> VIP Zelvira Club
                  </span>
                </div>
                <p className="text-neutral-400 text-xs font-medium mt-1 truncate max-w-xs mx-auto">
                  {user?.email || ''}
                </p>

                {/* Quick Wallet / Points Glance */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div className="text-left pl-2">
                    <p className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Saldo</p>
                    <p className="text-xs font-black text-neutral-900 truncate">
                      Rp {(wallet?.balance ?? user?.balance ?? 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right pr-2 border-l border-neutral-200">
                    <p className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Poin</p>
                    <p className="text-xs font-black text-pink-600 truncate">
                      {(wallet?.points ?? user?.points ?? 0).toLocaleString('id-ID')} pts
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1.5 mt-5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl transition-all group ${isActive
                        ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-300'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon
                          size={18}
                          className={`transition-colors ${isActive ? 'text-pink-400' : 'text-neutral-400 group-hover:text-pink-500'
                            }`}
                        />
                        <span className="text-xs sm:text-sm font-black tracking-tight">{tab.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tab.badge && (
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-pink-500 text-white' : 'bg-neutral-100 text-neutral-600'
                              }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                        <ChevronRight
                          size={14}
                          className={`transition-transform ${isActive ? 'text-pink-400 translate-x-0.5' : 'text-neutral-300 opacity-60'
                            }`}
                        />
                      </div>
                    </button>
                  );
                })}

                <div className="pt-4 border-t border-neutral-100 mt-4">
                  <button
                    onClick={() => {
                      if (confirm('Yakin ingin keluar dari akun Zelvira?')) {
                        authService.logout();
                        window.location.href = '/login';
                      }
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group font-bold text-xs uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-3.5">
                      <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                      <span>Keluar (Sign Out)</span>
                    </div>
                  </button>
                </div>
              </nav>

            </div>
          </aside>

          {/* ===================== MAIN CONTENT AREA ===================== */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* ---------------- 1. PERSONAL INFO ---------------- */}
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 p-6 sm:p-10 border border-neutral-100">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Profil Pelanggan</span>
                        <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">Informasi Pribadi</h3>
                      </div>
                      <span className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center">
                        <User size={20} />
                      </span>
                    </div>

                    <form onSubmit={handleUpdatePersonalInfo} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">
                            Nama Lengkap
                          </label>
                          <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Nama lengkap Anda"
                              required
                              className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 font-bold text-sm text-neutral-900 transition-all"
                            />
                          </div>
                        </div>

                        {/* Email (Read Only) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pl-1">
                            <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                              Alamat Email
                            </label>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle2 size={11} /> Terverifikasi
                            </span>
                          </div>
                          <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full pl-12 pr-4 py-4 bg-neutral-100 border border-neutral-200 rounded-2xl outline-none font-bold text-sm text-neutral-500 cursor-not-allowed opacity-80"
                            />
                            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">
                            Nomor Telepon / WhatsApp
                          </label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="08123456789 atau +628..."
                              className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 font-bold text-sm text-neutral-900 transition-all"
                            />
                          </div>
                          <p className="text-[10px] text-neutral-400 pl-1">Digunakan untuk konfirmasi pesanan dan pengiriman paket.</p>
                        </div>

                        {/* Account Tier */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">
                            Status Keanggotaan
                          </label>
                          <div className="p-4 bg-linear-to-r from-pink-50 to-rose-50/50 border border-pink-100 rounded-2xl flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-neutral-900 uppercase tracking-wider">Member Zelvira Regular & VIP</p>
                              <p className="text-[10px] text-pink-600 font-bold">Dapatkan cashback poin di setiap transaksi</p>
                            </div>
                            <Sparkles size={20} className="text-pink-500" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={isUpdatingPersonal}
                          className="px-8 py-4 bg-neutral-900 hover:bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-neutral-200 transition-all active:scale-95 flex items-center gap-2.5 disabled:opacity-60"
                        >
                          {isUpdatingPersonal ? (
                            <>
                              <Loader2 className="animate-spin" size={16} /> Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save size={16} /> Simpan Perubahan
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Summary Metric Widgets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Total Pesanan</p>
                        <h4 className="text-2xl font-black text-neutral-900">{orders.length}</h4>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                        <Package size={22} />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Voucher Tersedia</p>
                        <h4 className="text-2xl font-black text-pink-500">{vouchers.length}</h4>
                      </div>
                      <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center">
                        <Ticket size={22} />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Alamat Tersimpan</p>
                        <h4 className="text-2xl font-black text-emerald-600">{addresses.length}</h4>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <MapPin size={22} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ---------------- 2. ADDRESSES ---------------- */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-black/5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Destinasi Pengiriman</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">Daftar Alamat Saya</h3>
                      <p className="text-neutral-500 text-xs mt-1">Kelola alamat rumah, kantor, atau lokasi pengiriman belanja Anda.</p>
                    </div>
                    <button
                      onClick={() => handleOpenAddressModal(null)}
                      className="px-6 py-3.5 bg-neutral-900 hover:bg-pink-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95 transition-all shrink-0"
                    >
                      <Plus size={16} /> Tambah Alamat
                    </button>
                  </div>

                  {isLoadingAddresses ? (
                    <div className="py-20 flex justify-center">
                      <Loader2 className="animate-spin text-pink-500" size={36} />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 text-center border border-neutral-100 shadow-sm">
                      <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                        <MapPin size={28} />
                      </div>
                      <h4 className="text-xl font-black text-neutral-900 mb-1">Belum Ada Alamat Tersimpan</h4>
                      <p className="text-neutral-500 text-xs max-w-sm mx-auto mb-6">Tambahkan alamat pengiriman pertama Anda untuk mempermudah proses checkout pesanan.</p>
                      <button
                        onClick={() => handleOpenAddressModal(null)}
                        className="px-8 py-3.5 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-pink-200 transition-all"
                      >
                        Tambah Alamat Sekarang
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`bg-white rounded-4xl6 border-2 transition-all relative flex flex-col justify-between ${addr.isDefault
                            ? 'border-neutral-900 shadow-xl shadow-black/5'
                            : 'border-neutral-100 hover:border-neutral-200 shadow-sm'
                            }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-neutral-100 text-neutral-800 text-[10px] font-black uppercase tracking-wider rounded-xl">
                                  {addr.label || 'Alamat'}
                                </span>
                                {addr.isDefault && (
                                  <span className="px-2.5 py-1 bg-pink-50 text-pink-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-pink-200 flex items-center gap-1">
                                    <Check size={10} /> Utama
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenAddressModal(addr)}
                                  className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
                                  title="Edit Alamat"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                  title="Hapus Alamat"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            <h4 className="font-black text-neutral-900 text-base leading-snug">{addr.recipientName}</h4>
                            <p className="text-xs text-neutral-500 font-bold mt-0.5">{addr.phoneNumber}</p>

                            <p className="text-xs text-neutral-700 font-medium mt-3 leading-relaxed">
                              {addr.addressLine}
                            </p>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
                              {[addr.subdistrictName, addr.districtName, addr.cityName, addr.provinceName, addr.postalCode]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                            {!addr.isDefault ? (
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-[10px] font-black uppercase tracking-wider text-neutral-500 hover:text-pink-600 transition-colors"
                              >
                                Jadikan Alamat Utama
                              </button>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Alamat Pengiriman Utama
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ---------------- 3. MY WALLET ---------------- */}
              {activeTab === 'wallet' && (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Balance Hero Card */}
                  <div className="relative overflow-hidden bg-neutral-900 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl shadow-neutral-300">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-br from-pink-500/30 to-purple-600/30 blur-[90px] -mr-20 -mt-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div>
                        <span className="inline-flex items-center gap-2 text-pink-400 text-xs font-black uppercase tracking-[0.2em] mb-3">
                          <Wallet size={16} /> Dompet & Loyalty Zelvira
                        </span>
                        <p className="text-neutral-400 text-xs uppercase tracking-wider font-bold">Total Saldo Tersedia</p>
                        <h2 className="text-4xl sm:text-6xl font-black tracking-tight mt-1 text-white">
                          Rp {(wallet?.balance ?? user?.balance ?? 0).toLocaleString('id-ID')}
                        </h2>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                          <div>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Poin Hadiah</p>
                            <p className="text-lg font-black text-amber-400 flex items-center gap-1.5">
                              <Coins size={16} /> {(wallet?.points ?? user?.points ?? 0).toLocaleString('id-ID')} PTS
                            </p>
                          </div>
                          <p className="text-xs text-neutral-400 max-w-xs pl-4 border-l border-white/10">
                            1 Poin = Rp 1. Dapat ditukarkan langsung saat pembayaran checkout.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                        <button
                          onClick={() => setTopupModalOpen(true)}
                          className="px-8 py-4 bg-white text-neutral-900 hover:bg-pink-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Plus size={16} /> Top Up Saldo
                        </button>
                        <button
                          onClick={loadWallet}
                          className="px-8 py-4 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 border border-neutral-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={14} /> Refresh Saldo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History Ledger */}
                  <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-100 shadow-xl shadow-black/5">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Aktivitas Keuangan</span>
                        <h4 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">Mutasi Transaksi</h4>
                      </div>
                      <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                        {wallet?.recentTransactions?.length || 0} Aktivitas
                      </span>
                    </div>

                    {isLoadingWallet ? (
                      <div className="py-16 flex justify-center">
                        <Loader2 className="animate-spin text-pink-500" size={32} />
                      </div>
                    ) : !wallet?.recentTransactions || wallet.recentTransactions.length === 0 ? (
                      <div className="py-12 text-center text-neutral-400">
                        <Wallet size={36} className="mx-auto mb-3 opacity-40" />
                        <p className="font-bold text-sm">Belum ada riwayat transaksi dompet</p>
                        <p className="text-xs mt-1">Lakukan top up atau gunakan saldo saat belanja pesanan.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {wallet.recentTransactions.map((tx: WalletTransaction) => {
                          const isPositive = tx.type === 'TOPUP' || tx.type === 'POINTS_EARNED';
                          return (
                            <div
                              key={tx.id}
                              className="p-5 rounded-2xl hover:bg-neutral-50/80 border border-neutral-100 transition-all flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-700'
                                    }`}
                                >
                                  {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                                      {tx.type}
                                    </span>
                                    <span className="text-[10px] text-neutral-300">•</span>
                                    <span className="text-[10px] text-neutral-400 font-bold">
                                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                    </span>
                                  </div>
                                  <h5 className="text-sm font-black text-neutral-900 mt-0.5">{tx.description || 'Transaksi Dompet'}</h5>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <p className={`text-base font-black ${isPositive ? 'text-emerald-600' : 'text-neutral-900'}`}>
                                  {isPositive ? '+' : '-'} Rp {(tx.amount || 0).toLocaleString('id-ID')}
                                </p>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                  {tx.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ---------------- 4. VOUCHERS ---------------- */}
              {activeTab === 'vouchers' && (
                <motion.div
                  key="vouchers"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Claim Voucher Box */}
                  <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-100 shadow-xl shadow-black/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Klaim Kupon Belanja</span>
                    <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5 mb-2">Punya Kode Promo Khusus?</h3>
                    <p className="text-neutral-500 text-xs mb-6 max-w-md">Masukkan kode voucher diskon atau gratis ongkir untuk menambahkan ke koleksi voucher Anda.</p>

                    <form onSubmit={handleClaimVoucher} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                      <div className="relative flex-1">
                        <Ticket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={claimVoucherCode}
                          onChange={(e) => setClaimVoucherCode(e.target.value)}
                          placeholder="CONTOH: WELCOME20"
                          className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 font-black text-sm uppercase tracking-wider text-neutral-900"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isClaimingVoucher}
                        className="px-8 py-4 bg-neutral-900 hover:bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isClaimingVoucher ? <Loader2 className="animate-spin" size={16} /> : 'Klaim Voucher'}
                      </button>
                    </form>
                  </div>

                  {/* Voucher List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-lg font-black text-neutral-900">Voucher Aktif Anda</h4>
                      <button onClick={loadVouchers} className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1">
                        <RefreshCw size={12} /> Segarkan
                      </button>
                    </div>

                    {isLoadingVouchers ? (
                      <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-pink-500" size={36} />
                      </div>
                    ) : vouchers.length === 0 ? (
                      <div className="bg-white rounded-[2.5rem] p-12 text-center border border-neutral-100 shadow-sm">
                        <Ticket size={36} className="mx-auto mb-3 text-neutral-300" />
                        <h5 className="font-black text-neutral-900 text-base">Belum Ada Voucher Tersedia</h5>
                        <p className="text-neutral-500 text-xs mt-1">Cek promo berkala atau klaim kode promo Anda di atas.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {vouchers.map((v) => (
                          <div
                            key={v.id || v.code}
                            className="bg-white rounded-4xl p-6 border border-neutral-200/80 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all relative overflow-hidden flex flex-col justify-between group"
                          >
                            {/* Decorative Perforated Notch */}
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-50 border-r border-neutral-200" />
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-50 border-l border-neutral-200" />

                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <span className="px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-pink-100">
                                  {v.targetMembership || 'Semua Member'}
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400">
                                  {v.validUntil ? `Exp: ${v.validUntil}` : 'Berlaku'}
                                </span>
                              </div>

                              <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                                {v.discountAmount ? `Diskon Rp ${Number(v.discountAmount).toLocaleString('id-ID')}` : 'Voucher Diskon'}
                              </h3>
                              <p className="text-xs text-neutral-500 font-medium mt-1">
                                {v.minPurchase ? `Min. Belanja Rp ${Number(v.minPurchase).toLocaleString('id-ID')}` : 'Tanpa minimum pembelian'}
                              </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-dashed border-neutral-200 flex items-center justify-between gap-3">
                              <div className="bg-neutral-100 px-3.5 py-2 rounded-xl border border-neutral-200 font-mono font-black text-xs text-neutral-800 tracking-wider">
                                {v.code}
                              </div>
                              <button
                                onClick={() => handleCopyVoucher(v.code)}
                                className="px-4 py-2 bg-neutral-900 hover:bg-pink-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 active:scale-95"
                              >
                                {copiedCode === v.code ? (
                                  <>
                                    <Check size={12} className="text-emerald-400" /> Disalin!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} /> Salin Kode
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ---------------- 5. RECENTLY VIEWED ---------------- */}
              {activeTab === 'recently-viewed' && (
                <motion.div
                  key="recently-viewed"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-black/5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Riwayat Eksplorasi</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">Produk Terakhir Dilihat</h3>
                      <p className="text-neutral-500 text-xs mt-1">Koleksi produk yang baru saja Anda jelajahi di Zelvira.</p>
                    </div>
                    {recentProducts.length > 0 && (
                      <button
                        onClick={() => {
                          localStorage.removeItem('zelixa_recent_views');
                          setRecentProducts([]);
                          toast.success('Riwayat produk dilihat berhasil dibersihkan');
                        }}
                        className="px-5 py-3 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-neutral-200"
                      >
                        <Trash2 size={14} /> Bersihkan Riwayat
                      </button>
                    )}
                  </div>

                  {recentProducts.length === 0 ? (
                    <div className="space-y-8">
                      <div className="bg-white rounded-[2.5rem] p-10 text-center border border-neutral-100 shadow-sm">
                        <History size={36} className="mx-auto mb-3 text-neutral-300" />
                        <h4 className="font-black text-neutral-900 text-base">Belum Ada Riwayat Penelusuran</h4>
                        <p className="text-neutral-500 text-xs mt-1 mb-6">Mulai jelajahi koleksi fashion & lifestyle terbaru kami.</p>
                        <Link
                          href="/products"
                          className="px-8 py-3.5 bg-neutral-900 hover:bg-pink-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all"
                        >
                          Jelajahi Produk Sekarang
                        </Link>
                      </div>

                      {/* Fallback Recommendation Products */}
                      {recommendedProducts.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-black text-neutral-900 pl-2">Rekomendasi Spesial Untuk Anda</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {recommendedProducts.map((p) => (
                              <Link
                                key={p.id}
                                href={`/products/${p.slug || p.id}`}
                                className="bg-white rounded-3xl p-3 border border-neutral-100 hover:border-pink-200 hover:shadow-xl transition-all group flex flex-col justify-between"
                              >
                                <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-3 relative">
                                  <img
                                    src={formatImageUrl(p.imageUrl || '/placeholder.png')}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                                <div>
                                  <h5 className="font-black text-neutral-900 text-xs truncate group-hover:text-pink-600 transition-colors">
                                    {p.name}
                                  </h5>
                                  <p className="text-sm font-black text-neutral-900 mt-1">
                                    Rp {(p.price || 0).toLocaleString('id-ID')}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                      {recentProducts.map((item) => (
                        <Link
                          key={item.id}
                          href={`/products/${item.slug || item.id}`}
                          className="bg-white rounded-3xl p-3.5 border border-neutral-100 hover:border-pink-200 hover:shadow-xl transition-all group flex flex-col justify-between"
                        >
                          <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-3 relative">
                            <img
                              src={formatImageUrl(item.imageUrl || '/placeholder.png')}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {item.categoryName && (
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-neutral-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-lg">
                                {item.categoryName}
                              </span>
                            )}
                          </div>
                          <div>
                            <h5 className="font-black text-neutral-900 text-xs truncate group-hover:text-pink-600 transition-colors">
                              {item.name}
                            </h5>
                            <p className="text-sm font-black text-neutral-900 mt-1">
                              Rp {(item.price || 0).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ---------------- 6. ORDERS ---------------- */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-black/5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Status Belanja</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">Riwayat Pesanan</h3>
                      <p className="text-neutral-500 text-xs mt-1">Pantau proses pengiriman, konfirmasi pembayaran, dan status paket.</p>
                    </div>

                    <div className="relative w-full md:w-64">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Cari ID / Nama Produk..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'PENDING', label: 'Belum Bayar' },
                      { id: 'PROCESSING', label: 'Diproses' },
                      { id: 'DELIVERING', label: 'Dikirim' },
                      { id: 'COMPLETED', label: 'Selesai' },
                      { id: 'CANCELLED', label: 'Dibatalkan' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setOrderFilter(tab.id as any)}
                        className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${orderFilter === tab.id
                          ? 'bg-neutral-900 text-white shadow-lg'
                          : 'bg-white text-neutral-500 hover:text-neutral-900 border border-neutral-200'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {isLoadingOrders ? (
                    <div className="py-20 flex justify-center">
                      <Loader2 className="animate-spin text-pink-500" size={36} />
                    </div>
                  ) : (
                    (() => {
                      const filtered = orders.filter((o) => {
                        const matchStatus = orderFilter === 'all' || o.status === orderFilter;
                        const matchSearch =
                          !orderSearchQuery ||
                          String(o.orderNumber || o.id).toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                          o.items?.some((it) => (it.productName || it.name || '').toLowerCase().includes(orderSearchQuery.toLowerCase()));
                        return matchStatus && matchSearch;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-neutral-100 shadow-sm">
                            <Package size={36} className="mx-auto mb-3 text-neutral-300" />
                            <h5 className="font-black text-neutral-900 text-base">Tidak Ada Pesanan Ditemukan</h5>
                            <p className="text-neutral-500 text-xs mt-1 mb-6">Belum ada transaksi pada kategori ini.</p>
                            <Link
                              href="/products"
                              className="px-8 py-3 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
                            >
                              Mulai Belanja
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {filtered.map((order) => {
                            const firstItem = order.items?.[0];
                            const isPending = order.status === 'PENDING';
                            const isDelivering = order.status === 'DELIVERING';
                            const isCompleted = order.status === 'COMPLETED';

                            return (
                              <div
                                key={order.id}
                                className="bg-white rounded-4xl p-6 border border-neutral-100 shadow-sm hover:shadow-xl transition-all"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 text-xs">
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono font-black text-neutral-900 text-sm">
                                      {order.orderNumber || `SHZ-${order.id}`}
                                    </span>
                                    <span className="text-neutral-400 font-medium">
                                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider self-start sm:self-auto ${isCompleted
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                      : isDelivering
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : isPending
                                          ? 'bg-pink-50 text-pink-600 border border-pink-200'
                                          : 'bg-neutral-100 text-neutral-600'
                                      }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>

                                <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-100">
                                      <img
                                        src={formatImageUrl(firstItem?.imageUrl || firstItem?.img || '/placeholder.png')}
                                        alt={firstItem?.productName || 'Produk'}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <h5 className="font-black text-neutral-900 text-sm leading-snug">
                                        {firstItem?.productName || firstItem?.name || 'Pesanan Zelvira'}
                                      </h5>
                                      <p className="text-xs text-neutral-500 font-medium mt-0.5">
                                        {order.items?.length || 1} Produk • {firstItem?.quantity || firstItem?.qty || 1} pcs
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                                    <div className="text-left md:text-right">
                                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Total Pembayaran</p>
                                      <p className="text-lg font-black text-neutral-900">
                                        Rp {(order.totalAmount || order.total || 0).toLocaleString('id-ID')}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {isPending && (
                                        <button
                                          onClick={() => handlePayOrder(order)}
                                          className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-pink-200 active:scale-95 transition-all"
                                        >
                                          Bayar Sekarang
                                        </button>
                                      )}
                                      <Link
                                        href="/orders"
                                        className="px-4 py-3 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1"
                                      >
                                        Detail <ChevronRight size={14} />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </motion.div>
              )}

              {/* ---------------- 7. PREFERENCES ---------------- */}
              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-100 shadow-xl shadow-black/5">
                    <div className="mb-8 pb-4 border-b border-neutral-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Pengaturan Aplikasi</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">Preferensi Akun & Belanja</h3>
                      <p className="text-neutral-500 text-xs mt-1">Sesuaikan cara Zelvira berinteraksi dengan Anda, bahasa, dan notifikasi.</p>
                    </div>

                    <div className="space-y-6">
                      {/* Section: Notifications */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-4 pl-1">Notifikasi & Informasi Pesanan</h4>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80 cursor-pointer hover:bg-neutral-100/60 transition-colors">
                            <div className="pr-4">
                              <p className="text-sm font-black text-neutral-900 flex items-center gap-2">
                                <Phone size={15} className="text-emerald-600" /> Notifikasi WhatsApp Pesanan
                              </p>
                              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                                Terima update resi, konfirmasi pembayaran, dan status paket langsung ke nomor WhatsApp Anda.
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={prefWhatsApp}
                              onChange={(e) => setPrefWhatsApp(e.target.checked)}
                              className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80 cursor-pointer hover:bg-neutral-100/60 transition-colors">
                            <div className="pr-4">
                              <p className="text-sm font-black text-neutral-900 flex items-center gap-2">
                                <Bell size={15} className="text-pink-500" /> Promo & Flash Sale Eksklusif
                              </p>
                              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                                Dapatkan pemberitahuan lebih awal saat diskon member, voucher akhir bulan, dan flash sale dimulai.
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={prefPromos}
                              onChange={(e) => setPrefPromos(e.target.checked)}
                              className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80 cursor-pointer hover:bg-neutral-100/60 transition-colors">
                            <div className="pr-4">
                              <p className="text-sm font-black text-neutral-900 flex items-center gap-2">
                                <Mail size={15} className="text-indigo-500" /> Newsletter Gaya & Inspirasi Fashion
                              </p>
                              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                                Dapatkan kurasi tren mingguan dan tips padu padan outfit aesthetic dari tim editorial Zelvira.
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={prefNewsletter}
                              onChange={(e) => setPrefNewsletter(e.target.checked)}
                              className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Section: Language & Currency */}
                      <div className="pt-4 border-t border-neutral-100">
                        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-4 pl-1">Wilayah & Bahasa</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-500 tracking-wider pl-1 flex items-center gap-1.5">
                              <Globe size={13} /> Bahasa Antarmuka
                            </label>
                            <select
                              value={prefLanguage}
                              onChange={(e) => setPrefLanguage(e.target.value as any)}
                              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-pink-400"
                            >
                              <option value="id">Bahasa Indonesia (ID)</option>
                              <option value="en">English (US)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-500 tracking-wider pl-1 flex items-center gap-1.5">
                              <DollarSign size={13} /> Mata Uang
                            </label>
                            <select
                              value={prefCurrency}
                              onChange={(e) => setPrefCurrency(e.target.value)}
                              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-pink-400"
                            >
                              <option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSavePreferences}
                          className="px-8 py-4 bg-neutral-900 hover:bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-neutral-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Save size={16} /> Simpan Preferensi
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ---------------- 8. SECURITY ---------------- */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Change Password Card */}
                  <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-100 shadow-xl shadow-black/5">
                    <div className="mb-8 pb-4 border-b border-neutral-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Privasi & Akses</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">Ubah Password Akun</h3>
                      <p className="text-neutral-500 text-xs mt-1">Gunakan kombinasi kata sandi yang kuat untuk menjaga keamanan akun Zelvira Anda.</p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">
                          Password Saat Ini
                        </label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type={showCurrentPass ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Masukkan password saat ini"
                            className="w-full pl-12 pr-12 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 text-sm font-bold text-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                          >
                            {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">
                          Password Baru
                        </label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            required
                            className="w-full pl-12 pr-12 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 text-sm font-bold text-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                          >
                            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">
                          Konfirmasi Password Baru
                        </label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 text-sm font-bold text-neutral-900"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isChangingPass}
                          className="px-8 py-4 bg-neutral-900 hover:bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
                        >
                          {isChangingPass ? <Loader2 className="animate-spin" size={16} /> : 'Perbarui Password'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* 2FA Status Card */}
                  <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Shield size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-neutral-900">Verifikasi WhatsApp OTP</h4>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">
                          Nomor {user?.phoneNumber || 'terdaftar'} dapat digunakan untuk login aman dengan kode OTP sekali pakai.
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-xl border border-emerald-200 self-start sm:self-auto">
                      Aktif & Terlindungi
                    </span>
                  </div>

                  {/* Danger Zone: Delete Account */}
                  <div className="bg-rose-50/60 rounded-[2.5rem] p-6 sm:p-10 border border-rose-200/80">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertTriangle size={22} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-black text-rose-950">Zona Bahaya: Deaktivasi & Hapus Akun</h4>
                        <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed max-w-xl">
                          Menghapus akun akan menyamarkan seluruh identitas pribadi Anda, menonaktifkan login, serta menghapus riwayat poin dan voucher secara permanen.
                        </p>
                        <button
                          type="button"
                          onClick={() => setDeleteModalOpen(true)}
                          className="mt-5 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                        >
                          Hapus Akun Saya
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>

        </div>
      </div>

      {/* ===================== MODAL: TAMBAH / EDIT ALAMAT ===================== */}
      <AnimatePresence>
        {addressModalOpen && (
          <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddressModalOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 sm:p-8 border-b border-neutral-100 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Alamat Pengiriman</span>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
                    {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                  </h3>
                </div>
                <button
                  onClick={() => setAddressModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="p-6 sm:p-8 overflow-y-auto space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider pl-1">Label Alamat</label>
                    <select
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="Rumah">Rumah</option>
                      <option value="Kantor">Kantor</option>
                      <option value="Apartemen">Apartemen</option>
                      <option value="Kost">Kost</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider pl-1">Nama Penerima</label>
                    <input
                      type="text"
                      value={addrRecipient}
                      onChange={(e) => setAddrRecipient(e.target.value)}
                      placeholder="Nama lengkap penerima"
                      required
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider pl-1">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      placeholder="08123456789"
                      required
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider pl-1">Provinsi</label>
                    <select
                      value={selectedProv}
                      onChange={(e) => setSelectedProv(e.target.value)}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map((p) => (
                        <option key={p.id || p.province_id} value={p.id || p.province_id}>
                          {p.name || p.province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider pl-1">Kota / Kabupaten</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={!selectedProv}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-60"
                    >
                      <option value="">Pilih Kota</option>
                      {cities.map((c) => (
                        <option key={c.id || c.city_id} value={c.id || c.city_id}>
                          {c.type} {c.name || c.city_name || c.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider pl-1">Kecamatan</label>
                    <select
                      value={selectedDist}
                      onChange={(e) => setSelectedDist(e.target.value)}
                      disabled={!selectedCity}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-60"
                    >
                      <option value="">Pilih Kecamatan</option>
                      {districts.map((d) => (
                        <option key={d.id || d.district_id} value={d.id || d.district_id}>
                          {d.name || d.district_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider pl-1">Kelurahan / Desa</label>
                    <select
                      value={selectedSub}
                      onChange={(e) => setSelectedSub(e.target.value)}
                      disabled={!selectedDist}
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-60"
                    >
                      <option value="">Pilih Kelurahan</option>
                      {subdistricts.map((s) => (
                        <option key={s.id || s.subdistrict_id} value={s.id || s.subdistrict_id}>
                          {s.name || s.subdistrict_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider pl-1">Kode Pos</label>
                    <input
                      type="text"
                      value={addrPostal}
                      onChange={(e) => setAddrPostal(e.target.value)}
                      placeholder="Contoh: 12345"
                      className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="addrDefaultCheckbox"
                      checked={addrIsDefault}
                      onChange={(e) => setAddrIsDefault(e.target.checked)}
                      className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                    />
                    <label htmlFor="addrDefaultCheckbox" className="text-xs font-black text-neutral-700 cursor-pointer">
                      Jadikan Alamat Pengiriman Utama
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider pl-1">
                    Detail Alamat Lengkap & Patokan
                  </label>
                  <textarea
                    rows={3}
                    value={addrLine}
                    onChange={(e) => setAddrLine(e.target.value)}
                    placeholder="Nama jalan, nomor rumah, RT/RW, blok, atau patokan lokasi..."
                    required
                    className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(false)}
                    className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="px-8 py-3.5 bg-neutral-900 hover:bg-pink-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSavingAddress ? <Loader2 className="animate-spin" size={16} /> : 'Simpan Alamat'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== MODAL: TOP UP WALLET ===================== */}
      <AnimatePresence>
        {topupModalOpen && (
          <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTopupModalOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl z-10 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Dompet Digital</span>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight mt-0.5">Top Up Saldo</h3>
                </div>
                <button
                  onClick={() => setTopupModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-2 block pl-1">
                    Nominal Top Up (Rp)
                  </label>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Contoh: 100000"
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-black text-xl text-neutral-900 outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-2.5 pl-1">Pilihan Cepat</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[20000, 50000, 100000, 250000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopupAmount(String(amt))}
                        className={`py-3 rounded-xl text-xs font-black transition-all border ${topupAmount === String(amt)
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                          : 'bg-neutral-50 hover:bg-pink-50 hover:text-pink-600 border-neutral-200 text-neutral-700'
                          }`}
                      >
                        {amt >= 1000000 ? `${amt / 1000000} Jt` : `${amt / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-pink-50/70 border border-pink-100 rounded-2xl text-[11px] text-pink-700 leading-relaxed">
                  <p className="font-bold">Didukung Midtrans Payment Gateway</p>
                  <p className="opacity-80 mt-0.5">Mendukung QRIS, GoPay, OVO, ShopeePay, Virtual Account BCA, Mandiri, BNI, dan BRI.</p>
                </div>

                <button
                  type="button"
                  onClick={handleInitiateTopup}
                  disabled={isProcessingTopup}
                  className="w-full py-4 bg-neutral-900 hover:bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isProcessingTopup ? <Loader2 className="animate-spin" size={16} /> : 'Lanjut ke Pembayaran'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== MODAL: HAPUS AKUN ===================== */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl z-10 p-6 sm:p-8"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-neutral-900 text-center">Konfirmasi Hapus Akun</h3>
              <p className="text-xs text-neutral-500 text-center mt-2 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Semua saldo dompet yang tersisa, poin reward, dan riwayat voucher akan dinonaktifkan secara permanen.
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isDeletingAccount ? <Loader2 className="animate-spin" size={16} /> : 'Ya, Hapus Akun'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
