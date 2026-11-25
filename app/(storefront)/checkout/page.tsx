'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Script from 'next/script';
import {
  ChevronLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Truck,
  Coins,
  AlertCircle,
  Plus,
  Phone,
  Loader2,
  Check,
  Ticket,
  X,
  Tag,
  ExternalLink
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { AuthUser } from '@/types/auth';
import { OrderService } from '@/services/order.service';
import { useCart } from '@/contexts/CartContext';
import { CheckoutStep, Courier } from '@/types/checkout';
import { Address } from '@/types/address';
import { AddressService } from '@/services/address.service';
import { toast } from 'sonner';
import { ShippingService } from '@/services/shipping.service';
import { formatImageUrl } from '@/lib/url-utils';
import { walletService } from '@/services/wallet.service';
import { VoucherService } from '@/services/voucher.service';
import { Voucher } from '@/types/voucher';

declare global {
  interface Window {
    snap: any;
  }
}

const steps: CheckoutStep[] = [
  { id: 'shipping', label: 'Pengiriman', icon: MapPin },
  { id: 'review', label: 'Review & Bayar', icon: ShieldCheck },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Address state from API
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | string>('');

  // Courier state
  const [selectedCourier, setSelectedCourier] = useState('');
  const [isFetchingCouriers, setIsFetchingCouriers] = useState(false);
  const [couriers, setCouriers] = useState<Courier[]>([]);

  // Payment & Wallet
  const [paymentMethod, setPaymentMethod] = useState<'MIDTRANS' | 'WALLET'>('MIDTRANS');
  const [wallet, setWallet] = useState<any>(null);
  const [usePoints, setUsePoints] = useState(false);

  // Voucher state
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Cart
  const { cartItems, totalAmount: cartTotalAmount } = useCart();
  const subtotal = cartTotalAmount;

  // 1. Fetch user addresses from backend API
  const loadUserAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const list = await AddressService.getAll();
      const addrs = list || [];
      setSavedAddresses(addrs);
      if (addrs.length > 0) {
        const def = addrs.find(a => a.isDefault) || addrs[0];
        setSelectedAddressId(def.id);
      }
    } catch (e) {
      console.error('Failed to load user addresses', e);
      setSavedAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // 2. Load available vouchers
  const loadAvailableVouchers = async () => {
    try {
      const list = await VoucherService.getAvailable();
      if (Array.isArray(list)) {
        setAvailableVouchers(list.filter(v => v.isActive));
      }
    } catch (e) {
      console.error('Failed to load available vouchers', e);
    }
  };

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.push('/login?redirect=/checkout');
      return;
    }
    const currentUser = authService.getUser();
    setUser(currentUser);

    loadUserAddresses();
    loadAvailableVouchers();
    walletService.getWalletInfo().then(setWallet).catch(() => {});
  }, [router]);

  const selectedAddress = savedAddresses.find(a => String(a.id) === String(selectedAddressId));
  const activeSubdistrictId = selectedAddress?.subdistrictId || selectedAddress?.districtId;

  // 3. Fetch Rajaongkir couriers when subdistrict is selected
  useEffect(() => {
    if (!activeSubdistrictId) {
      setCouriers([]);
      setSelectedCourier('');
      return;
    }

    const fetchCouriers = async () => {
      setIsFetchingCouriers(true);
      try {
        const res = await ShippingService.calculateCost({
          origin: '1391', // Default origin (Kebon Jeruk / Jakarta Barat)
          destination: String(activeSubdistrictId),
          weight: 1000,
          courier: 'jne:sicepat:jnt:tiki:anteraja:pos'
        });

        if (Array.isArray(res)) {
          const newCouriers: Courier[] = res.map(cr => ({
            id: `${cr.code}-${cr.service}`.toLowerCase(),
            name: `${cr.name} (${cr.service})`,
            price: cr.cost,
            speed: cr.etd || '2-4 Hari',
            icon: Truck
          }));
          setCouriers(newCouriers);
          if (newCouriers.length > 0) setSelectedCourier(newCouriers[0].id);
        }
      } catch (e) {
        console.error('Courier fetch error', e);
      } finally {
        setIsFetchingCouriers(false);
      }
    };

    fetchCouriers();
  }, [activeSubdistrictId]);

  const currentCourier = couriers.find(c => c.id === selectedCourier);
  const shippingCost = currentCourier?.price || 0;

  // 4. Voucher Discount calculation helper
  const calculateVoucherDiscount = (voucher: Voucher, baseSubtotal: number): number => {
    if (!voucher) return 0;
    if (voucher.minPurchase && baseSubtotal < voucher.minPurchase) {
      return 0;
    }
    const discountType = (voucher.discountType || 'FIXED').toUpperCase();
    if (discountType === 'PERCENTAGE') {
      let calc = baseSubtotal * (Number(voucher.discountAmount) / 100);
      if (voucher.maxDiscount && calc > Number(voucher.maxDiscount)) {
        calc = Number(voucher.maxDiscount);
      }
      return Math.round(calc);
    }
    return Number(voucher.discountAmount || 0);
  };

  const voucherDiscount = appliedVoucher ? calculateVoucherDiscount(appliedVoucher, subtotal) : 0;

  // 5. Points calculation: 1 Point = Rp 1 direct nominal discount (Matching backend & mobile: 1 poin = Rp 1)
  const userPoints = Number(wallet?.points || 0);
  const amountBeforePoints = Math.max(0, subtotal + shippingCost - voucherDiscount);
  const maxPointsUsable = Math.floor(amountBeforePoints);
  const pointsToUse = usePoints ? Math.min(userPoints, maxPointsUsable) : 0;
  const pointsDiscount = pointsToUse; // 1 Point = Rp 1 direct discount

  const total = Math.max(0, amountBeforePoints - pointsDiscount);

  // Apply Voucher by Code input
  const handleApplyVoucherCode = async () => {
    const code = voucherCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error('Masukkan kode voucher');
      return;
    }

    setIsApplyingVoucher(true);
    try {
      // Look in available vouchers first
      let matched = availableVouchers.find(v => v.code.toUpperCase() === code);
      if (!matched) {
        // Fallback to fetch voucher details from API
        matched = await VoucherService.getByCode(code);
      }

      if (!matched || !matched.isActive) {
        toast.error('Voucher tidak ditemukan atau sudah tidak aktif');
        return;
      }

      if (matched.minPurchase && subtotal < matched.minPurchase) {
        toast.error(`Voucher memerlukan minimal belanja Rp ${matched.minPurchase.toLocaleString('id-ID')}`);
        return;
      }

      setAppliedVoucher(matched);
      setVoucherCodeInput('');
      setShowVoucherModal(false);
      toast.success(`Voucher ${matched.code} berhasil dipasang!`);
    } catch (e: any) {
      toast.error(e?.message || 'Kode voucher tidak valid');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleSelectVoucher = (voucher: Voucher) => {
    if (voucher.minPurchase && subtotal < voucher.minPurchase) {
      toast.error(`Voucher memerlukan minimal belanja Rp ${voucher.minPurchase.toLocaleString('id-ID')}`);
      return;
    }

    if (appliedVoucher?.id === voucher.id) {
      // Deselect
      setAppliedVoucher(null);
      toast.info('Voucher dilepas');
    } else {
      setAppliedVoucher(voucher);
      toast.success(`Voucher ${voucher.code} berhasil dipasang!`);
    }
    setShowVoucherModal(false);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    toast.info('Voucher telah dihapus');
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (savedAddresses.length === 0) {
        toast.error('Anda belum memiliki alamat pengiriman! Silakan buat alamat terlebih dahulu.');
        router.push('/addresses/add?redirect=/checkout');
        return;
      }
      if (!selectedAddress) {
        toast.error('Silakan pilih salah satu alamat pengiriman.');
        return;
      }
      if (!selectedCourier) {
        toast.error('Silakan pilih kurir pengiriman.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // 6. Place order with verified address, courier, voucher & points
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Keranjang belanja Anda kosong');
      return;
    }

    if (!selectedAddress) {
      toast.error('Alamat pengiriman belum dipilih. Silakan periksa kembali alamat Anda.');
      setCurrentStep(0);
      return;
    }

    if (!currentCourier) {
      toast.error('Kurir pengiriman belum dipilih.');
      setCurrentStep(0);
      return;
    }

    if (paymentMethod === 'WALLET' && Number(wallet?.balance || 0) < total) {
      toast.error(`Saldo Zelvira Wallet tidak mencukupi (Saldo: Rp ${Number(wallet?.balance || 0).toLocaleString('id-ID')})`);
      return;
    }

    setIsProcessing(true);
    try {
      const formattedFullAddress = `${selectedAddress.addressLine}, ${selectedAddress.subdistrictName || ''}, ${selectedAddress.districtName || ''}, ${selectedAddress.cityName || ''}, ${selectedAddress.provinceName || ''} ${selectedAddress.postalCode || ''}`.replace(/^[ ,]+|[ ,]+$/g, '');

      const response = await OrderService.checkout({
        shippingService: currentCourier.name,
        destinationSubdistrictId: String(selectedAddress.subdistrictId),
        shippingAddress: formattedFullAddress,
        shippingRecipient: selectedAddress.recipientName,
        shippingPhone: selectedAddress.phoneNumber,
        addressLine: selectedAddress.addressLine,
        shippingAmount: shippingCost,
        paymentMethod: paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        pointsUsed: pointsToUse > 0 ? pointsToUse : 0,
        walletAmountUsed: paymentMethod === 'WALLET' ? total : 0,
      });

      if (paymentMethod === 'WALLET') {
        setIsProcessing(false);
        setIsSuccess(true);
        return;
      }

      let paymentToken = response.paymentToken;
      if (!paymentToken && response.id && total > 0) {
        try {
          const tokenRes = await OrderService.getPaymentToken(response.id);
          if (tokenRes && tokenRes.paymentToken) {
            paymentToken = tokenRes.paymentToken;
          }
        } catch (tokErr) {
          console.warn('Failed to retrieve payment token directly', tokErr);
        }
      }

      if (paymentToken && window.snap) {
        window.snap.pay(paymentToken, {
          onSuccess: async function () {
            try {
              if (response.id) {
                await OrderService.syncPayment(response.id);
              } else if (response.orderNumber) {
                await OrderService.syncPaymentByNumber(response.orderNumber);
              }
            } catch (e) {
              console.error('Failed to sync payment after Snap success', e);
            }
            setIsProcessing(false);
            setIsSuccess(true);
          },
          onPending: async function () {
            try {
              if (response.id) {
                await OrderService.syncPayment(response.id);
              } else if (response.orderNumber) {
                await OrderService.syncPaymentByNumber(response.orderNumber);
              }
            } catch (e) {}
            setIsProcessing(false);
            router.push('/orders');
          },
          onError: function () {
            setIsProcessing(false);
            toast.error('Pembayaran gagal atau dibatalkan. Silakan coba kembali.');
          },
          onClose: function () {
            setIsProcessing(false);
            toast.info('Popup pembayaran ditutup. Anda dapat membayar nanti di Riwayat Pesanan.');
            router.push('/orders');
          }
        });
      } else {
        setIsProcessing(false);
        setIsSuccess(true);
      }
    } catch (error: any) {
      setIsProcessing(false);
      toast.error(error.message || 'Checkout gagal');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200"
        >
          <CheckCircle2 size={48} className="text-white" />
        </motion.div>
        <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight">Pesanan Berhasil Dibuat! 🎉</h1>
        <p className="text-neutral-500 mb-10 max-w-sm">Terima kasih atas pesanan Anda. Silakan selesaikan pembayaran atau pantau status pengiriman paket Anda.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/orders">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl">
              Lihat Riwayat & Lacak Pesanan
            </motion.button>
          </Link>
          <Link href="/">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-neutral-900 border border-neutral-200 px-8 py-4 rounded-2xl font-black shadow-lg">
              Kembali ke Beranda
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js'}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/cart"
                className="group inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5 text-sm font-bold text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 active:scale-95"
              >
                <ChevronLeft
                  size={17}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
                Kembali ke Keranjang
              </Link>

              {/* Step indicator */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className={`px-3 py-1 rounded-full ${currentStep === 0 ? 'bg-pink-500 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                  1. Pengiriman
                </span>
                <span className="text-neutral-300">→</span>
                <span className={`px-3 py-1 rounded-full ${currentStep === 1 ? 'bg-pink-500 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                  2. Review & Bayar
                </span>
              </div>
            </div>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-xl shadow-black/5"
            >
              {currentStep === 0 && (
                <div className="space-y-8">
                  {/* Step Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                    <div>
                      <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                        <MapPin className="text-pink-500" size={20} /> Alamat Pengiriman
                      </h2>
                      <p className="text-xs text-neutral-400 font-medium mt-0.5">
                        Pilih alamat tujuan untuk menghitung ongkir resmi ekspedisi kurir.
                      </p>
                    </div>

                    <Link
                      href="/addresses/add?redirect=/checkout"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold text-xs uppercase tracking-wider transition-colors border border-pink-200 self-start sm:self-auto"
                    >
                      <Plus size={15} /> Tambah Alamat Baru
                    </Link>
                  </div>

                  {/* Address List or Empty Alert */}
                  {isLoadingAddresses ? (
                    <div className="flex items-center justify-center p-8 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                        <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                        <span>Memuat alamat pengiriman akun Anda...</span>
                      </div>
                    </div>
                  ) : savedAddresses.length === 0 ? (
                    <div className="p-6 rounded-3xl bg-amber-50/80 border-2 border-amber-200 text-amber-900 space-y-4">
                      <div className="flex items-start gap-3.5">
                        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-black text-sm uppercase tracking-wide">
                            Anda Belum Memiliki Alamat Pengiriman
                          </h3>
                          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                            Untuk menghitung ongkir kurir resmi (JNE, SiCepat, J&T, POS, Anteraja) dan mengirimkan pesanan Anda, silakan tambahkan alamat pengiriman terlebih dahulu.
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/addresses/add?redirect=/checkout"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-pink-200 transition-all"
                      >
                        <Plus size={15} /> Buat Alamat Pengiriman Sekarang
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        {savedAddresses.map((addr) => {
                          const isSelected = String(selectedAddressId) === String(addr.id);
                          return (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all relative ${
                                isSelected ? 'border-pink-500 bg-pink-50/20 shadow-sm' : 'border-neutral-100 hover:border-neutral-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded-md text-neutral-700">
                                    {addr.label || 'Rumah'}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-pink-100 text-pink-600 rounded-md">
                                      Utama
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/addresses/add?id=${addr.id}&redirect=/checkout`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[11px] font-bold text-pink-600 hover:text-pink-700 hover:underline mr-1"
                                  >
                                    Edit
                                  </Link>
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-pink-500 text-white' : 'border-2 border-neutral-300'}`}>
                                    {isSelected && <Check size={13} strokeWidth={3} />}
                                  </div>
                                </div>
                              </div>
                              <p className="font-black text-neutral-900 mb-0.5 text-sm">{addr.recipientName}</p>
                              <p className="text-xs text-neutral-500 font-medium mb-1.5 flex items-center gap-1.5">
                                <Phone size={12} className="text-neutral-400" /> {addr.phoneNumber}
                              </p>
                              <p className="text-xs text-neutral-700 font-semibold leading-relaxed">
                                {addr.addressLine}
                              </p>
                              <p className="text-[11px] text-neutral-500 font-medium mt-1">
                                {[addr.districtName, addr.cityName, addr.provinceName, addr.postalCode].filter(Boolean).join(', ')}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-neutral-500">
                        <Link
                          href="/addresses?redirect=/checkout"
                          className="hover:text-pink-600 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink size={13} /> Kelola Semua Alamat
                        </Link>
                        <Link
                          href="/addresses/add?redirect=/checkout"
                          className="text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-1"
                        >
                          <Plus size={14} /> Tambah Alamat Lainnya
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Courier Selection */}
                  <div className="pt-8 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-4 pl-1">
                      <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <Truck size={15} className="text-pink-500" /> Pilih Kurir Ekspedisi Pengiriman
                      </h3>
                      {activeSubdistrictId && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Tarif Resmi RajaOngkir
                        </span>
                      )}
                    </div>

                    {isFetchingCouriers ? (
                      <div className="flex items-center justify-center p-8 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                          <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
                          <span>Menghitung ongkir kurir resmi ke alamat Anda...</span>
                        </div>
                      </div>
                    ) : couriers.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                        Silakan pilih alamat tujuan pengiriman di atas untuk melihat pilihan kurir ekspedisi yang tersedia.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {couriers.map((courier) => {
                          const isSelected = selectedCourier === courier.id;
                          return (
                            <button
                              key={courier.id}
                              type="button"
                              onClick={() => setSelectedCourier(courier.id)}
                              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                                isSelected ? 'border-pink-500 bg-pink-50/30 shadow-sm' : 'border-neutral-100 hover:border-neutral-200 bg-white'
                              }`}
                            >
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-pink-500 text-white' : 'bg-neutral-100 text-neutral-500'
                              }`}>
                                <courier.icon size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-neutral-900 truncate">{courier.name}</p>
                                <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Estimasi: {courier.speed}</p>
                              </div>
                              <p className="font-black text-sm text-pink-600 shrink-0">
                                Rp {courier.price.toLocaleString('id-ID')}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  <h2 className="text-xl font-black text-neutral-900">Review Pesanan & Pembayaran</h2>

                  {/* Summary Destination & Courier */}
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-start gap-3 text-xs">
                      <MapPin size={18} className="text-pink-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Tujuan Pengiriman</span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(0)}
                            className="text-[11px] font-bold text-pink-600 hover:text-pink-700"
                          >
                            Ubah Alamat
                          </button>
                        </div>
                        <p className="font-bold text-neutral-900">
                          {selectedAddress?.recipientName} ({selectedAddress?.phoneNumber})
                        </p>
                        <p className="text-neutral-600 mt-0.5 leading-relaxed">
                          {selectedAddress?.addressLine}, {selectedAddress?.subdistrictName}, {selectedAddress?.cityName}, {selectedAddress?.provinceName} {selectedAddress?.postalCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <Truck size={22} className="text-pink-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{currentCourier?.name}</p>
                        <p className="text-[11px] text-neutral-500 font-medium">Estimasi tiba: {currentCourier?.speed}</p>
                      </div>
                      <span className="ml-auto font-black text-pink-600 text-xs">
                        Rp {shippingCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* VOUCHER & PROMO SECTION */}
                  <div className="pt-6 border-t border-neutral-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <Ticket size={16} className="text-pink-500" /> Voucher & Kupon Promo
                      </h3>
                      {availableVouchers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowVoucherModal(true)}
                          className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                        >
                          <Tag size={13} /> Lihat Voucher ({availableVouchers.length})
                        </button>
                      )}
                    </div>

                    {appliedVoucher ? (
                      <div className="p-4 rounded-2xl bg-pink-50/50 border-2 border-pink-500 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0">
                            <Ticket size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs text-neutral-900 uppercase tracking-wider">{appliedVoucher.code}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                                Terpasang
                              </span>
                            </div>
                            <p className="text-xs text-pink-600 font-bold mt-0.5">
                              Hemat Rp {voucherDiscount.toLocaleString('id-ID')}
                              {appliedVoucher.discountType === 'PERCENTAGE' && ` (${appliedVoucher.discountAmount}%)`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveVoucher}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-white transition-colors"
                          title="Hapus voucher"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={voucherCodeInput}
                            onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyVoucherCode();
                              }
                            }}
                            placeholder="Ketik kode promo (misal: DISC10)"
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal focus:border-pink-500 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyVoucherCode}
                          disabled={isApplyingVoucher || !voucherCodeInput.trim()}
                          className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          {isApplyingVoucher ? <Loader2 size={14} className="animate-spin" /> : 'Terapkan'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* POINTS LOYALTY SECTION (1 Point = Rp 1) */}
                  <div className="pt-6 border-t border-neutral-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3 pl-1 flex items-center gap-2">
                      <Coins size={16} className="text-pink-500" /> Poin Loyalitas Zelvira
                    </h3>
                    <div className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${usePoints ? 'border-pink-500 bg-pink-50/20' : 'border-neutral-100 bg-white'}`}>
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                          <Coins size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-neutral-900">Tukarkan Poin Diskon</p>
                          <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                            Saldo: <strong className="text-neutral-900">{userPoints.toLocaleString('id-ID')} Poin</strong> (1 Poin = Rp 1)
                          </p>
                          {usePoints && pointsToUse > 0 && (
                            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                              Digunakan: {pointsToUse.toLocaleString('id-ID')} Poin (-Rp {pointsDiscount.toLocaleString('id-ID')})
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={userPoints === 0}
                        onClick={() => {
                          if (userPoints === 0) {
                            toast.info('Anda belum memiliki saldo poin.');
                            return;
                          }
                          setUsePoints(!usePoints);
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          userPoints === 0
                            ? 'bg-neutral-100 opacity-50 cursor-not-allowed'
                            : usePoints
                            ? 'bg-pink-500'
                            : 'bg-neutral-200'
                        }`}
                      >
                        <motion.div
                          animate={{ x: usePoints ? 26 : 2 }}
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="pt-6 border-t border-neutral-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3 pl-1">
                      Metode Pembayaran
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('MIDTRANS')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                          paymentMethod === 'MIDTRANS' ? 'border-pink-500 bg-pink-50/20 shadow-sm' : 'border-neutral-100 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black text-neutral-900">Pembayaran Online (Midtrans)</p>
                          {paymentMethod === 'MIDTRANS' && <CheckCircle2 size={16} className="text-pink-500" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                          QRIS (BCA/GoPay/OVO), VA Bank Transfer, Kartu Kredit
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('WALLET')}
                        className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                          paymentMethod === 'WALLET' ? 'border-pink-500 bg-pink-50/20 shadow-sm' : 'border-neutral-100 bg-white'
                        } ${Number(wallet?.balance || 0) < total ? 'opacity-60' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-black text-neutral-900">Zelvira Wallet</p>
                          {paymentMethod === 'WALLET' && <CheckCircle2 size={16} className="text-pink-500" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                          Saldo: Rp {Number(wallet?.balance || 0).toLocaleString('id-ID')}
                        </p>
                        {Number(wallet?.balance || 0) < total && (
                          <p className="text-[9px] text-rose-500 font-bold mt-1">Saldo tidak mencukupi</p>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50/80 rounded-2xl p-4 flex gap-3 border border-amber-200/60">
                    <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                      {paymentMethod === 'WALLET'
                        ? 'Saldo Zelvira Wallet Anda akan langsung terpotong secara otomatis begitu pesanan dikonfirmasi.'
                        : 'Setelah klik "Konfirmasi & Bayar Sekarang", jendela pembayaran Midtrans akan terbuka untuk menyelesaikan pembayaran secara aman.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex justify-between mt-10 pt-6 border-t border-neutral-100">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 rounded-2xl font-black text-xs text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
                  >
                    Kembali
                  </button>
                ) : (
                  <div />
                )}

                {currentStep === 0 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-pink-200 transition-all flex items-center gap-2"
                  >
                    <span>Lanjut ke Review & Bayar</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="px-8 py-3.5 rounded-2xl bg-neutral-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-neutral-900/10 transition-all flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                        <span>Memproses Pesanan...</span>
                      </>
                    ) : (
                      <>
                        <span>Konfirmasi & Bayar Sekarang</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Col: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-xl shadow-black/5 sticky top-28 space-y-6">
              <h3 className="text-base font-black text-neutral-900 uppercase tracking-tight pb-4 border-b border-neutral-100">
                Ringkasan Pesanan
              </h3>

              <div className="space-y-4 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 text-xs">
                    <img
                      src={formatImageUrl(item.imageUrl || '/logo.png')}
                      alt={item.productName || 'Produk'}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-neutral-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-bold mt-0.5">
                        {item.quantity || 1}x · Rp {Number(item.discountPrice || item.price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <span className="font-black text-neutral-900 text-xs shrink-0">
                      Rp {(Number(item.discountPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>Subtotal Produk</span>
                  <span className="font-bold text-neutral-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>Ongkos Kirim</span>
                  <span className="font-bold text-neutral-900">
                    {shippingCost > 0 ? `Rp ${shippingCost.toLocaleString('id-ID')}` : 'Pilih Kurir'}
                  </span>
                </div>

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-pink-600 font-medium">
                    <span>Diskon Voucher ({appliedVoucher?.code})</span>
                    <span className="font-bold">-Rp {voucherDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Diskon Poin ({pointsToUse} Poin)</span>
                    <span className="font-bold">-Rp {pointsDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-100 flex justify-between items-baseline">
                  <span className="font-black text-sm text-neutral-900">Total Pembayaran</span>
                  <span className="font-black text-xl text-pink-600">
                    Rp {total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Voucher Selector Modal */}
      <AnimatePresence>
        {showVoucherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                    <Ticket size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-neutral-900">Voucher Tersedia</h3>
                    <p className="text-[11px] text-neutral-400">Pilih salah satu voucher untuk mendapatkan diskon</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-3 flex-1 scrollbar-thin">
                {availableVouchers.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-xs">
                    Tidak ada voucher yang tersedia saat ini.
                  </div>
                ) : (
                  availableVouchers.map((v) => {
                    const isSelected = appliedVoucher?.id === v.id;
                    const isEligible = !v.minPurchase || subtotal >= v.minPurchase;
                    const discountText = (v.discountType || 'FIXED').toUpperCase() === 'PERCENTAGE'
                      ? `Diskon ${v.discountAmount}%${v.maxDiscount ? ` (Maks. Rp ${v.maxDiscount.toLocaleString('id-ID')})` : ''}`
                      : `Potongan Rp ${Number(v.discountAmount).toLocaleString('id-ID')}`;

                    return (
                      <div
                        key={v.id}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50/30'
                            : isEligible
                            ? 'border-neutral-100 hover:border-pink-200 bg-white'
                            : 'border-neutral-100 bg-neutral-50/60 opacity-60'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-neutral-900 uppercase tracking-wider">{v.code}</span>
                            {isSelected && (
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-pink-100 text-pink-600 rounded">
                                Terpilih
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-pink-600 mt-0.5">{discountText}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Min. Belanja: Rp {(v.minPurchase || 0).toLocaleString('id-ID')}
                            {v.validUntil ? ` · Berlaku s/d ${new Date(v.validUntil).toLocaleDateString('id-ID')}` : ''}
                          </p>
                          {!isEligible && (
                            <p className="text-[10px] text-amber-600 font-medium mt-1">
                              Belanja Anda kurang Rp {((v.minPurchase || 0) - subtotal).toLocaleString('id-ID')} lagi untuk memakai voucher ini
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={!isEligible}
                          onClick={() => handleSelectVoucher(v)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            isSelected
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : isEligible
                              ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm'
                              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          }`}
                        >
                          {isSelected ? 'Lepas' : 'Gunakan'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
