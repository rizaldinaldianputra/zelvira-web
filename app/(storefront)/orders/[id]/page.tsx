'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ExternalLink,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Printer,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  Tag,
  Wallet,
  Phone,
  User,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { OrderService } from '@/services/order.service';
import { OrderWorkflowService, WorkflowTask } from '@/services/order-workflow.service';
import { Order, OrderItem } from '@/types/order';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { OrderInvoiceModal } from '@/components/storefront/OrderInvoiceModal';
import { formatImageUrl } from '@/lib/url-utils';
import { ShippingService, TrackingResult } from '@/services/shipping.service';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [task, setTask] = useState<WorkflowTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Action State
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [complaintNotes, setComplaintNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedResi, setCopiedResi] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const fetchLiveTracking = async (trackingNo: string, courierName?: string, phone?: string) => {
    if (!trackingNo) return;
    setIsTrackingLoading(true);
    try {
      const res = await ShippingService.trackWaybill(trackingNo, courierName || 'jne', phone);
      setTrackingResult(res);
    } catch (e) {
      console.error('Failed to fetch tracking waybill', e);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const orderData = await OrderService.getById(id as string);
      setOrder(orderData);

      if (orderData?.trackingNumber) {
        fetchLiveTracking(orderData.trackingNumber, orderData.shippingService || orderData.courier, orderData.shippingPhone);
      }

      // Fetch user tasks to see if there's a pending confirmation/complaint for this order
      const tasks = await OrderWorkflowService.getUserTasks();
      const orderTask = tasks.find(t => t.variables.orderId === orderData.id);
      setTask(orderTask || null);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memuat rincian pesanan', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncStatus = async () => {
    if (!order) return;
    setIsSyncing(true);
    try {
      const updated = await OrderService.syncPayment(order.id);
      if (updated && (updated.status === 'PAID' || updated.status === 'PROCESSING')) {
        toast({ title: 'Pembayaran Lunas! 🎉', description: 'Status pembayaran berhasil dikonfirmasi ke Midtrans.' });
      } else {
        toast({ title: 'Status: ' + (updated?.status || 'PENDING'), description: 'Jika Anda baru saja transfer, mohon tunggu 1-2 menit lalu klik periksa kembali.' });
      }
      setOrder(updated);
    } catch {
      toast({ title: 'Gagal', description: 'Gagal memeriksa status ke Midtrans', variant: 'destructive' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePayNow = () => {
    if (!order?.paymentToken) {
      toast({ title: 'Token Pembayaran Hilang', description: 'Silakan hubungi customer service kami.', variant: 'destructive' });
      return;
    }
    if (typeof window !== 'undefined' && (window as any).snap) {
      (window as any).snap.pay(order.paymentToken, {
        onSuccess: async function () {
          toast({ title: 'Pembayaran Berhasil! 🎉', description: 'Terima kasih atas pembayaran Anda.' });
          try {
            await OrderService.syncPayment(order.id);
          } catch {}
          fetchData();
        },
        onPending: async function () {
          toast({ title: 'Menunggu Pembayaran', description: 'Silakan selesaikan pembayaran Anda.' });
          try {
            await OrderService.syncPayment(order.id);
          } catch {}
          fetchData();
        },
        onError: function () {
          toast({ title: 'Pembayaran Gagal', description: 'Pembayaran dibatalkan atau gagal.', variant: 'destructive' });
        }
      });
    } else {
      toast({ title: 'Sistem Pembayaran Memuat', description: 'Mohon tunggu 2 detik lalu klik lagi.', variant: 'default' });
    }
  };

  const copyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(true);
    toast({ title: 'Nomor Resi Disalin', description: resi });
    setTimeout(() => setCopiedResi(false), 2000);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAction = async (outcome: 'confirm' | 'complaint') => {
    if (!task) return;
    setIsProcessing(true);
    try {
      await OrderWorkflowService.completeTask(task.id, { 
        outcome,
        complaintNotes: outcome === 'complaint' ? complaintNotes : ''
      });
      toast({ title: 'Berhasil', description: outcome === 'confirm' ? 'Pesanan dikonfirmasi selesai!' : 'Komplain telah diajukan ke CS.' });
      setShowComplaintDialog(false);
      fetchData();
    } catch (error) {
      toast({ title: 'Gagal', description: 'Gagal memproses aksi', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { color: 'bg-amber-500', icon: Clock, label: 'Menunggu Pembayaran' };
      case 'PAID': return { color: 'bg-emerald-500', icon: CheckCircle2, label: 'Pembayaran Lunas' };
      case 'PROCESSING': return { color: 'bg-blue-500', icon: Package, label: 'Sedang Dikemas' };
      case 'DELIVERING': return { color: 'bg-pink-500', icon: Truck, label: 'Dalam Pengiriman' };
      case 'COMPLETED': return { color: 'bg-slate-900', icon: CheckCircle2, label: 'Pesanan Selesai' };
      case 'CANCELLED': return { color: 'bg-rose-500', icon: AlertCircle, label: 'Dibatalkan' };
      default: return { color: 'bg-neutral-400', icon: Package, label: status };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const subtotalItems = (order.items || []).reduce((acc, it) => acc + (it.quantity || it.qty || 1) * it.price, 0);
  const shippingCost = order.shippingAmount || 0;
  const voucherDiscount = order.voucherDiscountAmount || 0;
  const pointsDiscount = order.pointsDiscountAmount || 0;
  const walletUsed = order.walletAmountUsed || 0;
  const grandTotal = order.totalAmount || order.total || (subtotalItems + shippingCost - voucherDiscount - pointsDiscount - walletUsed);

  const trackingSteps = [
    {
      title: 'Pesanan Dibuat',
      desc: 'Pesanan berhasil dibuat di sistem Zelixa.',
      completed: true,
      active: false,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Selesai'
    },
    {
      title: 'Pembayaran Terverifikasi',
      desc: order.status === 'PENDING' ? 'Menunggu pembayaran dari pelanggan melalui Midtrans.' : 'Pembayaran terkonfirmasi lunas.',
      completed: order.status !== 'PENDING' && order.status !== 'CANCELLED',
      active: order.status === 'PENDING',
      date: order.status !== 'PENDING' ? 'Terverifikasi' : 'Menunggu'
    },
    {
      title: 'Sedang Dikemas (Packing)',
      desc: 'Pesanan sedang dipersiapkan dan diperiksa oleh tim gudang.',
      completed: ['PROCESSING', 'DELIVERING', 'COMPLETED'].includes(order.status),
      active: order.status === 'PROCESSING',
      date: ['PROCESSING', 'DELIVERING', 'COMPLETED'].includes(order.status) ? 'Diproses' : 'Pending'
    },
    {
      title: 'Dalam Pengiriman',
      desc: order.trackingNumber ? `Diserahkan ke kurir (${order.shippingService || order.courier || 'Ekspedisi'}). Resi: ${order.trackingNumber}` : 'Menunggu paket dijemput kurir.',
      completed: ['DELIVERING', 'COMPLETED'].includes(order.status),
      active: order.status === 'DELIVERING',
      date: order.status === 'DELIVERING' ? 'Dalam Perjalanan' : order.status === 'COMPLETED' ? 'Tiba di Tujuan' : 'Pending'
    },
    {
      title: 'Pesanan Diterima',
      desc: 'Paket telah sampai di tangan pembeli dengan selamat.',
      completed: order.status === 'COMPLETED',
      active: false,
      date: order.status === 'COMPLETED' ? 'Selesai' : 'Estimasi Tiba'
    }
  ];

  return (
    <>
      <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
          ? 'https://app.midtrans.com/snap/snap.js' 
          : 'https://app.sandbox.midtrans.com/snap/snap.js'}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-neutral-50 py-12 md:py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Navigation & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <Link href="/orders" className="inline-flex items-center gap-2 text-neutral-400 font-bold text-xs mb-3 hover:text-pink-500 transition-colors">
                <ChevronLeft size={16} /> Kembali ke Riwayat Pesanan
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
                  Rincian Pesanan
                </h1>
                <span className="font-mono text-sm font-bold bg-neutral-200 text-neutral-800 px-3 py-1 rounded-xl">
                  #{order.orderNumber || `SHZ-${order.id}`}
                </span>
              </div>
              <p className="text-neutral-500 text-xs font-medium mt-1">
                Waktu Transaksi: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {order.status === 'PENDING' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSyncStatus}
                    disabled={isSyncing}
                    className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs shadow-sm h-11"
                  >
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Memeriksa...' : 'Cek Status Pembayaran'}
                  </Button>
                  <Button
                    onClick={handlePayNow}
                    className="rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200 h-11 px-5"
                  >
                    Bayar Sekarang
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => setShowInvoiceModal(true)}
                className="rounded-2xl border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs gap-2 h-11 shadow-sm"
              >
                <Printer size={15} className="text-pink-500" />
                Cetak / Download Invoice
              </Button>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`inline-flex items-center gap-2 ${statusConfig.color} text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md`}
              >
                <statusConfig.icon size={15} /> {statusConfig.label}
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Tracking & Address & Payment */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tracking & Timeline Card */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-xl shadow-black/5 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-neutral-100">
                  <div>
                    <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2.5">
                      <Truck className="text-pink-500" size={20} /> Status Pelacakan Paket
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      Ekspedisi: <strong className="text-neutral-800">{order.shippingService || order.courier || 'Ekspedisi Reguler'}</strong>
                    </p>
                  </div>

                  {order.trackingNumber ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-200">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">No. Resi Pengiriman</span>
                          <span className="font-mono text-xs font-black text-neutral-900">{order.trackingNumber}</span>
                        </div>
                        <button
                          onClick={() => copyResi(order.trackingNumber!)}
                          className="ml-2 p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors"
                          title="Salin Resi"
                        >
                          {copiedResi ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchLiveTracking(order.trackingNumber!, order.shippingService || order.courier, order.shippingPhone)}
                        disabled={isTrackingLoading}
                        className="h-11 px-3 rounded-2xl border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold gap-1.5 shadow-sm"
                        title="Perbarui pelacakan posisi paket langsung dari kurir"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTrackingLoading ? 'animate-spin text-pink-500' : 'text-neutral-600'}`} />
                        <span>{isTrackingLoading ? 'Melacak...' : 'Lacak Resi'}</span>
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="border-neutral-200 text-neutral-400 font-bold text-[10px] uppercase">
                      Resi Dalam Persiapan
                    </Badge>
                  )}
                </div>

                {/* Vertical Stepper Timeline */}
                <div className="relative pl-2 sm:pl-4">
                  <div className="space-y-8">
                    {trackingSteps.map((step, idx) => (
                      <div key={idx} className="relative flex items-start gap-4 sm:gap-6 group">
                        {/* Timeline Connector Line */}
                        {idx < trackingSteps.length - 1 && (
                          <div className={`absolute left-3 sm:left-3.5 top-7 bottom-0 w-0.5 ${step.completed ? 'bg-pink-500' : 'bg-neutral-200'}`} />
                        )}

                        {/* Step Circle Indicator */}
                        <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white shadow-sm transition-all ${
                          step.completed ? 'bg-pink-500 text-white' : step.active ? 'bg-pink-100 text-pink-600 border-2 border-pink-500' : 'bg-neutral-200 text-neutral-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <span className="text-[10px] font-black">{idx + 1}</span>
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 pb-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className={`text-sm font-black uppercase tracking-wider ${
                              step.active ? 'text-pink-600' : step.completed ? 'text-neutral-900' : 'text-neutral-400'
                            }`}>
                              {step.title}
                            </h4>
                            <span className={`text-[10px] font-bold ${step.completed ? 'text-pink-600' : 'text-neutral-400'}`}>
                              {step.date}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Courier Manifest / Tracking Checkpoints */}
                {order.trackingNumber && (
                  <div className="pt-6 border-t border-neutral-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                        <MapPin size={15} className="text-pink-500" />
                        Riwayat Perjalanan Ekspedisi Real-Time
                      </h3>
                      {trackingResult?.delivery_status?.status ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1">
                          Status Kurir: {trackingResult.delivery_status.status}
                        </Badge>
                      ) : trackingResult?.summary?.status ? (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1">
                          Status: {trackingResult.summary.status}
                        </Badge>
                      ) : null}
                    </div>

                    {isTrackingLoading ? (
                      <div className="flex items-center justify-center p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                          <RefreshCw className="w-4 h-4 animate-spin text-pink-500" />
                          <span>Menghubungkan ke server ekspedisi {order.shippingService || order.courier || 'kurir'}...</span>
                        </div>
                      </div>
                    ) : trackingResult?.manifest && trackingResult.manifest.length > 0 ? (
                      <div className="space-y-3 bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100">
                        {trackingResult.manifest.map((item, mIdx) => (
                          <div key={mIdx} className="flex items-start gap-3.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 mt-1.5 shrink-0 ring-4 ring-pink-100" />
                            <div className="flex-1 pb-2 border-b border-neutral-200/60 last:border-0 last:pb-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-neutral-400 font-semibold">
                                <span className="text-neutral-700 font-bold">
                                  {item.city_name ? `[${item.city_name}]` : ''}
                                </span>
                                <span>{item.manifest_date} {item.manifest_time}</span>
                              </div>
                              <p className="text-neutral-900 font-bold mt-1 leading-snug">
                                {item.manifest_description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Resi Telah Diterbitkan ({order.shippingService || order.courier || 'Kurir'})</p>
                          <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                            Nomor resi <strong className="font-mono">{order.trackingNumber}</strong> telah tercatat di sistem toko. Data riwayat pelacakan posisi diperbarui oleh pihak ekspedisi begitu paket tiba di drop point atau hub sortir pertama. Silakan klik tombol <strong>"Lacak Resi"</strong> untuk menyinkronkan data terbaru.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Camunda Workflow Complete / Complaint Action Buttons */}
                {task && (
                  <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row gap-4">
                    <Button 
                      className="flex-1 h-14 rounded-2xl bg-neutral-900 text-white font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-neutral-900/10"
                      onClick={() => handleAction('confirm')}
                      disabled={isProcessing}
                    >
                      Konfirmasi Barang Diterima
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-rose-200 text-rose-600 font-bold uppercase tracking-widest hover:bg-rose-50"
                      onClick={() => setShowComplaintDialog(true)}
                      disabled={isProcessing}
                    >
                      Ajukan Komplain / Retur
                    </Button>
                  </div>
                )}
              </div>

              {/* Shipping Address & Recipient Card */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-xl shadow-black/5 space-y-6">
                <h3 className="text-base font-black text-neutral-900 flex items-center gap-2 pb-4 border-b border-neutral-100">
                  <MapPin className="text-blue-500" size={18} /> Alamat Pengiriman
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">Nama Penerima</span>
                    <p className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                      <User size={14} className="text-neutral-400" />
                      {order.shippingRecipient || 'Nama Pelanggan Terdaftar'}
                    </p>
                    {order.shippingPhone && (
                      <p className="text-neutral-600 font-medium flex items-center gap-1.5 pt-0.5">
                        <Phone size={13} className="text-neutral-400" />
                        {order.shippingPhone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">Tujuan Pengiriman</span>
                    <p className="text-neutral-700 leading-relaxed font-medium">
                      {order.shippingAddress || 'Alamat pengiriman terdaftar pada akun Anda.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method & Transaction Breakdown Card */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-xl shadow-black/5 space-y-6">
                <h3 className="text-base font-black text-neutral-900 flex items-center gap-2 pb-4 border-b border-neutral-100">
                  <CreditCard className="text-pink-500" size={18} /> Metode Pembayaran & Rincian Transaksi
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">Kanal Pembayaran</span>
                    <p className="text-sm font-bold text-neutral-900">
                      {order.paymentMethod || 'Midtrans Payment Gateway (QRIS, VA, E-Wallet)'}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Status: <strong className={order.status === 'PENDING' ? 'text-amber-600' : 'text-emerald-600'}>
                        {order.status === 'PENDING' ? 'Menunggu Pembayaran' : 'Terverifikasi Lunas'}
                      </strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">Jaminan Belanja</span>
                    <div className="flex items-center gap-1.5 text-neutral-800 font-bold">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <span>Transaksi Dilindungi Zelixa</span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Dana diteruskan ke penjual setelah pesanan Anda tiba dan diverifikasi dengan aman.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Items Detail & Cost Summary */}
            <div className="lg:col-span-1 space-y-8">
              {/* Items Card */}
              <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white space-y-6 sticky top-24 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Package className="text-pink-500" size={18} /> Daftar Produk ({order.items?.length || 0})
                  </h3>
                </div>

                {/* Items List */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="flex gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/40 transition-colors">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
                        <img
                          src={formatImageUrl(item.imageUrl || item.img || '/placeholder.png')}
                          alt={item.productName || item.name || 'Produk'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate text-white leading-tight">
                          {item.productName || item.name}
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-medium mt-1">
                          {item.color && <span>{item.color}</span>}
                          {item.color && item.size && <span> · </span>}
                          {item.size && <span>{item.size}</span>}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-neutral-400 font-bold">Qty: {item.quantity || item.qty || 1}</span>
                          <span className="text-xs font-black text-pink-400">
                            Rp {((item.quantity || item.qty || 1) * item.price).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Breakdown Breakdown */}
                <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal Produk</span>
                    <span className="font-bold text-white">Rp {subtotalItems.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Ongkos Kirim ({order.shippingService || 'Kurir'})</span>
                    <span className="font-bold text-white">Rp {shippingCost.toLocaleString('id-ID')}</span>
                  </div>

                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Diskon Voucher ({order.voucherCode || 'PROMO'})</span>
                      <span>- Rp {voucherDiscount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-amber-400 font-bold">
                      <span>Diskon Poin ({order.pointsUsed || 0} Poin)</span>
                      <span>- Rp {pointsDiscount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {walletUsed > 0 && (
                    <div className="flex justify-between text-blue-400 font-bold">
                      <span>Saldo Wallet Terpakai</span>
                      <span>- Rp {walletUsed.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">Total Akhir</span>
                      <span className="text-2xl font-black text-pink-500">
                        Rp {grandTotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Invoice Button at Sidebar Bottom */}
                <Button
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full h-12 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <Printer size={15} className="text-pink-500" />
                  Cetak / Simpan Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Dialog */}
        <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
          <DialogContent className="rounded-[2.5rem] sm:max-w-[425px]">
            <DialogHeader className="gap-2">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <AlertCircle className="text-rose-500 h-6 w-6" />
                Ajukan Komplain / Retur
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium text-xs">
                Mohon jelaskan kendala paket (produk rusak, salah ukuran/varian, atau barang kurang). Tim CS kami akan segera membantu.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid gap-3">
                <Label htmlFor="notes" className="font-black text-slate-700 uppercase tracking-widest text-[10px]">
                  Catatan Komplain
                </Label>
                <textarea
                  id="notes"
                  className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-pink-500 transition-all outline-none"
                  placeholder="Ceritakan detail kendala yang dialami..."
                  value={complaintNotes}
                  onChange={(e) => setComplaintNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                className="rounded-2xl h-11 flex-1 font-bold" 
                onClick={() => setShowComplaintDialog(false)}
              >
                Batal
              </Button>
              <Button 
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl h-11 flex-1 font-black uppercase tracking-wider" 
                onClick={() => handleAction('complaint')}
                disabled={isProcessing || !complaintNotes}
              >
                {isProcessing ? 'Mengirim...' : 'Kirim Komplain'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Official Printable & Downloadable Invoice Modal */}
        <OrderInvoiceModal
          order={order}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      </div>
    </>
  );
}
