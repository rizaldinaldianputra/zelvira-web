'use client';

import { useState, useEffect } from 'react';
import { walletService, WalletInfo } from '@/services/wallet.service';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Coins, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isProcessingTopup, setIsProcessingTopup] = useState(false);

  useEffect(() => {
    fetchWalletInfo();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const data = await walletService.getWalletInfo();
      setWallet(data);

      const pendingTopup = data?.recentTransactions?.find(
        (tx: any) => tx.type === 'TOPUP' && (tx.status === 'PENDING' || tx.status === 'pending')
      );
      if (pendingTopup?.id) {
        try {
          const verifyRes = await walletService.verifyTopup(pendingTopup.id);
          if (verifyRes?.status === 'SUCCESS') {
            const updated = await walletService.getWalletInfo();
            setWallet(updated);
          }
        } catch (e) {
          console.warn('[fetchWalletInfo] auto-verify topup error:', e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch wallet info', error);
      toast.error('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount < 10000) {
      toast.error('Minimum top-up amount is Rp 10.000');
      return;
    }

    setIsProcessingTopup(true);
    try {
      const result = await walletService.initiateTopup(amount);
      const transactionId = result?.id || result?.transactionId;

      const verifyAndRefresh = async () => {
        if (transactionId) {
          try {
            const vRes = await walletService.verifyTopup(transactionId);
            if (vRes?.status === 'SUCCESS') {
              toast.success(vRes.message || 'Top up berhasil diverifikasi!');
            }
          } catch (e) {
            console.warn('[verifyAndRefresh] topup verify:', e);
          }
        }
        await fetchWalletInfo();
      };

      if (result.token) {
        // Use Midtrans Snap
        (window as any).snap.pay(result.token, {
          onSuccess: async (res: any) => {
            setIsTopupModalOpen(false);
            await verifyAndRefresh();
          },
          onPending: async (res: any) => {
            toast.info('Top-up is pending. Please complete the payment.');
            setIsTopupModalOpen(false);
            await verifyAndRefresh();
          },
          onError: (res: any) => {
            toast.error('Top-up failed.');
          },
          onClose: async () => {
            await verifyAndRefresh();
          }
        });
      }
    } catch (error) {
      toast.error('Failed to initiate top-up');
    } finally {
      setIsProcessingTopup(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-neutral-900">My Wallet</h1>
          <p className="text-neutral-500">Manage your balance and loyalty points</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsTopupModalOpen(true)}
          className="bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-black/10"
        >
          <Plus size={20} /> Top Up
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-pink-200 overflow-hidden relative"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 opacity-80">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Wallet size={20} />
              </div>
              <span className="font-bold uppercase tracking-widest text-[10px]">Current Balance</span>
            </div>
            <h2 className="text-4xl font-black mb-2">Rp {wallet?.balance.toLocaleString('id-ID')}</h2>
            <p className="text-white/60 text-sm font-medium">Ready to spend on your next aesthetic find</p>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </motion.div>

        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-xl shadow-black/5 overflow-hidden relative"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                <Coins size={20} className="text-pink-500" />
              </div>
              <span className="font-bold uppercase tracking-widest text-[10px] text-neutral-400">Loyalty Points</span>
            </div>
            <h2 className="text-4xl font-black text-neutral-900 mb-2">{wallet?.points.toLocaleString('id-ID')} <span className="text-xl text-neutral-400">pts</span></h2>
            <p className="text-neutral-500 text-sm font-medium">Earn more points with every purchase</p>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-neutral-500" />
            </div>
            <h3 className="font-black text-neutral-900">Recent Transactions</h3>
          </div>
          <button className="text-xs font-bold text-pink-500 hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-neutral-50">
          {wallet?.recentTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-neutral-400 font-medium">No transactions yet</p>
            </div>
          ) : (
            wallet?.recentTransactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    tx.type === 'TOPUP' || tx.type === 'POINTS_EARNED' 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {tx.type === 'TOPUP' || tx.type === 'POINTS_EARNED' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{tx.description}</h4>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                      {new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${
                    tx.type === 'TOPUP' || tx.type === 'POINTS_EARNED' ? 'text-green-600' : 'text-neutral-900'
                  }`}>
                    {tx.type === 'TOPUP' || tx.type === 'PAYMENT' || tx.type === 'POINTS_REDEEMED' ? (
                      `${tx.type === 'TOPUP' ? '+' : '-'} Rp ${tx.amount.toLocaleString('id-ID')}`
                    ) : (
                      `+ ${tx.points} pts`
                    )}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-1">{tx.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top-up Modal */}
      <AnimatePresence>
        {isTopupModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTopupModalOpen(false)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[3rem] p-10 z-[201] shadow-2xl"
            >
              <h2 className="text-2xl font-black text-neutral-900 mb-2">Top Up Balance</h2>
              <p className="text-neutral-500 mb-8">Enter the amount you'd like to add</p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 block">Amount (Rp)</label>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-neutral-100 border-none rounded-2xl py-4 px-6 text-lg font-black focus:ring-2 focus:ring-pink-400 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[50000, 100000, 250000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(amt.toString())}
                      className="py-3 bg-neutral-50 hover:bg-pink-50 hover:text-pink-600 border border-neutral-100 rounded-xl text-xs font-bold transition-all"
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleTopup}
                  disabled={isProcessingTopup}
                  className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-neutral-200 hover:bg-pink-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessingTopup ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Top Up'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
