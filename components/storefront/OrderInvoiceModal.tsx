'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  MapPin,
  Package,
  Receipt
} from 'lucide-react';
import { Order, OrderItem } from '@/types/order';

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
}

export function OrderInvoiceModal({
  order,
  isOpen,
  onClose,
  customerName = 'Pelanggan Setia'
}: OrderInvoiceModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = order.status !== 'PENDING' && order.status !== 'CANCELLED';
  const subtotalItems = (order.items || []).reduce(
    (acc, it) => acc + (it.quantity || it.qty || 1) * it.price,
    0
  );
  const shippingCost = order.shippingAmount || 0;
  const voucherDiscount = order.voucherDiscountAmount || 0;
  const pointsDiscount = order.pointsDiscountAmount || 0;
  const walletUsed = order.walletAmountUsed || 0;
  const grandTotal = order.totalAmount || order.total || (subtotalItems + shippingCost - voucherDiscount - pointsDiscount - walletUsed);

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('id-ID');

  const invoiceNumber = `INV/${order.orderNumber || `SHZ-${order.id}`}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto no-print">
        {/* Style block for print isolation */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-invoice, #printable-invoice * {
                visibility: visible !important;
              }
              #printable-invoice {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 24px !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl my-8 bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Modal Controls (Hidden in Print) */}
          <div className="no-print bg-neutral-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-pink-500" />
              <span className="text-xs font-black uppercase tracking-widest text-neutral-300">
                Invoice Resmi Pembelian
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Printer size={14} /> Cetak / Unduh PDF
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-neutral-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div id="printable-invoice" className="p-8 md:p-12 overflow-y-auto space-y-8 flex-1 bg-white text-neutral-900">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-neutral-200">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="Zelixa Logo"
                    className="h-10 w-auto object-contain"
                  />
                  <div>
                    <h2 className="text-xl font-black text-neutral-900 tracking-tight">ZELIXA OFFICIAL STORE</h2>
                    <p className="text-[11px] text-neutral-500 font-medium">Platform Belanja Fashion & Lifestyle Resmi</p>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium pt-1">
                  Website: https://zelvira.my.id · Email: support@zelvira.com
                </p>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                  Nomor Tagihan / Invoice
                </span>
                <h3 className="text-lg font-black text-neutral-900 font-mono tracking-tight">
                  {invoiceNumber}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  {formattedDate}
                </p>
                <div className="pt-1">
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 size={12} /> Lunas (Paid)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                      <Clock size={12} /> Menunggu Pembayaran
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info Penerima & Pengiriman */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                  Informasi Pembeli & Tujuan
                </span>
                <p className="font-bold text-neutral-900 text-sm">
                  {order.shippingRecipient || customerName}
                </p>
                {order.shippingPhone && (
                  <p className="text-neutral-600 font-medium">
                    Telp: {order.shippingPhone}
                  </p>
                )}
                <p className="text-neutral-600 leading-relaxed font-medium">
                  {order.shippingAddress || 'Alamat Terdaftar Pembeli'}
                </p>
              </div>

              <div className="space-y-2 sm:border-l sm:border-neutral-200 sm:pl-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                  Informasi Pengiriman & Pembayaran
                </span>
                <div className="flex items-center gap-2 text-neutral-800 font-bold">
                  <Truck size={14} className="text-pink-500 shrink-0" />
                  <span>Kurir: {order.shippingService || order.courier || 'Ekspedisi Standar'}</span>
                </div>
                {order.trackingNumber ? (
                  <div className="p-2 rounded-lg bg-white border border-neutral-200 font-mono text-[11px] font-bold text-neutral-900">
                    No. Resi: <span className="text-pink-600">{order.trackingNumber}</span>
                  </div>
                ) : (
                  <p className="text-neutral-500 italic">No. Resi: Menunggu diterbitkan oleh staf gudang</p>
                )}
                <div className="flex items-center gap-2 text-neutral-700 pt-1">
                  <CreditCard size={14} className="text-neutral-400 shrink-0" />
                  <span className="font-medium">
                    Metode Bayar: <strong>{order.paymentMethod || 'Midtrans Gateway (QRIS/VA/E-Wallet)'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                Rincian Barang yang Dipesan
              </span>

              <div className="overflow-x-auto rounded-2xl border border-neutral-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 font-black uppercase text-[10px] tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-3.5">Produk</th>
                      <th className="p-3.5 text-center">Varian</th>
                      <th className="p-3.5 text-center">Qty</th>
                      <th className="p-3.5 text-right">Harga Satuan</th>
                      <th className="p-3.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {(order.items || []).map((item: OrderItem, idx: number) => {
                      const qty = item.quantity || item.qty || 1;
                      const itemTotal = qty * item.price;
                      return (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-3.5 font-bold text-neutral-900">
                            {item.productName || item.name || 'Produk Zelixa'}
                            {item.groupName && (
                              <span className="block text-[10px] text-pink-600 font-normal">
                                {item.groupName}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center text-neutral-500 font-medium">
                            {item.size || item.color ? `${item.color || ''} ${item.size ? `(${item.size})` : ''}` : '-'}
                          </td>
                          <td className="p-3.5 text-center font-bold text-neutral-800">
                            {qty}
                          </td>
                          <td className="p-3.5 text-right text-neutral-700">
                            Rp {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 text-right font-black text-neutral-900">
                            Rp {itemTotal.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-neutral-200">
              <div className="max-w-xs space-y-2">
                <p className="text-[11px] font-bold text-neutral-700">
                  Status Garansi & Retur:
                </p>
                <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                  Pesanan dilindungi garansi resmi Zelixa. Harap rekam video unboxing saat paket tiba untuk keperluan klaim komplain.
                </p>
              </div>

              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal Produk:</span>
                  <span className="font-bold">Rp {subtotalItems.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Biaya Pengiriman (Ongkir):</span>
                  <span className="font-bold">Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Diskon Voucher ({order.voucherCode || 'PROMO'}):</span>
                    <span>- Rp {voucherDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-bold">
                    <span>Diskon Poin:</span>
                    <span>- Rp {pointsDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {walletUsed > 0 && (
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>Saldo Wallet Dipakai:</span>
                    <span>- Rp {walletUsed.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="pt-3 border-t-2 border-neutral-900 flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                    Total Pembayaran:
                  </span>
                  <span className="text-xl font-black text-pink-600">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-6 border-t border-neutral-100 text-center text-[10px] text-neutral-400 font-medium space-y-1">
              <p>Terima kasih atas kepercayaan Anda berbelanja di Zelixa Official.</p>
              <p className="italic">Invoice ini sah dan diproses otomatis oleh sistem komputer.</p>
            </div>
          </div>

          {/* Modal Bottom Action (Hidden in Print) */}
          <div className="no-print p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium pl-2">
              Klik cetak untuk menyimpan sebagai file PDF atau mencetak fisik.
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition-all"
              >
                Tutup
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <Download size={14} /> Download / Print PDF
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

