'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Package, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { OrderService } from '@/services/order.service';

function FinishContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [syncStatus, setSyncStatus] = useState<'verifying' | 'success' | 'pending' | 'idle'>('verifying');
  const [syncedOrder, setSyncedOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      setSyncStatus('idle');
      return;
    }

    let isMounted = true;
    const verifyPayment = async () => {
      try {
        const order = await OrderService.syncPaymentByNumber(orderId);
        if (!isMounted) return;
        setSyncedOrder(order);
        if (order && (order.status === 'PAID' || order.status === 'PROCESSING')) {
          setSyncStatus('success');
        } else {
          setSyncStatus('pending');
        }
      } catch (err) {
        console.error('Error verifying payment on finish page:', err);
        if (isMounted) setSyncStatus('idle');
      }
    };

    verifyPayment();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleRetrySync = async () => {
    if (!orderId) return;
    setSyncStatus('verifying');
    try {
      const order = await OrderService.syncPaymentByNumber(orderId);
      setSyncedOrder(order);
      if (order && (order.status === 'PAID' || order.status === 'PROCESSING')) {
        setSyncStatus('success');
      } else {
        setSyncStatus('pending');
      }
    } catch {
      setSyncStatus('idle');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      {syncStatus === 'verifying' ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-pink-100">
            <Loader2 size={48} className="text-pink-500 animate-spin" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 mb-3 tracking-tight">Memverifikasi Pembayaran...</h1>
          <p className="text-neutral-500 mb-8 max-w-sm font-medium">
            Sedang memeriksa konfirmasi transaksi dengan Midtrans. Mohon tunggu sebentar...
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className={`w-24 h-24 ${syncStatus === 'pending' ? 'bg-amber-500 shadow-amber-200' : 'bg-green-500 shadow-green-200'} rounded-full flex items-center justify-center mb-8 shadow-2xl`}
          >
            <CheckCircle2 size={48} className="text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight">
            {syncStatus === 'pending' ? 'Pembayaran Sedang Diproses' : 'Payment Successful! 🎉'}
          </h1>
          <p className="text-neutral-500 mb-10 max-w-sm font-medium">
            {syncStatus === 'pending' 
              ? `Pesanan ${orderId ? `#${orderId}` : ''} sedang menunggu verifikasi akhir dari penyedia pembayaran.`
              : `Terima kasih! Pesanan ${orderId ? `#${orderId}` : ''} telah berhasil dikonfirmasi dan langsung diproses.`}
          </p>

          {syncStatus === 'pending' && (
            <div className="mb-6">
              <button
                onClick={handleRetrySync}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all"
              >
                <RefreshCw size={14} /> Cek Ulang Status Sekarang
              </button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/orders">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2"
              >
                <Package size={20} /> View My Orders
              </motion.button>
            </Link>
            <Link href="/">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="bg-white text-neutral-900 border border-neutral-200 px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2"
              >
                Return Home <ArrowRight size={20} />
              </motion.button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentFinishPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    }>
      <FinishContent />
    </Suspense>
  );
}
